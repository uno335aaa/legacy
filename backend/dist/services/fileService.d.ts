import type { ProjectVersion } from '../types/project.js';
export type UploadFileEncoding = 'utf8' | 'base64';
export interface UploadFileInput {
    path: string;
    content: string;
    encoding?: UploadFileEncoding;
}
export interface SavedProjectFile {
    path: string;
    size: number;
}
export interface UploadProjectFilesInput {
    projectId: string;
    versionLabel: string;
    files: UploadFileInput[];
}
/**
 * プロジェクト配下の input ファイルを扱うサービス。
 * コントローラからファイル操作の詳細を隠して、読みやすく保つ役割を持つ。
 */
export declare const fileService: {
    /**
     * 複数ファイルを保存し、新しい version を作る。
     */
    uploadProjectFiles(input: UploadProjectFilesInput): {
        version: ProjectVersion;
        savedFiles: SavedProjectFile[];
    };
    /**
     * 指定 version 配下のファイル一覧を再帰的に返す。
     */
    listProjectFiles(projectId: string, versionId?: string): SavedProjectFile[];
    /**
     * `../` や絶対パスを拒否して、プロジェクト内だけに保存させる。
     */
    normalizeRelativePath(filePath: string): string;
    walkFiles(rootDir: string, currentDir: string): SavedProjectFile[];
};
//# sourceMappingURL=fileService.d.ts.map