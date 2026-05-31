import { AIProvider } from '../ai/types.js';
import { env } from '../env.js';

export class CustomProvider implements AIProvider {
  name = 'custom';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const baseUrl = env.get('AI_CUSTOM_URL') || 'http://localhost:8080/v1';
    const apiKey = env.get('AI_CUSTOM_KEY') || '';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'default',
        messages: [
          { role: 'system', content: 'You are Corox AI.' },
          { role: 'user', content: `${prompt}\n\nContext:\n${context}` }
        ],
      })
    });

    if (!response.ok) throw new Error(`Custom Provider Error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
