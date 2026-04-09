# legacyDoc

レガシーコード解析と設計書生成を目指す Web アプリです。  
現在は、プロジェクト管理、ファイルアップロード、一覧・詳細・アップロード画面の土台まで実装されています。

## 前提環境

* Node.js 20 以上推奨
* npm

## ディレクトリ構成

* `frontend/`: React + Vite の UI
* `backend/`: Express + TypeScript の API
* `projects/`: 実行時に作られるプロジェクトデータ保存先
* `doc/`: 仕様書、計画書

## 初回セットアップ

ルートで次を実行してください。

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

## 実行方法

バックエンドとフロントエンドを別ターミナルで起動します。

### 1. バックエンド起動

```powershell
cd backend
npm run dev
```

デフォルトでは `http://localhost:3001` で起動します。  
ヘルスチェックは `http://localhost:3001/api/health` です。

### 2. フロントエンド起動

```powershell
cd frontend
npm run dev
```

通常は `http://localhost:5173` で起動します。  
フロントは `http://localhost:3001/api` を API として利用します。

## 使い方

1. ブラウザでフロントエンドを開く
2. プロジェクト一覧画面で新しいプロジェクトを作成する
3. 詳細画面、または Upload 画面へ進む
4. ファイルやフォルダを選択してアップロードする

アップロードされたファイルは `projects/{projectId}/input/{versionId}/` 配下に保存されます。

## ビルド

### バックエンド

```powershell
cd backend
npm run build
```

### フロントエンド

```powershell
cd frontend
npx tsc -b
```

補足:
この開発環境では `vite build` がサンドボックス制約で失敗することがあるため、型チェック確認として `npx tsc -b` を案内しています。

## テスト

### バックエンド

```powershell
cd backend
npx vitest run --pool=threads
```

補足:
この環境では通常の `npm test` だと `spawn EPERM` になることがあるため、`--pool=threads` を付けています。

## 環境変数

### バックエンド

* `PORT`: API サーバのポート番号。未指定時は `3001`
* `PROJECTS_DIR`: プロジェクト保存先。未指定時は `../projects`

例:

```powershell
$env:PORT="3002"
$env:PROJECTS_DIR="C:\work\legacyDoc\projects"
npm run dev
```

## 現在の主な API

* `GET /api/health`
* `POST /api/projects`
* `GET /api/projects`
* `GET /api/projects/:id`
* `PATCH /api/projects/:id`
* `DELETE /api/projects/:id`
* `POST /api/projects/:id/versions`
* `POST /api/projects/:id/upload`
* `GET /api/projects/:id/files`

## 補足

詳細な仕様は [`doc/spec.md`](C:/work/legacyDoc/doc/spec.md)、実装計画は [`doc/task_plan.md`](C:/work/legacyDoc/doc/task_plan.md) を参照してください。
