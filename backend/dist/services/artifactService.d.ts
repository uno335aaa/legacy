import { DocumentGenerationService, type GenerateDocumentInput } from './documentGenerationService.js';
import type { Artifact, ArtifactFormat } from '../types/project.js';
/**
 * 生成した設計書ドラフトを output 配下へ保存する service。
 * まずは prompt workbench から成果物化できることを優先する。
 */
export declare const artifactService: {
    listArtifacts(projectId: string): Artifact[];
    getArtifact(projectId: string, artifactId: string): {
        artifact: Artifact;
        content: string;
    };
    generateArtifactFromPrompt(projectId: string, input: GenerateDocumentInput, generationService?: DocumentGenerationService): Promise<{
        artifact: Artifact;
        content: string;
    }>;
    toPersistedContent(format: ArtifactFormat, rawText: string, parsed: unknown | null): string;
    buildRelativeArtifactPath(projectId: string, artifactId: string, format: ArtifactFormat): string;
};
//# sourceMappingURL=artifactService.d.ts.map