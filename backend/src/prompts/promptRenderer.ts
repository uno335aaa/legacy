/**
 * テンプレート文字列の `{{key}}` を値で置き換える。
 * まずは小さく始めて、将来必要になったら条件分岐やループを足す想定。
 */
export function renderPromptTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return variables[key] ?? '';
  });
}

/**
 * JSON Schema や入力補足を見やすく 1 本のブロックへまとめる。
 * 各プロンプトで書式を揃えておくと、後で差し替えやすい。
 */
export function createStructuredOutputInstruction(schema: string): string {
  return [
    '出力は必ず JSON のみとし、説明文を前後に付けないこと。',
    'キー名は変更しないこと。',
    '不明な値は null または空配列で表現し、推測した値には confidence を付けること。',
    '',
    '### Output Schema',
    schema.trim(),
  ].join('\n');
}
