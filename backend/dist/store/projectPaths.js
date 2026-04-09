import path from 'path';
/**
 * spec.md で決めたディレクトリ構成を 1 か所にまとめる。
 * パス文字列が散らばると typo が起きやすいので、ここ経由で扱う。
 */
export const PROJECTS_BASE = process.env.PROJECTS_DIR || path.join(process.cwd(), '..', 'projects');
export const projectPaths = {
    projectRoot(projectId) {
        return path.join(PROJECTS_BASE, projectId);
    },
    inputDir(projectId) {
        return path.join(this.projectRoot(projectId), 'input');
    },
    outputDir(projectId) {
        return path.join(this.projectRoot(projectId), 'output');
    },
    outputJsonDir(projectId) {
        return path.join(this.outputDir(projectId), 'json');
    },
    outputPumlDir(projectId) {
        return path.join(this.outputDir(projectId), 'puml');
    },
    outputSvgDir(projectId) {
        return path.join(this.outputDir(projectId), 'svg');
    },
    outputMdDir(projectId) {
        return path.join(this.outputDir(projectId), 'md');
    },
    metaDir(projectId) {
        return path.join(this.projectRoot(projectId), 'meta');
    },
    chatDir(projectId) {
        return path.join(this.projectRoot(projectId), 'chat');
    },
    projectFile(projectId) {
        return path.join(this.metaDir(projectId), 'project.json');
    },
    versionsFile(projectId) {
        return path.join(this.metaDir(projectId), 'versions.json');
    },
    jobsFile(projectId) {
        return path.join(this.metaDir(projectId), 'jobs.json');
    },
    artifactsFile(projectId) {
        return path.join(this.metaDir(projectId), 'artifacts.json');
    },
    evidencesFile(projectId) {
        return path.join(this.metaDir(projectId), 'evidences.json');
    },
    chatMessagesFile(projectId) {
        return path.join(this.chatDir(projectId), 'messages.json');
    },
    versionInputDir(projectId, versionId) {
        return path.join(this.inputDir(projectId), versionId);
    },
    projectIndexFile() {
        return path.join(PROJECTS_BASE, 'index.json');
    },
};
//# sourceMappingURL=projectPaths.js.map