import { v4 as uuidv4 } from 'uuid';
import { JsonArrayStore } from './jsonStore.js';
import { projectPaths } from './projectPaths.js';
/**
 * artifacts.json を扱うストア。
 * 生成済みファイルのメタ情報だけをここに集約して、実体ファイルは output 配下に置く。
 */
export const artifactStore = {
    findAll(projectId) {
        const store = new JsonArrayStore(projectPaths.artifactsFile(projectId));
        return store.findAll();
    },
    findById(projectId, artifactId) {
        const store = new JsonArrayStore(projectPaths.artifactsFile(projectId));
        return store.findById(artifactId);
    },
    create(input) {
        const store = new JsonArrayStore(projectPaths.artifactsFile(input.projectId));
        const artifact = {
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
//# sourceMappingURL=artifactStore.js.map