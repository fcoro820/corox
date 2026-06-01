import { AIProvider } from '../ai/types.js';
import { env } from '../env.js';

export class GoogleProvider implements AIProvider {
  name = 'google';

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const apiKey = env.get('GOOGLE_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_API_KEY not found in .env');

    const model = options.model || 'gemini-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\nContext:\n${context}` }]
        }]
      })
    });

    if (!response.ok) throw new Error(`Google Gemini Error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
