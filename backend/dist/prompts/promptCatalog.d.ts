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
export declare const promptCatalog: Record<string, PromptDefinition>;
export declare function listPromptDefinitions(): PromptDefinition[];
export declare function buildPrompt(promptId: keyof typeof promptCatalog, input: PromptBuildInput): {
    system: string;
    user: string;
};
//# sourceMappingURL=promptCatalog.d.ts.map