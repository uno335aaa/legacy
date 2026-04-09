import { v4 as uuidv4 } from 'uuid';
import { JsonArrayStore } from './jsonStore.js';
import { projectPaths } from './projectPaths.js';
import type { ProjectVersion } from '../types/project.js';

/**
 * versions.json を扱うストア。
 * まずは project ごとに配列で持ち、MVP ではシンプルに扱う。
 */
export const projectVersionStore = {
  findAll(projectId: string): ProjectVersion[] {
    const store = new JsonArrayStore<ProjectVersion>(projectPaths.versionsFile(projectId));
    return store.findAll();
  },

  findById(projectId: string, versionId: string): ProjectVersion | undefined {
    const store = new JsonArrayStore<ProjectVersion>(projectPaths.versionsFile(projectId));
    return store.findById(versionId);
  },

  create(projectId: string, label: string, uploadPath: string): ProjectVersion {
    const now = new Date().toISOString();
    const store = new JsonArrayStore<ProjectVersion>(projectPaths.versionsFile(projectId));

    const version: ProjectVersion = {
      id: uuidv4(),
      project_id: projectId,
      label,
      upload_path: uploadPath,
      created_at: now,
    };

    return store.create(version);
  },
};
