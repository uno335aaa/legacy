import { AzureOpenAIAdapter } from './azureOpenAIAdapter.js';
import { MockModelAdapter } from './mockModelAdapter.js';
/**
 * 環境変数から adapter を選ぶ factory。
 * 未設定時は mock に倒して、開発初期でも詰まらないようにする。
 */
export function createModelAdapterFromEnv() {
    const provider = process.env.MODEL_PROVIDER ?? 'mock';
    if (provider === 'azure') {
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
        const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;
        const baseURL = process.env.AZURE_OPENAI_BASE_URL;
        if (!apiKey || !deployment || (!resourceName && !baseURL)) {
            throw new Error('Azure OpenAI settings are incomplete. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT and either AZURE_OPENAI_RESOURCE_NAME or AZURE_OPENAI_BASE_URL.');
        }
        return new AzureOpenAIAdapter({
            apiKey,
            deployment,
            resourceName,
            baseURL,
        });
    }
    return new MockModelAdapter();
}
//# sourceMappingURL=modelAdapterFactory.js.map