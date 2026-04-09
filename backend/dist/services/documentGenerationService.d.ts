import { promptCatalog } from '../prompts/promptCatalog.js';
import type { PromptDefinition } from '../prompts/promptCatalog.js';
import type { ModelAdapter } from '../adapters/modelAdapter.js';
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
export declare class DocumentGenerationService {
    private readonly adapter;
    constructor(adapter?: ModelAdapter);
    listPromptDefinitions(): PromptDefinition[];
    generateDocument(input: GenerateDocumentInput): Promise<GenerateDocumentResult>;
}
export declare const documentGenerationService: DocumentGenerationService;
//# sourceMappingURL=documentGenerationService.d.ts.map