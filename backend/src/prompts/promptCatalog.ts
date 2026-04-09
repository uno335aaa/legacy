import { createStructuredOutputInstruction, renderPromptTemplate } from './promptRenderer.js';

export interface PromptDefinition {
  id: string;
  purpose: string;
  system: string;
  userTemplate: string;
  outputSchema: string;
}

export interface PromptBuildInput {
  variables: Record<string, string>;
}

/**
 * 設計書生成に使う代表的なプロンプト群。
 * agent 実装前でも、この定義だけ先に固めておくと品質ルールを共有しやすい。
 */
export const promptCatalog: Record<string, PromptDefinition> = {
  overview_document: {
    id: 'overview_document',
    purpose: '全体処理概要の生成',
    system: [
      'あなたはレガシーコード解析から設計書を作成するシステムアナリストです。',
      'コードから直接読める事実と、推定した内容を明確に分離してください。',
      '推定情報には `[推定]` を付け、confidence を JSON に含めてください。',
      '入力にない処理を勝手に追加してはいけません。',
    ].join('\n'),
    userTemplate: [
      '以下の解析結果から「全体処理概要」を生成してください。',
      '',
      '### Project',
      '{{project_summary}}',
      '',
      '### File Index',
      '{{file_index}}',
      '',
      '### Entry Points',
      '{{entry_points}}',
      '',
      '### Related Evidence',
      '{{evidence_summary}}',
      '',
      '以下の観点を満たしてください。',
      '- 主要な起動点',
      '- 主処理の流れ',
      '- DB / UI / バッチ等の責務分離',
      '- 不明点は `[推定]` として扱う',
    ].join('\n'),
    outputSchema: `{
  "title": "string",
  "summary": "string",
  "mainFlows": [
    {
      "name": "string",
      "steps": ["string"],
      "confidence": 0.0
    }
  ],
  "assumptions": ["string"],
  "confidence": 0.0
}`,
  },
  class_document: {
    id: 'class_document',
    purpose: 'クラス仕様の生成',
    system: [
      'あなたは保守向けのクラス設計書を書くエンジニアです。',
      'クラスの責務、依存、公開メソッド、関連テーブルを整理してください。',
      '証拠が弱いものは `[推定]` としてください。',
    ].join('\n'),
    userTemplate: [
      '以下のクラス情報からクラス仕様書を生成してください。',
      '',
      '### Class Info',
      '{{class_info}}',
      '',
      '### Method Summaries',
      '{{method_summaries}}',
      '',
      '### Relationship Summary',
      '{{relationship_summary}}',
      '',
      '### Evidence',
      '{{evidence_summary}}',
    ].join('\n'),
    outputSchema: `{
  "className": "string",
  "responsibility": "string",
  "layer": "string",
  "dependencies": ["string"],
  "mainMethods": [
    {
      "name": "string",
      "summary": "string",
      "confidence": 0.0
    }
  ],
  "notes": ["string"],
  "confidence": 0.0
}`,
  },
  method_document: {
    id: 'method_document',
    purpose: 'メソッド処理概要の生成',
    system: [
      'あなたはソースコードからメソッド処理概要を要約する設計者です。',
      '入力コードにない処理は書かず、条件分岐・例外・副作用を優先して整理してください。',
    ].join('\n'),
    userTemplate: [
      '以下の情報からメソッド処理概要を生成してください。',
      '',
      '### Method Signature',
      '{{method_signature}}',
      '',
      '### Method Body',
      '{{method_body}}',
      '',
      '### Callee Summary',
      '{{callee_summary}}',
      '',
      '### Evidence',
      '{{evidence_summary}}',
    ].join('\n'),
    outputSchema: `{
  "methodName": "string",
  "preconditions": ["string"],
  "mainSteps": ["string"],
  "branches": ["string"],
  "exceptions": ["string"],
  "sideEffects": ["string"],
  "confidence": 0.0
}`,
  },
  crud_matrix: {
    id: 'crud_matrix',
    purpose: 'CRUD 表の生成',
    system: [
      'あなたはコードと SQL から CRUD 対応表をまとめるエンジニアです。',
      '確定した操作と推定した操作は区別してください。',
    ].join('\n'),
    userTemplate: [
      '以下のテーブル操作情報から CRUD 表を生成してください。',
      '',
      '### Table Definitions',
      '{{table_definitions}}',
      '',
      '### Method DB Operations',
      '{{method_db_operations}}',
      '',
      '### SQL Summary',
      '{{sql_summary}}',
      '',
      '### Evidence',
      '{{evidence_summary}}',
    ].join('\n'),
    outputSchema: `{
  "rows": [
    {
      "feature": "string",
      "method": "string",
      "table": "string",
      "operation": "C|R|U|D",
      "certainty": "confirmed|estimated",
      "confidence": 0.0
    }
  ],
  "notes": ["string"]
}`,
  },
  class_diagram_plantuml: {
    id: 'class_diagram_plantuml',
    purpose: 'クラス図 PlantUML の生成',
    system: [
      'あなたは PlantUML のクラス図を生成するアシスタントです。',
      '必ず PlantUML のコードのみを返してください。',
      '情報が不足する関係はコメントではなく note で表現してください。',
    ].join('\n'),
    userTemplate: [
      '以下の中間データからクラス図を PlantUML で生成してください。',
      '',
      '### Classes',
      '{{class_list}}',
      '',
      '### Relationships',
      '{{relationships}}',
      '',
      '### Constraints',
      '- 出力は `@startuml` から `@enduml` まで含めること',
      '- 過剰に詳細化せず、主要クラスを中心にまとめること',
    ].join('\n'),
    outputSchema: `{
  "plantuml": "@startuml ... @enduml"
}`,
  },
  plantuml_repair: {
    id: 'plantuml_repair',
    purpose: 'PlantUML エラー修正',
    system: [
      'あなたは PlantUML の構文修正専用アシスタントです。',
      '意味を変えすぎず、構文エラーの修正を優先してください。',
      '出力は PlantUML のコードのみを返してください。',
    ].join('\n'),
    userTemplate: [
      '以下の PlantUML を修正してください。',
      '',
      '### Original PlantUML',
      '{{plantuml_source}}',
      '',
      '### Error Message',
      '{{error_message}}',
    ].join('\n'),
    outputSchema: `{
  "plantuml": "@startuml ... @enduml"
}`,
  },
};

export function listPromptDefinitions(): PromptDefinition[] {
  return Object.values(promptCatalog);
}

export function buildPrompt(
  promptId: keyof typeof promptCatalog,
  input: PromptBuildInput,
): { system: string; user: string } {
  const definition = promptCatalog[promptId];

  const userBody = renderPromptTemplate(definition.userTemplate, input.variables);
  const outputInstruction = createStructuredOutputInstruction(definition.outputSchema);

  return {
    system: definition.system,
    user: `${userBody}\n\n${outputInstruction}`,
  };
}
