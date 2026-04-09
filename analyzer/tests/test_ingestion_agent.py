from __future__ import annotations

import shutil
import unittest
import uuid
from contextlib import contextmanager
from pathlib import Path

from analyzer.agents.ingestion_agent import IngestionAgent


@contextmanager
def create_workspace_temp_dir() -> Path:
    """
    サンドボックス環境でも書き込めるよう、ワークスペース配下へ一時ディレクトリを作ります。
    """

    base_dir = Path("analyzer") / ".tmp-tests"
    base_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = base_dir / f"case-{uuid.uuid4().hex}"
    temp_dir.mkdir()
    try:
        yield temp_dir
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


class IngestionAgentTests(unittest.TestCase):
    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(Path("analyzer") / ".tmp-tests", ignore_errors=True)

    def test_index_project_ignores_common_generated_directories(self) -> None:
        with create_workspace_temp_dir() as temp_dir:
            root = temp_dir
            (root / "src").mkdir()
            (root / "node_modules").mkdir()
            (root / "src" / "Main.java").write_text("class Main {}", encoding="utf-8")
            (root / "node_modules" / "ignored.js").write_text("ignored", encoding="utf-8")

            agent = IngestionAgent()
            result = agent.index_project(str(root))

            self.assertEqual(len(result), 1)
            self.assertEqual(result[0].relative_path, "src/Main.java")
            self.assertEqual(result[0].language, "java")

    def test_index_project_collects_multiple_supported_languages(self) -> None:
        with create_workspace_temp_dir() as temp_dir:
            root = temp_dir
            (root / "src").mkdir()
            (root / "src" / "main.c").write_text("int main(void) { return 0; }", encoding="utf-8")
            (root / "src" / "service.cpp").write_text("class Service {};", encoding="utf-8")
            (root / "src" / "App.java").write_text("class App {}", encoding="utf-8")

            agent = IngestionAgent()
            result = agent.index_project(str(root))

            self.assertEqual([item.relative_path for item in result], ["src/App.java", "src/main.c", "src/service.cpp"])
            self.assertEqual([item.language for item in result], ["java", "c", "cpp"])


if __name__ == "__main__":
    unittest.main()
