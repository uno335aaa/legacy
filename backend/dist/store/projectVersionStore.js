import { v4 as uuidv4 } from 'uuid';
import { JsonArrayStore } from './jsonStore.js';
import { projectPaths } from './projectPaths.js';
/**
 * versions.json を扱うストア。
 * まずは project ごとに配列で持ち、MVP ではシンプルに扱う。
 */
export const projectVersionStore = {
    findAll(projectId) {
        const store = new JsonArrayStore(projectPaths.versionsFile(projectId));
        return store.findAll();
    },
    findById(projectId, versionId) {
        const store = new JsonArrayStore(projectPaths.versionsFile(projectId));
        return store.findById(versionId);
    },
    create(projectId, label, uploadPath) {
        const now = new Date().toISOString();
        const store = new JsonArrayStore(projectPaths.versionsFile(projectId));
        const version = {
            id: uuidv4(),
            project_id: projectId,
            label,
            upload_path: uploadPath,
            created_at: now,
        };
        return store.create(version);
    },
};
//# sourceMappingURL=projectVersionStore.js.map