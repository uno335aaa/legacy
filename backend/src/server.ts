import express from 'express';
import cors from 'cors';
import { projectRouter } from './controllers/projectController.js';
import { healthRouter } from './controllers/healthController.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルーティング
app.use('/api', healthRouter);
app.use('/api/projects', projectRouter);

// グローバルエラーハンドリング
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`[legacyDoc] APIサーバ起動: http://localhost:${PORT}`);
});

export default app;
