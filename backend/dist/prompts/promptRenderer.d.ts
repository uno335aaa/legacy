/**
 * テンプレート文字列の `{{key}}` を値で置き換える。
 * まずは小さく始めて、将来必要になったら条件分岐やループを足す想定。
 */
export declare function renderPromptTemplate(template: string, variables: Record<string, string>): string;
/**
 * JSON Schema や入力補足を見やすく 1 本のブロックへまとめる。
 * 各プロンプトで書式を揃えておくと、後で差し替えやすい。
 */
export declare function createStructuredOutputInstruction(schema: string): string;
//# sourceMappingURL=promptRenderer.d.ts.map