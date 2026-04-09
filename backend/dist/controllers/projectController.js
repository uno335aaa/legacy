import { Router } from 'express';
import { z } from 'zod';
import { projectStore } from '../store/projectStore.js';
import { projectVersionStore } from '../store/projectVersionStore.js';
import { promptCatalog } from '../prompts/promptCatalog.js';
import { artifactService } from '../services/artifactService.js';
import { fileService } from '../services/fileService.js';
export const projectRouter = Router();
// Validate request bodies first so the rest of the handler can stay simple.
const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().max(500).default(''),
});
const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
});
const createVersionSchema = z.object({
    label: z.string().min(1, 'Version label is required').max(100),
    // Store metadata first. The actual upload endpoint can be added next.
    upload_path: z.string().min(1, 'upload_path is required'),
});
const uploadFileSchema = z.object({
    path: z.string().min(1, 'File path is required'),
    content: z.string(),
    encoding: z.enum(['utf8', 'base64']).optional(),
});
const uploadProjectSchema = z.object({
    label: z.string().min(1).max(100).optional(),
    files: z.array(uploadFileSchema).min(1, 'At least one file is required'),
});
const artifactPromptIds = Object.keys(promptCatalog);
const generateArtifactSchema = z.object({
    promptId: z.enum(artifactPromptIds),
    variables: z.record(z.string(), z.string()),
    modelId: z.string().min(1).optional(),
});
/**
 * POST /api/projects
 * 新しいプロジェクトを作る。
 */
projectRouter.post('/', (req, res) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    const { name, description } = parsed.data;
    const project = projectStore.create(name, description);
    res.status(201).json(project);
});
/**
 * GET /api/projects
 * プロジェクト一覧を返す。
 */
projectRouter.get('/', (_req, res) => {
    const projects = projectStore.findAll();
    res.json(projects);
});
/**
 * GET /api/projects/:id
 * プロジェクト 1 件と、その配下の version 一覧をまとめて返す。
 */
projectRouter.get('/:id', (req, res) => {
    const projectId = String(req.params.id);
    const project = projectStore.findById(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const versions = projectVersionStore.findAll(project.id);
    res.json({ project, versions });
});
/**
 * PATCH /api/projects/:id
 * 名前や説明などを更新する。
 */
projectRouter.patch('/:id', (req, res) => {
    const projectId = String(req.params.id);
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    const updated = projectStore.update(projectId, parsed.data);
    if (!updated) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json(updated);
});
/**
 * POST /api/projects/:id/versions
 * プロジェクト配下に新しい version を作る。
 */
projectRouter.post('/:id/versions', (req, res) => {
    const projectId = String(req.params.id);
    const project = projectStore.findById(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const parsed = createVersionSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    const version = projectVersionStore.create(project.id, parsed.data.label, parsed.data.upload_path);
    const updatedProject = projectStore.update(project.id, {
        status: 'uploaded',
        active_version_id: version.id,
    });
    if (!updatedProject) {
        res.status(500).json({ error: 'Failed to update project metadata' });
        return;
    }
    res.status(201).json({
        project: updatedProject,
        version,
    });
});
/**
 * POST /api/projects/:id/upload
 * 複数ファイルを 1 つの version として保存する。
 */
projectRouter.post('/:id/upload', (req, res) => {
    const projectId = String(req.params.id);
    const project = projectStore.findById(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const parsed = uploadProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    try {
        const uploadResult = fileService.uploadProjectFiles({
            projectId,
            versionLabel: parsed.data.label ?? `upload-${new Date().toISOString()}`,
            files: parsed.data.files,
        });
        const updatedProject = projectStore.findById(projectId);
        res.status(201).json({
            project: updatedProject,
            version: uploadResult.version,
            files: uploadResult.savedFiles,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        res.status(400).json({ error: message });
    }
});
/**
 * GET /api/projects/:id/files
 * active_version_id、または query の version_id を基準にファイル一覧を返す。
 */
projectRouter.get('/:id/files', (req, res) => {
    const projectId = String(req.params.id);
    const project = projectStore.findById(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const versionId = typeof req.query.version_id === 'string' ? req.query.version_id : undefined;
    try {
        const files = fileService.listProjectFiles(projectId, versionId);
        res.json({
            project_id: projectId,
            version_id: versionId ?? project.active_version_id,
            files,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list files';
        res.status(400).json({ error: message });
    }
});
/**
 * GET /api/projects/:id/artifacts
 * 保存済み成果物の一覧を返す。
 */
projectRouter.get('/:id/artifacts', (req, res) => {
    const projectId = String(req.params.id);
    try {
        const artifacts = artifactService.listArtifacts(projectId);
        res.json({ artifacts });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list artifacts';
        res.status(400).json({ error: message });
    }
});
/**
 * GET /api/projects/:id/artifacts/:artifactId
 * 成果物の中身とメタ情報を返す。
 */
projectRouter.get('/:id/artifacts/:artifactId', (req, res) => {
    const projectId = String(req.params.id);
    const artifactId = String(req.params.artifactId);
    try {
        const artifact = artifactService.getArtifact(projectId, artifactId);
        res.json(artifact);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get artifact';
        res.status(400).json({ error: message });
    }
});
/**
 * POST /api/projects/:id/artifacts/regenerate
 * prompt を使って成果物ドラフトを生成し、output 配下へ保存する。
 */
projectRouter.post('/:id/artifacts/regenerate', async (req, res) => {
    const projectId = String(req.params.id);
    const parsed = generateArtifactSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    try {
        const result = await artifactService.generateArtifactFromPrompt(projectId, parsed.data);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate artifact';
        res.status(400).json({ error: message });
    }
});
/**
 * DELETE /api/projects/:id
 * プロジェクトをディレクトリごと削除する。
 */
projectRouter.delete('/:id', (req, res) => {
    const projectId = String(req.params.id);
    const deleted = projectStore.delete(projectId);
    if (!deleted) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.status(204).send();
});
//# sourceMappingURL=projectController.js.map