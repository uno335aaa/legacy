import { describe, expect, it } from 'vitest';
import { buildPrompt, listPromptDefinitions } from './promptCatalog.js';
import { renderPromptTemplate } from './promptRenderer.js';
describe('promptRenderer', () => {
    it('replaces template variables with provided values', () => {
        const result = renderPromptTemplate('Hello {{name}}', { name: 'legacyDoc' });
        expect(result).toBe('Hello legacyDoc');
    });
});
describe('promptCatalog', () => {
    it('builds a prompt with schema instructions', () => {
        const prompt = buildPrompt('overview_document', {
            variables: {
                project_summary: 'sample project',
                file_index: 'src/App.java',
                entry_points: 'Main.main',
                evidence_summary: 'none',
            },
        });
        expect(prompt.system).toContain('レガシーコード解析');
        expect(prompt.user).toContain('sample project');
        expect(prompt.user).toContain('### Output Schema');
    });
    it('exposes multiple prompt definitions for document generation', () => {
        const definitions = listPromptDefinitions();
        expect(definitions.length).toBeGreaterThanOrEqual(5);
        expect(definitions.some((item) => item.id === 'method_document')).toBe(true);
        expect(definitions.some((item) => item.id === 'plantuml_repair')).toBe(true);
    });
});
//# sourceMappingURL=promptCatalog.test.js.map