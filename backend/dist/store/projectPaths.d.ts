/**
 * spec.md で決めたディレクトリ構成を 1 か所にまとめる。
 * パス文字列が散らばると typo が起きやすいので、ここ経由で扱う。
 */
export declare const PROJECTS_BASE: string;
export declare const projectPaths: {
    projectRoot(projectId: string): string;
    inputDir(projectId: string): string;
    outputDir(projectId: string): string;
    outputJsonDir(projectId: string): string;
    outputPumlDir(projectId: string): string;
    outputSvgDir(projectId: string): string;
    outputMdDir(projectId: string): string;
    metaDir(projectId: string): string;
    chatDir(projectId: string): string;
    projectFile(projectId: string): string;
    versionsFile(projectId: string): string;
    jobsFile(projectId: string): string;
    artifactsFile(projectId: string): string;
    evidencesFile(projectId: string): string;
    chatMessagesFile(projectId: string): string;
    versionInputDir(projectId: string, versionId: string): string;
    projectIndexFile(): string;
};
//# sourceMappingURL=projectPaths.d.ts.map