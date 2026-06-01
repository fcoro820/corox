import { AIProvider } from '../types.js';
import { env } from '../../env.js';

export class GroqProvider implements AIProvider {
  name = 'groq';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const apiKey = env.get('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY not found in .env');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are Corox AI, a helpful expert developer assistant.' },
          { role: 'user', content: `${prompt}\n\nContext:\n${context}` }
        ],
      })
    });

    if (!response.ok) throw new Error(`Groq Error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
