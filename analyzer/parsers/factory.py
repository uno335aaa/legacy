from __future__ import annotations

from pathlib import Path

from analyzer.parsers.base import LanguageParser, SupportedLanguage
from analyzer.parsers.c_parser import CParser
from analyzer.parsers.cpp_parser import CppParser
from analyzer.parsers.java_parser import JavaParser


def detect_language_from_path(file_path: str) -> SupportedLanguage:
    """
    拡張子から言語を推定します。

    最初の段階では拡張子ベースで十分です。
    Ingestion Agent が大量のファイルをさばく前提なので、
    ここは軽い処理にしておくほうが全体性能を保ちやすくなります。
    """

    suffix = Path(file_path).suffix.lower()

    if suffix == ".c":
        return "c"
    if suffix in {".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"}:
        return "cpp"
    if suffix == ".java":
        return "java"
    return "unknown"


def create_parser_for_file(file_path: str) -> LanguageParser | None:
    """
    ファイル拡張子に応じた parser を返します。

    未対応の言語は None を返し、呼び出し側でスキップできるようにします。
    """

    language = detect_language_from_path(file_path)

    if language == "c":
        return CParser()
    if language == "cpp":
        return CppParser()
    if language == "java":
        return JavaParser()
    return None
