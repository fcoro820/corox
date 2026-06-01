import { AIProvider, Message, ChatResponse } from '../types.js';
import { env } from '../../env.js';

export class GoogleProvider implements AIProvider {
  name = 'google';

  async chat(messages: Message[], options: any): Promise<ChatResponse> {
    const apiKey = env.get('GOOGLE_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_API_KEY not found in .env');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${options.model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      })
    });

    if (!response.ok) throw new Error(`Google Error: ${response.statusText}`);
    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      tool_calls: []
    };
  }

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const res = await this.chat([{ role: 'user', content: `${prompt}\n\nContext:\n${context}` }], options);
    return res.content || '';
  }
}
