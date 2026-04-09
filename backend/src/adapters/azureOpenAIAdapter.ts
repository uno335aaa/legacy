import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
import type { GenerateInput, GenerateOutput, ModelAdapter } from './modelAdapter.js';

export interface AzureOpenAIAdapterOptions {
  apiKey: string;
  resourceName?: string;
  baseURL?: string;
  deployment: string;
}

/**
 * Azure OpenAI 向け adapter。
 * まだ本格運用前なので、まずは text generation の最小機能だけを持たせる。
 */
export class AzureOpenAIAdapter implements ModelAdapter {
  private readonly provider;
  private readonly deployment: string;

  constructor(options: AzureOpenAIAdapterOptions) {
    this.provider = createAzure({
      apiKey: options.apiKey,
      resourceName: options.resourceName,
      baseURL: options.baseURL,
    });
    this.deployment = options.deployment;
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const result = await generateText({
      model: this.provider(this.deployment),
      system: input.system,
      prompt: input.prompt,
    });

    return {
      text: result.text,
      provider: 'azure-openai',
      modelId: input.modelId ?? this.deployment,
      usage: {
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        totalTokens: result.usage?.totalTokens,
      },
    };
  }

  supportsJsonSchema(): boolean {
    return true;
  }

  supportsToolCalling(): boolean {
    return true;
  }
}
