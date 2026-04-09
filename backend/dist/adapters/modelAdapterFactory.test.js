import { afterEach, describe, expect, it } from 'vitest';
import { createModelAdapterFromEnv } from './modelAdapterFactory.js';
describe('createModelAdapterFromEnv', () => {
    afterEach(() => {
        delete process.env.MODEL_PROVIDER;
        delete process.env.AZURE_OPENAI_API_KEY;
        delete process.env.AZURE_OPENAI_DEPLOYMENT;
        delete process.env.AZURE_OPENAI_RESOURCE_NAME;
        delete process.env.AZURE_OPENAI_BASE_URL;
    });
    it('returns mock adapter by default', async () => {
        const adapter = createModelAdapterFromEnv();
        const result = await adapter.generate({
            system: 'system',
            prompt: 'prompt',
        });
        expect(result.provider).toBe('mock');
    });
    it('throws when azure provider is selected without required settings', () => {
        process.env.MODEL_PROVIDER = 'azure';
        expect(() => createModelAdapterFromEnv()).toThrow('Azure OpenAI settings are incomplete');
    });
});
//# sourceMappingURL=modelAdapterFactory.test.js.map