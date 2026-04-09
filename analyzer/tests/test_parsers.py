from __future__ import annotations

import shutil
import textwrap
import unittest
import uuid
from contextlib import contextmanager
from pathlib import Path

from analyzer.parsers.factory import create_parser_for_file, detect_language_from_path


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


class ParserTests(unittest.TestCase):
    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(Path("analyzer") / ".tmp-tests", ignore_errors=True)

    def test_detect_language_from_path(self) -> None:
        self.assertEqual(detect_language_from_path("sample.c"), "c")
        self.assertEqual(detect_language_from_path("sample.cpp"), "cpp")
        self.assertEqual(detect_language_from_path("Sample.java"), "java")
        self.assertEqual(detect_language_from_path("README.md"), "unknown")

    def test_java_parser_extracts_class_method_and_relationships(self) -> None:
        source = textwrap.dedent(
            """
            package sample.service;
            import java.util.List;

            public class UserService extends BaseService implements Auditable, Runnable {
                public void createUser() {
                }
            }
            """
        ).strip()

        with create_workspace_temp_dir() as temp_dir:
            path = temp_dir / "UserService.java"
            path.write_text(source, encoding="utf-8")

            parser = create_parser_for_file(str(path))
            self.assertIsNotNone(parser)

            result = parser.parse_file(str(path))
            names = [symbol.name for symbol in result.symbols]
            self.assertIn("UserService", names)
            self.assertIn("createUser", names)
            relationship_pairs = {(item.relationship_type, item.to_name) for item in result.relationships}
            self.assertIn(("imports", "sample.service"), relationship_pairs)
            self.assertIn(("imports", "java.util.List"), relationship_pairs)
            self.assertIn(("extends", "BaseService"), relationship_pairs)
            self.assertIn(("implements", "Auditable"), relationship_pairs)
            self.assertIn(("implements", "Runnable"), relationship_pairs)

    def test_c_parser_extracts_include_and_function(self) -> None:
        source = textwrap.dedent(
            """
            #include "stdio.h"

            int main(void) {
                return 0;
            }
            """
        ).strip()

        with create_workspace_temp_dir() as temp_dir:
            path = temp_dir / "main.c"
            path.write_text(source, encoding="utf-8")

            parser = create_parser_for_file(str(path))
            self.assertIsNotNone(parser)

            result = parser.parse_file(str(path))
            names = [symbol.name for symbol in result.symbols]
            self.assertIn("main", names)
            self.assertEqual(result.relationships[0].relationship_type, "includes")

    def test_cpp_parser_extracts_class_and_inheritance(self) -> None:
        source = textwrap.dedent(
            """
            #include <vector>

            class Child : public Base {
            public:
                void run() {
                }
            };
            """
        ).strip()

        with create_workspace_temp_dir() as temp_dir:
            path = temp_dir / "child.cpp"
            path.write_text(source, encoding="utf-8")

            parser = create_parser_for_file(str(path))
            self.assertIsNotNone(parser)

            result = parser.parse_file(str(path))
            names = [symbol.name for symbol in result.symbols]
            self.assertIn("Child", names)
            self.assertIn("run", names)
            relationship_pairs = {(item.relationship_type, item.to_name) for item in result.relationships}
            self.assertIn(("includes", "vector"), relationship_pairs)
            self.assertIn(("extends", "Base"), relationship_pairs)


if __name__ == "__main__":
    unittest.main()
