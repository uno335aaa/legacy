import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
describe('fileService', () => {
    const tempDirs = [];
    afterEach(() => {
        vi.resetModules();
        delete process.env.PROJECTS_DIR;
        for (const dir of tempDirs.splice(0)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
    it('saves uploaded files under the created version directory', async () => {
        const projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacydoc-files-'));
        tempDirs.push(projectsDir);
        process.env.PROJECTS_DIR = projectsDir;
        const { projectStore } = await import('../store/projectStore.js');
        const { fileService } = await import('./fileService.js');
        const { projectPaths } = await import('../store/projectPaths.js');
        const project = projectStore.create('Upload Test', 'files');
        const result = fileService.uploadProjectFiles({
            projectId: project.id,
            versionLabel: 'v1',
            files: [
                { path: 'src/main.c', content: 'int main() { return 0; }' },
                { path: 'config/app.properties', content: 'name=legacyDoc' },
            ],
        });
        expect(result.savedFiles).toHaveLength(2);
        expect(fs.existsSync(path.join(projectPaths.versionInputDir(project.id, result.version.id), 'src/main.c'))).toBe(true);
        expect(fs.existsSync(path.join(projectPaths.versionInputDir(project.id, result.version.id), 'config/app.properties'))).toBe(true);
        const listed = fileService.listProjectFiles(project.id, result.version.id);
        expect(listed.map((item) => item.path)).toEqual(['config/app.properties', 'src/main.c']);
    });
    it('rejects dangerous relative paths', async () => {
        const projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacydoc-files-'));
        tempDirs.push(projectsDir);
        process.env.PROJECTS_DIR = projectsDir;
        const { projectStore } = await import('../store/projectStore.js');
        const { fileService } = await import('./fileService.js');
        const project = projectStore.create('Upload Test', 'files');
        expect(() => fileService.uploadProjectFiles({
            projectId: project.id,
            versionLabel: 'v1',
            files: [{ path: '../secrets.txt', content: 'nope' }],
        })).toThrow('Invalid file path');
    });
});
//# sourceMappingURL=fileService.test.js.map