import { AIProvider, Message, ChatResponse } from '../types.js';
import { env } from '../../env.js';

export class CustomProvider implements AIProvider {
  name = 'custom';

  async chat(messages: Message[], options: any): Promise<ChatResponse> {
    const endpoint = env.get('CUSTOM_AI_ENDPOINT');
    const apiKey = env.get('CUSTOM_AI_API_KEY');
    if (!endpoint) throw new Error('CUSTOM_AI_ENDPOINT not found in .env');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: messages,
      })
    });

    if (!response.ok) throw new Error(`Custom AI Error: ${response.statusText}`);
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tool_calls: []
    };
  }

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const res = await this.chat([{ role: 'user', content: `${prompt}\n\nContext:\n${context}` }], options);
    return res.content || '';
  }
}
