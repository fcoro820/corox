import { AIProvider } from './types.js';
import { OpenAIProvider } from './providers/openai.js';
import { OllamaProvider } from './providers/ollama.js';
import { CustomProvider } from './providers/custom.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GoogleProvider } from './providers/google.js';
import { GroqProvider } from './providers/groq.js';
import { configManager } from '../config-manager.js';

const PROVIDERS: Record<string, AIProvider> = {
  openai: new OpenAIProvider(),
  ollama: new OllamaProvider(),
  custom: new CustomProvider(),
  anthropic: new AnthropicProvider(),
  google: new GoogleProvider(),
  groq: new GroqProvider(),
};

export async function askAI(prompt: string, context: string = '') {
  const providerKey = await configManager.getSetting('ai_provider');
  const model = await configManager.getSetting('ai_model');
  
  const provider = PROVIDERS[providerKey as string];
  
  if (!provider) {
    throw new Error(`AI Provider ${providerKey} is not supported. Available: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  return await provider.ask(prompt, context, { model });
}
