import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
/**
 * Azure OpenAI 向け adapter。
 * まだ本格運用前なので、まずは text generation の最小機能だけを持たせる。
 */
export class AzureOpenAIAdapter {
    provider;
    deployment;
    constructor(options) {
        this.provider = createAzure({
            apiKey: options.apiKey,
            resourceName: options.resourceName,
            baseURL: options.baseURL,
        });
        this.deployment = options.deployment;
    }
    async generate(input) {
        const result = await generateText({
            model: this.provider(this.deployment),
            system: input.system,
            prompt: input.prompt,
        });
        return {
            text: result.text,
            provider: 'azure-openai',
            modelId: input.modelId ?? this.deployment,
            usage: {
                inputTokens: result.usage?.inputTokens,
                outputTokens: result.usage?.outputTokens,
                totalTokens: result.usage?.totalTokens,
            },
        };
    }
    supportsJsonSchema() {
        return true;
    }
    supportsToolCalling() {
        return true;
    }
}
//# sourceMappingURL=azureOpenAIAdapter.js.map