from __future__ import annotations

import re

from analyzer.parsers.base import LanguageParser, Relationship, Symbol


class CParser(LanguageParser):
    """
    C 向けの最小 parser です。

    まだ Tree-sitter ではなく、雛形として正規表現で
    「最低限ほしい情報」を拾う実装にしています。
    初期段階では、関数と include が取れるだけでも
    後続の設計書生成テストに使いやすくなります。
    """

    language = "c"

    _include_pattern = re.compile(r'^\s*#include\s+[<"]([^>"]+)[>"]', re.MULTILINE)
    _function_pattern = re.compile(
        r"^\s*[A-Za-z_][\w\s\*]*\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{",
        re.MULTILINE,
    )
    _struct_pattern = re.compile(r"^\s*struct\s+([A-Za-z_]\w*)", re.MULTILINE)

    def extract_symbols(self, source: str) -> list[Symbol]:
        symbols: list[Symbol] = []

        for match in self._struct_pattern.finditer(source):
            symbols.append(Symbol(name=match.group(1), symbol_type="struct", line=self.line_of(source, match.start())))

        for match in self._function_pattern.finditer(source):
            symbols.append(Symbol(name=match.group(1), symbol_type="function", line=self.line_of(source, match.start())))

        return symbols

    def extract_relationships(self, source: str) -> list[Relationship]:
        relationships: list[Relationship] = []

        for match in self._include_pattern.finditer(source):
            relationships.append(
                Relationship(
                    from_name="current_file",
                    to_name=match.group(1),
                    relationship_type="includes",
                    line=self.line_of(source, match.start()),
                )
            )

        return relationships
