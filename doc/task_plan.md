# legacyDoc 実装計画書（更新版）

* 文書版数: 0.3
* 更新日: 2026-04-09
* 対象仕様書: [spec.md](file:///c:/work/legacyDoc/doc/spec.md)
* 目的: 現状実装を反映し、次に進めるタスクを優先順で整理する

---

## 1. 現状サマリ

### 1.1 完了済み

| タスクID | 状態 | 内容 |
|------|------|------|
| T-02 | 完了 | `frontend/` と `backend/` の基本雛形作成 |
| T-03 | 完了 | JSON ストア、型定義、プロジェクト配下の初期 JSON 作成、基礎テスト追加 |
| T-04 | 完了 | `Project` の CRUD API 実装 |
| T-04.5 | 完了 | `POST /api/projects/:id/versions` を先行実装 |
| T-15 | 完了 | プロジェクト一覧・詳細・アップロード画面のベース実装 |

### 1.2 着手済み

| タスクID | 状態 | 内容 |
|------|------|------|
| T-05 | 完了 | 実ファイルの保存、一覧取得 API、基礎テストまで実装済み |
| T-11 | 進行中 | 設計書生成向けプロンプトテンプレート、レンダラ、ModelAdapter、生成 API 土台を実装中 |

### 1.3 未着手

* T-06 以降の Python 解析基盤
* T-06 以降の Python 解析基盤
* T-12 以降の解析オーケストレーション
* T-13 以降の文書生成本体

---

## 2. ここからの実装方針

### 2.1 優先順位

Phase 1 の受入条件に直結する順で進める。

1. T-11: プロンプトテンプレートと LLM 呼び出し土台を固める
2. T-06: Python 解析基盤を作る
3. T-07 - T-10: 解析エージェントの最小実装を作る
4. T-12 - T-14: オーケストレータ / 文書生成 / 図生成をつなぐ
5. T-16 - T-17: 設計書閲覧とジョブ表示を追加する

### 2.2 今回の実装対象

今回の着手対象は T-11 のうち、プロンプトテンプレート基盤とする。

---

## 3. 更新済みタスク一覧

### T-05: ファイルアップロード機能

| 項目 | 内容 |
|------|------|
| タスクID | T-05 |
| 状態 | 進行中 |
| 依存 | T-03 |
| 概要 | spec.md §11.2 / §17.2 に基づくファイルアップロード機能を実装する |

**完了済み**

* `POST /api/projects/:id/versions` の基本実装
* `ProjectVersion` の保存
* `active_version_id` の更新

**今回実装する内容**

1. `POST /api/projects/:id/upload`
   - 複数ファイルを受け取り、`/input/{version_id}/` へ保存する
   - 新しい `ProjectVersion` を自動作成する
2. ファイル保存サービス
   - パス正規化
   - 相対パス制約
   - ディレクトリ自動作成
3. ファイル一覧取得 API
   - `GET /api/projects/:id/files`
   - 必要に応じて `version_id` 指定に対応
4. 単体テスト
   - 複数ファイル保存
   - 危険なパスの拒否
   - 保存後一覧取得

**成果物**

* [ ] `backend/src/services/fileService.ts`
* [ ] `POST /api/projects/:id/upload`
* [ ] `GET /api/projects/:id/files`
* [ ] テストコード

**受入条件**

* 複数ファイルをプロジェクト配下へ保存できる
* `active_version_id` と `versions.json` が整合する
* 危険なパス（`../` など）を拒否できる
* 保存済みファイルの一覧を取得できる

---

### T-06: Python 解析基盤（Tree-sitter セットアップ）

| 項目 | 内容 |
|------|------|
| タスクID | T-06 |
| 状態 | 未着手 |
| 依存 | T-02 |
| 概要 | Tree-sitter を用いた C / C++ / Java の構文解析基盤を構築する |

**次の着手内容**

1. `analyzer/` ディレクトリ作成
2. `requirements.txt` 作成
3. 共通パーサインターフェース
4. C / C++ / Java の最小パーサ雛形

---

### T-11: LLM アダプタ / プロンプト基盤

| 項目 | 内容 |
|------|------|
| タスクID | T-11 |
| 状態 | 進行中 |
| 依存 | T-03 |
| 概要 | 設計書生成に使うプロンプトテンプレートと、後続の ModelAdapter 実装の土台を整える |

**今回実装する内容**

1. `backend/src/prompts/` を新設
2. 設計書生成向けテンプレートを追加
   - 全体処理概要
   - クラス仕様
   - メソッド処理概要
   - CRUD 表
   - クラス図 PlantUML
   - PlantUML 修復
3. 変数展開レンダラを実装
4. JSON Schema 出力指示を共通化
5. `ModelAdapter` の共通 interface / mock / Azure 骨組みを追加
6. 単体テストを追加

**次の着手内容**

1. Ollama 向け `ModelAdapter` 実装
2. Document Synthesis Agent から利用する入力 DTO 設計
3. prompt ごとの few-shot 例の追加
4. prompt 実行 API をフロントから呼べる検証画面の追加

**成果物**

* [ ] `backend/src/prompts/promptRenderer.ts`
* [ ] `backend/src/prompts/promptCatalog.ts`
* [ ] `backend/src/prompts/*.test.ts`
* [ ] `backend/src/adapters/modelAdapter.ts`
* [ ] `backend/src/adapters/*Adapter.ts`
* [ ] `backend/src/services/documentGenerationService.ts`

---

### T-15: フロントエンド基盤

| 項目 | 内容 |
|------|------|
| タスクID | T-15 |
| 状態 | 完了 |
| 依存 | T-04 |
| 概要 | プロジェクト一覧・詳細・アップロード画面のベースを作る |

**完了内容**

1. React Router 導入
2. API クライアント作成
3. プロジェクト一覧画面
4. プロジェクト作成フォーム
5. アップロード画面

---

## 4. 直近バックログ

### Sprint A: プロンプト / LLM 基盤

1. T-11-1: prompt renderer を作る
2. T-11-2: prompt catalog を作る
3. T-11-3: prompt テストを追加する
4. T-11-4: ModelAdapter 実装方針を固める

### Sprint B: 解析基盤

1. T-06-1: `analyzer/` 初期化
2. T-06-2: Tree-sitter 導入
3. T-06-3: パーサ共通化

### Sprint C: 文書生成

1. T-12-1: ジョブオーケストレータ雛形
2. T-13-1: prompt catalog を使った文書生成 service
3. T-14-1: PlantUML 変換経路の用意

---

## 5. 受入条件への対応状況

| # | 条件 | 状況 | 対応タスク |
|---|------|------|-----------|
| 1 | プロジェクト単位でアップロードできる | 未達 | T-05 |
| 2 | C / C++ / Java の基本構造を抽出できる | 未達 | T-06, T-09 |
| 3 | クラス一覧、メソッド一覧、クラス図、全体処理概要を生成できる | 未達 | T-13, T-14 |
| 4 | CRUD表、DB更新仕様の初版を生成できる | 未達 | T-10, T-13 |
| 5 | Markdown と SVG を Web UI で閲覧できる | 未達 | T-16 |
| 6 | チャットから追加指示を出せる | 未達 | T-20 |
| 7 | プロジェクトごとに Input / Working / Output が管理される | 一部達成 | T-03, T-05, T-12 |

---

## 6. メモ

* 現状は backend の LLM / prompt 基盤を優先する
* 設計書品質に直結するため、プロンプトは agent 実装前に共通化しておく
* 初心者でも追いやすいよう、サービス層とストア層には短い説明コメントを残す

---

*以上*
