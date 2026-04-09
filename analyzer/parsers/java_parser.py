from __future__ import annotations

import re

from analyzer.parsers.base import LanguageParser, Relationship, Symbol


class JavaParser(LanguageParser):
    """
    Java 向けの最小 parser です。

    package / import / class / interface / method を対象にします。
    あくまで雛形なので、匿名クラスや複雑な generic 構文までは追いません。
    """

    language = "java"

    _import_pattern = re.compile(r"^\s*import\s+([\w\.]+);", re.MULTILINE)
    _package_pattern = re.compile(r"^\s*package\s+([\w\.]+);", re.MULTILINE)
    _class_pattern = re.compile(
        r"^\s*(public\s+)?(class|interface)\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z_]\w*))?(?:\s+implements\s+([A-Za-z_][\w\s,]*))?",
        re.MULTILINE,
    )
    _method_pattern = re.compile(
        r"^\s*(public|protected|private)\s+[A-Za-z_][\w<>\[\]]*\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{",
        re.MULTILINE,
    )

    def extract_symbols(self, source: str) -> list[Symbol]:
        symbols: list[Symbol] = []

        for match in self._class_pattern.finditer(source):
            symbol_type = "class" if match.group(2) == "class" else "interface"
            symbols.append(Symbol(name=match.group(3), symbol_type=symbol_type, line=self.line_of(source, match.start())))

        for match in self._method_pattern.finditer(source):
            symbols.append(Symbol(name=match.group(2), symbol_type="method", line=self.line_of(source, match.start())))

        return symbols

    def extract_relationships(self, source: str) -> list[Relationship]:
        relationships: list[Relationship] = []

        for match in self._package_pattern.finditer(source):
            relationships.append(
                Relationship(
                    from_name="current_file",
                    to_name=match.group(1),
                    relationship_type="imports",
                    line=self.line_of(source, match.start()),
                )
            )

        for match in self._import_pattern.finditer(source):
            relationships.append(
                Relationship(
                    from_name="current_file",
                    to_name=match.group(1),
                    relationship_type="imports",
                    line=self.line_of(source, match.start()),
                )
            )

        for match in self._class_pattern.finditer(source):
            class_name = match.group(3)

            if match.group(4):
                relationships.append(
                    Relationship(
                        from_name=class_name,
                        to_name=match.group(4),
                        relationship_type="extends",
                        line=self.line_of(source, match.start()),
                    )
                )

            if match.group(5):
                for interface_name in [item.strip() for item in match.group(5).split(",")]:
                    relationships.append(
                        Relationship(
                            from_name=class_name,
                            to_name=interface_name,
                            relationship_type="implements",
                            line=self.line_of(source, match.start()),
                        )
                    )

        return relationships
