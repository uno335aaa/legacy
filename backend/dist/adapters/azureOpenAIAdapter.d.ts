import type { GenerateInput, GenerateOutput, ModelAdapter } from './modelAdapter.js';
export interface AzureOpenAIAdapterOptions {
    apiKey: string;
    resourceName?: string;
    baseURL?: string;
    deployment: string;
}
/**
 * Azure OpenAI 向け adapter。
 * まだ本格運用前なので、まずは text generation の最小機能だけを持たせる。
 */
export declare class AzureOpenAIAdapter implements ModelAdapter {
    private readonly provider;
    private readonly deployment;
    constructor(options: AzureOpenAIAdapterOptions);
    generate(input: GenerateInput): Promise<GenerateOutput>;
    supportsJsonSchema(): boolean;
    supportsToolCalling(): boolean;
}
//# sourceMappingURL=azureOpenAIAdapter.d.ts.map