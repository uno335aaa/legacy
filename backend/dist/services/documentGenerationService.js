import { buildPrompt, promptCatalog } from '../prompts/promptCatalog.js';
import { createModelAdapterFromEnv } from '../adapters/modelAdapterFactory.js';
/**
 * prompt catalog と model adapter をつなぐ service。
 * ここを経由することで、controller や agent は prompt 組み立てを意識しなくてよくなる。
 */
export class DocumentGenerationService {
    adapter;
    constructor(adapter = createModelAdapterFromEnv()) {
        this.adapter = adapter;
    }
    listPromptDefinitions() {
        return Object.values(promptCatalog);
    }
    async generateDocument(input) {
        const definition = promptCatalog[input.promptId];
        const prompt = buildPrompt(input.promptId, {
            variables: input.variables,
        });
        const result = await this.adapter.generate({
            system: prompt.system,
            prompt: prompt.user,
            modelId: input.modelId,
            metadata: {
                promptId: definition.id,
                purpose: definition.purpose,
            },
        });
        return {
            promptId: input.promptId,
            purpose: definition.purpose,
            systemPrompt: prompt.system,
            userPrompt: prompt.user,
            rawText: result.text,
            parsed: tryParseJson(result.text),
            provider: result.provider,
            modelId: result.modelId,
        };
    }
}
function tryParseJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
export const documentGenerationService = new DocumentGenerationService();
//# sourceMappingURL=documentGenerationService.js.map