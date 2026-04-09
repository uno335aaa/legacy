import { v4 as uuidv4 } from 'uuid';
import { JsonArrayStore } from './jsonStore.js';
import { projectPaths } from './projectPaths.js';
import type { Artifact, ArtifactFormat, ArtifactType } from '../types/project.js';

/**
 * artifacts.json を扱うストア。
 * 生成済みファイルのメタ情報だけをここに集約して、実体ファイルは output 配下に置く。
 */
export const artifactStore = {
  findAll(projectId: string): Artifact[] {
    const store = new JsonArrayStore<Artifact>(projectPaths.artifactsFile(projectId));
    return store.findAll();
  },

  findById(projectId: string, artifactId: string): Artifact | undefined {
    const store = new JsonArrayStore<Artifact>(projectPaths.artifactsFile(projectId));
    return store.findById(artifactId);
  },

  create(input: {
    projectId: string;
    versionId: string;
    type: ArtifactType;
    path: string;
    format: ArtifactFormat;
  }): Artifact {
    const store = new JsonArrayStore<Artifact>(projectPaths.artifactsFile(input.projectId));
    const artifact: Artifact = {
      id: uuidv4(),
      project_id: input.projectId,
      version_id: input.versionId,
      type: input.type,
      path: input.path,
      format: input.format,
      created_at: new Date().toISOString(),
    };

    return store.create(artifact);
  },
};
