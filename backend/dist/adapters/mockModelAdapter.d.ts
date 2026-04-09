import type { GenerateInput, GenerateOutput, ModelAdapter } from './modelAdapter.js';
/**
 * ローカル開発とテスト用の簡易 adapter。
 * 実 API を呼ばず、後続処理の結線だけ先に確認したいときに使う。
 */
export declare class MockModelAdapter implements ModelAdapter {
    generate(input: GenerateInput): Promise<GenerateOutput>;
    supportsJsonSchema(): boolean;
    supportsToolCalling(): boolean;
}
//# sourceMappingURL=mockModelAdapter.d.ts.map