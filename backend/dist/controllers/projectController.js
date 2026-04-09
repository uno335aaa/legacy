import { Router } from 'express';
import { z } from 'zod';
import { projectStore } from '../store/projectStore.js';
import { projectVersionStore } from '../store/projectVersionStore.js';
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