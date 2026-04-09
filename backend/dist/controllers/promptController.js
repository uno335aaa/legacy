import { Router } from 'express';
import { z } from 'zod';
import { buildPrompt, promptCatalog } from '../prompts/promptCatalog.js';
import { documentGenerationService } from '../services/documentGenerationService.js';
export const promptRouter = Router();
const promptIds = Object.keys(promptCatalog);
const renderPromptSchema = z.object({
    promptId: z.enum(promptIds),
    variables: z.record(z.string(), z.string()),
});
const generatePromptSchema = z.object({
    promptId: z.enum(promptIds),
    variables: z.record(z.string(), z.string()),
    modelId: z.string().min(1).optional(),
});
/**
 * GET /api/prompts
 * 利用可能な prompt 一覧を返す。
 */
promptRouter.get('/', (_req, res) => {
    const prompts = documentGenerationService.listPromptDefinitions().map((prompt) => ({
        id: prompt.id,
        purpose: prompt.purpose,
    }));
    res.json({ prompts });
});
/**
 * POST /api/prompts/render
 * LLM を呼ばずに、system/user prompt の組み立て結果だけを確認する。
 */
promptRouter.post('/render', (req, res) => {
    const parsed = renderPromptSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    const prompt = buildPrompt(parsed.data.promptId, {
        variables: parsed.data.variables,
    });
    res.json({
        promptId: parsed.data.promptId,
        system: prompt.system,
        user: prompt.user,
    });
});
/**
 * POST /api/prompts/generate
 * 指定した prompt と変数を使って生成を実行する。
 */
promptRouter.post('/generate', async (req, res) => {
    const parsed = generatePromptSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.issues });
        return;
    }
    try {
        const result = await documentGenerationService.generateDocument(parsed.data);
        res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate document';
        res.status(500).json({ error: message });
    }
});
//# sourceMappingURL=promptController.js.map