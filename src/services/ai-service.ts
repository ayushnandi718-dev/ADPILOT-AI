import type { AIProviderConfig, AIResponse } from '@/types';

interface AIProvider {
  name: string;
  generateCompletion(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<AIResponse>;
  generateStreaming(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<ReadableStream>;
}

class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  async generateCompletion(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://adpilot.ai',
        'X-Title': 'AdPilot AI',
      },
      body: JSON.stringify({
        model: config.model || 'openai/gpt-4o-mini',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  async generateStreaming(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<ReadableStream> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://adpilot.ai',
        'X-Title': 'AdPilot AI',
      },
      body: JSON.stringify({
        model: config.model || 'openai/gpt-4o-mini',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    return response.body!;
  }
}

class OllamaProvider implements AIProvider {
  name = 'Ollama';

  async generateCompletion(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<AIResponse> {
    const response = await fetch(`${config.baseUrl || 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'llama3',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }),
    });

    const data = await response.json();
    return {
      content: data.message.content,
      model: data.model,
    };
  }

  async generateStreaming(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<ReadableStream> {
    const response = await fetch(`${config.baseUrl || 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'llama3',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    return response.body!;
  }
}

class LMStudioProvider implements AIProvider {
  name = 'LM Studio';

  async generateCompletion(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<AIResponse> {
    const response = await fetch(`${config.baseUrl || 'http://localhost:1234'}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'local-model',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
    };
  }

  async generateStreaming(messages: { role: string; content: string }[], config: AIProviderConfig): Promise<ReadableStream> {
    const response = await fetch(`${config.baseUrl || 'http://localhost:1234'}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'local-model',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    return response.body!;
  }
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: AIProvider | null = null;

  constructor() {
    this.providers.set('openrouter', new OpenRouterProvider());
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('lmstudio', new LMStudioProvider());
  }

  setProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Unknown AI provider: ${providerId}`);
    this.currentProvider = provider;
  }

  getProviderName(): string {
    return this.currentProvider?.name || 'Unknown';
  }

  async generateCompletion(
    messages: { role: string; content: string }[],
    config: AIProviderConfig
  ): Promise<AIResponse> {
    const provider = this.providers.get(config.provider);
    if (!provider) throw new Error(`Unknown AI provider: ${config.provider}`);
    return provider.generateCompletion(messages, config);
  }

  async generateStreaming(
    messages: { role: string; content: string }[],
    config: AIProviderConfig
  ): Promise<ReadableStream> {
    const provider = this.providers.get(config.provider);
    if (!provider) throw new Error(`Unknown AI provider: ${config.provider}`);
    return provider.generateStreaming(messages, config);
  }
}

export const aiService = new AIService();
