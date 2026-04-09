import { Router } from 'express';
export const healthRouter = Router();
// ヘルスチェックAPI
healthRouter.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
    });
});
//# sourceMappingURL=healthController.js.map