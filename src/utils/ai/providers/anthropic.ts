import { AIProvider } from '../ai/types.js';
import { env } from '../env.js';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const apiKey = env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: `${prompt}\n\nContext:\n${context}` }
        ],
      })
    });

    if (!response.ok) throw new Error(`Anthropic Error: ${response.statusText}`);
    const data = await response.json();
    return data.content[0].text;
  }
}
