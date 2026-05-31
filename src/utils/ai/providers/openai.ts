import { AIProvider } from '../ai/types.js';
import { env } from '../env.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const apiKey = env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not found in .env');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Corox AI, a helpful expert developer assistant.' },
          { role: 'user', content: `${prompt}\n\nContext:\n${context}` }
        ],
      })
    });

    if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
