# analyzer

Python 側の解析基盤です。

現時点では「最初の一歩」を重視していて、次の内容を含みます。
- parser の共通インターフェース
- C / C++ / Java 向けの最小 parser
- 入力ディレクトリを走査する ingestion agent
- 1 ファイル解析と一覧化を試せる CLI
- `unittest` ベースのテスト

今は正規表現ベースですが、責務の分け方は Tree-sitter へ移行しやすい形にしています。

## 使い方
```powershell
python -m analyzer.main parse --file path\to\Sample.java
```

```powershell
python -m analyzer.main index --root path\to\project
```

## テスト
```powershell
python -m unittest discover -s analyzer/tests
```
