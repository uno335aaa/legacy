import path from 'path';

/**
 * spec.md で決めたディレクトリ構成を 1 か所にまとめる。
 * パス文字列が散らばると typo が起きやすいので、ここ経由で扱う。
 */
export const PROJECTS_BASE = process.env.PROJECTS_DIR || path.join(process.cwd(), '..', 'projects');

export const projectPaths = {
  projectRoot(projectId: string): string {
    return path.join(PROJECTS_BASE, projectId);
  },

  inputDir(projectId: string): string {
    return path.join(this.projectRoot(projectId), 'input');
  },

  outputDir(projectId: string): string {
    return path.join(this.projectRoot(projectId), 'output');
  },

  outputJsonDir(projectId: string): string {
    return path.join(this.outputDir(projectId), 'json');
  },

  outputPumlDir(projectId: string): string {
    return path.join(this.outputDir(projectId), 'puml');
  },

  outputSvgDir(projectId: string): string {
    return path.join(this.outputDir(projectId), 'svg');
  },

  outputMdDir(projectId: string): string {
    return path.join(this.outputDir(projectId), 'md');
  },

  metaDir(projectId: string): string {
    return path.join(this.projectRoot(projectId), 'meta');
  },

  chatDir(projectId: string): string {
    return path.join(this.projectRoot(projectId), 'chat');
  },

  projectFile(projectId: string): string {
    return path.join(this.metaDir(projectId), 'project.json');
  },

  versionsFile(projectId: string): string {
    return path.join(this.metaDir(projectId), 'versions.json');
  },

  jobsFile(projectId: string): string {
    return path.join(this.metaDir(projectId), 'jobs.json');
  },

  artifactsFile(projectId: string): string {
    return path.join(this.metaDir(projectId), 'artifacts.json');
  },

  evidencesFile(projectId: string): string {
    return path.join(this.metaDir(projectId), 'evidences.json');
  },

  chatMessagesFile(projectId: string): string {
    return path.join(this.chatDir(projectId), 'messages.json');
  },

  versionInputDir(projectId: string, versionId: string): string {
    return path.join(this.inputDir(projectId), versionId);
  },

  projectIndexFile(): string {
    return path.join(PROJECTS_BASE, 'index.json');
  },
};
