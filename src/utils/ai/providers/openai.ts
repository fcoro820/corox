import { AIProvider } from '../types.js';
import { env } from '../../env.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const apiKey = env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not found in .env');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: options.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are Corox AI, a helpful expert developer assistant.' },
            { role: 'user', content: `${prompt}\n\nContext:\n${context}` }
          ],
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`OpenAI Error: ${errorMessage}`);
      }
      const data = await response.json();
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('AI Provider returned an empty response.');
      }
      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
