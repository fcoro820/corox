import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAI } from '../src/utils/ai/index.js';
import { configManager } from '../src/utils/config-manager.js';

// Mock the entire providers directory or specific providers
vi.mock('../src/utils/ai/providers/ollama.js', () => {
  return {
    OllamaProvider: class {
      name = 'ollama';
      ask = vi.fn().mockResolvedValue('Ollama response');
    }
  };
});

describe('AI Bridge Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use the provider specified in config', async () => {
    vi.spyOn(configManager, 'getSetting').mockImplementation((key: string) => {
      if (key === 'ai_provider') return Promise.resolve('ollama');
      return Promise.resolve('llama3');
    });

    const response = await askAI('Hello');
    
    expect(response).toBe('Ollama response');
  });

  it('should throw error for unsupported provider', async () => {
    vi.spyOn(configManager, 'getSetting').mockImplementation((key: string) => {
      if (key === 'ai_provider') return Promise.resolve('invalid-provider');
      return Promise.resolve('model');
    });

    await expect(askAI('Hello')).rejects.toThrow(/is not supported/);
  });
});
