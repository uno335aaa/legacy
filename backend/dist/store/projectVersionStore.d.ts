import type { ProjectVersion } from '../types/project.js';
/**
 * versions.json を扱うストア。
 * まずは project ごとに配列で持ち、MVP ではシンプルに扱う。
 */
export declare const projectVersionStore: {
    findAll(projectId: string): ProjectVersion[];
    findById(projectId: string, versionId: string): ProjectVersion | undefined;
    create(projectId: string, label: string, uploadPath: string): ProjectVersion;
};
//# sourceMappingURL=projectVersionStore.d.ts.map