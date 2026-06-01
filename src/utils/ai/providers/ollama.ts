import { AIProvider } from '../types.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || 'llama3',
          prompt: `${prompt}\n\nContext:\n${context}`,
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error('Ollama is not running. Please start Ollama first (ollama serve).');
    }
  }
}
