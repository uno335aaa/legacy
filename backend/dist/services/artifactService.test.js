import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockModelAdapter } from '../adapters/mockModelAdapter.js';
import { DocumentGenerationService } from './documentGenerationService.js';
describe('artifactService', () => {
    const tempDirs = [];
    afterEach(() => {
        vi.resetModules();
        delete process.env.PROJECTS_DIR;
        for (const dir of tempDirs.splice(0)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
    it('generates and stores an artifact file under output directory', async () => {
        const projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacydoc-artifacts-'));
        tempDirs.push(projectsDir);
        process.env.PROJECTS_DIR = projectsDir;
        const { projectStore } = await import('../store/projectStore.js');
        const { fileService } = await import('./fileService.js');
        const { artifactService } = await import('./artifactService.js');
        const project = projectStore.create('Artifacts Test', 'store generated docs');
        fileService.uploadProjectFiles({
            projectId: project.id,
            versionLabel: 'v1',
            files: [{ path: 'src/App.java', content: 'class App {}' }],
        });
        const generationService = new DocumentGenerationService(new MockModelAdapter());
        const result = await artifactService.generateArtifactFromPrompt(project.id, {
            promptId: 'overview_document',
            variables: {
                project_summary: 'sample',
                file_index: 'src/App.java',
                entry_points: 'App.main',
                evidence_summary: 'none',
            },
        }, generationService);
        expect(result.artifact.type).toBe('overview');
        expect(result.artifact.format).toBe('json');
        expect(result.content).toContain('generated_at');
        const saved = artifactService.getArtifact(project.id, result.artifact.id);
        expect(saved.content).toContain('payload');
    });
});
//# sourceMappingURL=artifactService.test.js.map