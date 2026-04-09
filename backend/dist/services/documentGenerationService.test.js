import { describe, expect, it } from 'vitest';
import { MockModelAdapter } from '../adapters/mockModelAdapter.js';
import { DocumentGenerationService } from './documentGenerationService.js';
describe('DocumentGenerationService', () => {
    it('builds prompts and returns parsed mock json', async () => {
        const service = new DocumentGenerationService(new MockModelAdapter());
        const result = await service.generateDocument({
            promptId: 'class_document',
            variables: {
                class_info: 'UserService',
                method_summaries: 'createUser, deleteUser',
                relationship_summary: 'depends on UserRepository',
                evidence_summary: 'class name and annotations',
            },
        });
        expect(result.promptId).toBe('class_document');
        expect(result.purpose).toContain('クラス仕様');
        expect(result.userPrompt).toContain('UserService');
        expect(result.provider).toBe('mock');
        expect(result.parsed).not.toBeNull();
    });
    it('lists prompt definitions for callers that need prompt selection', () => {
        const service = new DocumentGenerationService(new MockModelAdapter());
        const definitions = service.listPromptDefinitions();
        expect(definitions.some((definition) => definition.id === 'overview_document')).toBe(true);
        expect(definitions.some((definition) => definition.id === 'crud_matrix')).toBe(true);
    });
});
//# sourceMappingURL=documentGenerationService.test.js.map