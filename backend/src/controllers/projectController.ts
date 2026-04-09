import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { projectStore } from '../store/projectStore.js';

export const projectRouter = Router();

// バリデーションスキーマ
const createProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(100),
  description: z.string().max(500).default(''),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

/**
 * POST /api/projects - プロジェクト新規作成
 */
projectRouter.post('/', (req: Request, res: Response) => {
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
 * GET /api/projects - プロジェクト一覧取得
 */
projectRouter.get('/', (_req: Request, res: Response) => {
  const projects = projectStore.findAll();
  res.json(projects);
});

/**
 * GET /api/projects/:id - プロジェクト詳細取得
 */
projectRouter.get('/:id', (req: Request, res: Response) => {
  const project = projectStore.findById(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'プロジェクトが見つかりません' });
    return;
  }
  res.json(project);
});

/**
 * PATCH /api/projects/:id - プロジェクト更新
 */
projectRouter.patch('/:id', (req: Request, res: Response) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
    return;
  }

  const updated = projectStore.update(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: 'プロジェクトが見つかりません' });
    return;
  }
  res.json(updated);
});

/**
 * DELETE /api/projects/:id - プロジェクト削除
 */
projectRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = projectStore.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'プロジェクトが見つかりません' });
    return;
  }
  res.status(204).send();
});
