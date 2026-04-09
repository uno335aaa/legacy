import fs from 'fs';
import path from 'path';
import { projectPaths } from '../store/projectPaths.js';
import { projectStore } from '../store/projectStore.js';
import { projectVersionStore } from '../store/projectVersionStore.js';
/**
 * プロジェクト配下の input ファイルを扱うサービス。
 * コントローラからファイル操作の詳細を隠して、読みやすく保つ役割を持つ。
 */
export const fileService = {
    /**
     * 複数ファイルを保存し、新しい version を作る。
     */
    uploadProjectFiles(input) {
        const project = projectStore.findById(input.projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const uploadRoot = projectPaths.inputDir(input.projectId);
        const version = projectVersionStore.create(input.projectId, input.versionLabel, uploadRoot);
        const versionDir = projectPaths.versionInputDir(input.projectId, version.id);
        const savedFiles = [];
        for (const file of input.files) {
            const relativePath = this.normalizeRelativePath(file.path);
            const destination = path.join(versionDir, relativePath);
            const destinationDir = path.dirname(destination);
            fs.mkdirSync(destinationDir, { recursive: true });
            const buffer = file.encoding === 'base64'
                ? Buffer.from(file.content, 'base64')
                : Buffer.from(file.content, 'utf-8');
            fs.writeFileSync(destination, buffer);
            savedFiles.push({
                path: relativePath,
                size: buffer.byteLength,
            });
        }
        projectStore.update(input.projectId, {
            status: 'uploaded',
            active_version_id: version.id,
        });
        return { version, savedFiles };
    },
    /**
     * 指定 version 配下のファイル一覧を再帰的に返す。
     */
    listProjectFiles(projectId, versionId) {
        const project = projectStore.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const targetVersionId = versionId ?? project.active_version_id;
        if (!targetVersionId) {
            return [];
        }
        const versionDir = projectPaths.versionInputDir(projectId, targetVersionId);
        if (!fs.existsSync(versionDir)) {
            return [];
        }
        return this.walkFiles(versionDir, versionDir);
    },
    /**
     * `../` や絶対パスを拒否して、プロジェクト内だけに保存させる。
     */
    normalizeRelativePath(filePath) {
        const normalized = path.posix.normalize(filePath.replace(/\\/g, '/'));
        if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
            throw new Error('Invalid file path');
        }
        if (path.posix.isAbsolute(normalized)) {
            throw new Error('Absolute paths are not allowed');
        }
        return normalized;
    },
    walkFiles(rootDir, currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        const files = [];
        for (const entry of entries) {
            const absolutePath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                files.push(...this.walkFiles(rootDir, absolutePath));
                continue;
            }
            const stats = fs.statSync(absolutePath);
            files.push({
                path: path.relative(rootDir, absolutePath).replace(/\\/g, '/'),
                size: stats.size,
            });
        }
        return files.sort((left, right) => left.path.localeCompare(right.path));
    },
};
//# sourceMappingURL=fileService.js.map