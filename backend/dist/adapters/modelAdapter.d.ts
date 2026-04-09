export interface GenerateInput {
    system: string;
    prompt: string;
    modelId?: string;
    metadata?: Record<string, string>;
}
export interface GenerateOutput {
    text: string;
    provider: string;
    modelId: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
}
/**
 * LLM プロバイダ差し替え用の共通 interface。
 * 文書生成 service はこの型だけを見ればよいようにする。
 */
export interface ModelAdapter {
    generate(input: GenerateInput): Promise<GenerateOutput>;
    supportsJsonSchema(): boolean;
    supportsToolCalling(): boolean;
}
//# sourceMappingURL=modelAdapter.d.ts.map