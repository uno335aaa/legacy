/**
 * ローカル開発とテスト用の簡易 adapter。
 * 実 API を呼ばず、後続処理の結線だけ先に確認したいときに使う。
 */
export class MockModelAdapter {
    async generate(input) {
        const promptId = input.metadata?.promptId ?? 'unknown';
        const mockPayload = {
            promptId,
            title: `[mock] ${promptId}`,
            summary: 'This is a mock response generated without calling an external model.',
            confidence: 0.5,
        };
        return {
            text: JSON.stringify(mockPayload, null, 2),
            provider: 'mock',
            modelId: input.modelId ?? 'mock-model',
            usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
            },
        };
    }
    supportsJsonSchema() {
        return true;
    }
    supportsToolCalling() {
        return false;
    }
}
//# sourceMappingURL=mockModelAdapter.js.map