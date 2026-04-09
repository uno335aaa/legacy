import type { Artifact, ArtifactFormat, ArtifactType } from '../types/project.js';
/**
 * artifacts.json を扱うストア。
 * 生成済みファイルのメタ情報だけをここに集約して、実体ファイルは output 配下に置く。
 */
export declare const artifactStore: {
    findAll(projectId: string): Artifact[];
    findById(projectId: string, artifactId: string): Artifact | undefined;
    create(input: {
        projectId: string;
        versionId: string;
        type: ArtifactType;
        path: string;
        format: ArtifactFormat;
    }): Artifact;
};
//# sourceMappingURL=artifactStore.d.ts.map