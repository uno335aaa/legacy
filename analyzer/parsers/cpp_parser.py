from __future__ import annotations

import re

from analyzer.parsers.base import LanguageParser, Relationship, Symbol


class CppParser(LanguageParser):
    """
    C++ 向けの最小 parser です。

    class / struct / method / include に絞っており、
    解析精度よりも「後で置き換えやすい構造」に寄せています。
    """

    language = "cpp"

    _include_pattern = re.compile(r'^\s*#include\s+[<"]([^>"]+)[>"]', re.MULTILINE)
    _class_pattern = re.compile(r"^\s*(class|struct)\s+([A-Za-z_]\w*)", re.MULTILINE)
    _inheritance_pattern = re.compile(
        r"^\s*class\s+([A-Za-z_]\w*)\s*:\s*(public|protected|private)?\s*([A-Za-z_]\w*)",
        re.MULTILINE,
    )
    _method_pattern = re.compile(
        r"^\s*[A-Za-z_][\w:<>\s\*&~]*\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*(const)?\s*\{",
        re.MULTILINE,
    )

    def extract_symbols(self, source: str) -> list[Symbol]:
        symbols: list[Symbol] = []

        for match in self._class_pattern.finditer(source):
            symbol_type = "class" if match.group(1) == "class" else "struct"
            symbols.append(Symbol(name=match.group(2), symbol_type=symbol_type, line=self.line_of(source, match.start())))

        for match in self._method_pattern.finditer(source):
            symbols.append(Symbol(name=match.group(1), symbol_type="method", line=self.line_of(source, match.start())))

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

        for match in self._inheritance_pattern.finditer(source):
            relationships.append(
                Relationship(
                    from_name=match.group(1),
                    to_name=match.group(3),
                    relationship_type="extends",
                    line=self.line_of(source, match.start()),
                )
            )

        return relationships
