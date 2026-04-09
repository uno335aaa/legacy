import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('projectStore', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.resetModules();
    delete process.env.PROJECTS_DIR;

    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('creates a project directory tree and the initial json files', async () => {
    const projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacydoc-projects-'));
    tempDirs.push(projectsDir);
    process.env.PROJECTS_DIR = projectsDir;

    // Import after setting the env var so the module picks up the temp path.
    const { projectStore } = await import('./projectStore.js');
    const { projectPaths } = await import('./projectPaths.js');

    const project = projectStore.create('Sample Project', 'for test');

    expect(project.name).toBe('Sample Project');
    expect(project.status).toBe('created');
    expect(fs.existsSync(projectPaths.projectFile(project.id))).toBe(true);
    expect(fs.existsSync(projectPaths.versionsFile(project.id))).toBe(true);
    expect(fs.existsSync(projectPaths.jobsFile(project.id))).toBe(true);
    expect(fs.existsSync(projectPaths.artifactsFile(project.id))).toBe(true);
    expect(fs.existsSync(projectPaths.evidencesFile(project.id))).toBe(true);
    expect(fs.existsSync(projectPaths.chatMessagesFile(project.id))).toBe(true);

    const versions = JSON.parse(fs.readFileSync(projectPaths.versionsFile(project.id), 'utf-8'));
    expect(versions).toEqual([]);
  });
});
