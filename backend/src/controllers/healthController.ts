import { Router, Request, Response } from 'express';

export const healthRouter = Router();

// ヘルスチェックAPI
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});
