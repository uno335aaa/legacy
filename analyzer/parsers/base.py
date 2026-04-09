from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal


SupportedLanguage = Literal["c", "cpp", "java", "unknown"]
SymbolType = Literal["class", "method", "function", "struct", "interface"]
RelationshipType = Literal["imports", "includes", "calls", "extends", "implements"]


@dataclass(slots=True)
class Symbol:
    """
    解析で見つかった「名前付き要素」を表します。

    例:
    - class
    - method
    - function
    - struct

    line を持たせているのは、あとで evidence を作るときに
    「どの行から拾った情報か」を追いやすくするためです。
    """

    name: str
    symbol_type: SymbolType
    line: int


@dataclass(slots=True)
class Relationship:
    """
    シンボル同士、またはファイルと外部要素の関係を表します。

    最初は from / to の文字列だけで十分です。
    将来 Tree-sitter に置き換えるときに、ここへ node 情報や
    confidence を追加しやすいよう、独立した dataclass にしています。
    """

    from_name: str
    to_name: str
    relationship_type: RelationshipType
    line: int


@dataclass(slots=True)
class ParseResult:
    """
    1 ファイル分の解析結果です。

    status は将来の段階的な解析を見越して持たせています。
    今は基本的に success を返しますが、
    「一部しか読めなかった」「エンコーディングが怪しい」なども
    後から表現できるようにしています。
    """

    file_path: str
    language: SupportedLanguage
    symbols: list[Symbol] = field(default_factory=list)
    relationships: list[Relationship] = field(default_factory=list)
    status: Literal["success", "partial", "failed"] = "success"
    warnings: list[str] = field(default_factory=list)


class LanguageParser(ABC):
    """
    すべての言語 parser が従う共通インターフェースです。

    大きな流れは共通なので、ここで parse_file をまとめています。
    各 parser は extract_symbols / extract_relationships だけ実装すれば
    よい形にして、言語ごとの差分へ集中できるようにします。
    """

    language: SupportedLanguage = "unknown"

    def parse_file(self, file_path: str) -> ParseResult:
        source = self.read_text(file_path)
        result = ParseResult(file_path=file_path, language=self.language)
        result.symbols = self.extract_symbols(source)
        result.relationships = self.extract_relationships(source)
        return result

    def read_text(self, file_path: str) -> str:
        """
        まず UTF-8 で読み、だめなら cp932 を試します。

        Windows の古い業務コードでは cp932 が混ざりやすいため、
        初期段階ではこのフォールバックを持たせておくと実運用で楽です。
        """

        path = Path(file_path)
        try:
            return path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return path.read_text(encoding="cp932")

    def line_of(self, source: str, start_index: int) -> int:
        """
        文字位置から 1 始まりの行番号を返します。

        正規表現の match.start() と組み合わせる前提の小さな helper です。
        各 parser に同じ処理を書かないよう、基底クラスへ寄せています。
        """

        return source.count("\n", 0, start_index) + 1

    @abstractmethod
    def extract_symbols(self, source: str) -> list[Symbol]:
        """ソース文字列からシンボル一覧を取り出します。"""

    @abstractmethod
    def extract_relationships(self, source: str) -> list[Relationship]:
        """ソース文字列から関係一覧を取り出します。"""
