from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from analyzer.parsers.factory import detect_language_from_path


@dataclass(slots=True)
class IndexedFile:
    """
    走査で見つけたファイルの要約情報です。

    解析エージェントの最初の仕事は
    「どのファイルを対象にするか」を決めることなので、
    まずは path / language / size に絞っています。
    """

    relative_path: str
    language: str
    size: int


class IngestionAgent:
    """
    入力ディレクトリを走査して、解析対象ファイルを列挙する最小エージェントです。

    ここではまだ LLM は使いません。
    まずは次の 3 つだけを責務にします。
    - ファイル一覧を集める
    - 不要ディレクトリを除外する
    - 拡張子から言語を推定する
    """

    ignored_directories = {".git", "node_modules", "dist", "build", "__pycache__"}

    def index_project(self, root_dir: str) -> list[IndexedFile]:
        """
        プロジェクト配下を再帰的に走査し、解析候補ファイルの一覧を返します。
        """

        root = Path(root_dir)
        indexed_files: list[IndexedFile] = []

        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if self._should_ignore(path):
                continue
            language = detect_language_from_path(path.as_posix())
            if language == "unknown":
                continue

            indexed_files.append(
                IndexedFile(
                    relative_path=path.relative_to(root).as_posix(),
                    language=language,
                    size=path.stat().st_size,
                )
            )

        return sorted(indexed_files, key=lambda item: item.relative_path)

    def _should_ignore(self, path: Path) -> bool:
        """
        生成物や依存パッケージなど、最初から解析対象外にしたいものを判定します。
        """

        return any(part in self.ignored_directories for part in path.parts)
