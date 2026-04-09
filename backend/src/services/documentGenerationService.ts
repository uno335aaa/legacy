import { buildPrompt, promptCatalog } from '../prompts/promptCatalog.js';
import type { PromptDefinition } from '../prompts/promptCatalog.js';
import type { ModelAdapter } from '../adapters/modelAdapter.js';
import { createModelAdapterFromEnv } from '../adapters/modelAdapterFactory.js';

export type PromptId = keyof typeof promptCatalog;

export interface GenerateDocumentInput {
  promptId: PromptId;
  variables: Record<string, string>;
  modelId?: string;
}

export interface GenerateDocumentResult {
  promptId: PromptId;
  purpose: string;
  systemPrompt: string;
  userPrompt: string;
  rawText: string;
  parsed: unknown | null;
  provider: string;
  modelId: string;
}

/**
 * prompt catalog と model adapter をつなぐ service。
 * ここを経由することで、controller や agent は prompt 組み立てを意識しなくてよくなる。
 */
export class DocumentGenerationService {
  private readonly adapter: ModelAdapter;

  constructor(adapter: ModelAdapter = createModelAdapterFromEnv()) {
    this.adapter = adapter;
  }

  listPromptDefinitions(): PromptDefinition[] {
    return Object.values(promptCatalog);
  }

  async generateDocument(input: GenerateDocumentInput): Promise<GenerateDocumentResult> {
    const definition = promptCatalog[input.promptId];
    const prompt = buildPrompt(input.promptId, {
      variables: input.variables,
    });

    const result = await this.adapter.generate({
      system: prompt.system,
      prompt: prompt.user,
      modelId: input.modelId,
      metadata: {
        promptId: definition.id,
        purpose: definition.purpose,
      },
    });

    return {
      promptId: input.promptId,
      purpose: definition.purpose,
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      rawText: result.text,
      parsed: tryParseJson(result.text),
      provider: result.provider,
      modelId: result.modelId,
    };
  }
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const documentGenerationService = new DocumentGenerationService();
