import { AIProvider, Message, ChatResponse } from '../types.js';
import { env } from '../../env.js';

export class GroqProvider implements AIProvider {
  name = 'groq';

  async chat(messages: Message[], options: any): Promise<ChatResponse> {
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
        messages: messages,
      })
    });

    if (!response.ok) throw new Error(`Groq Error: ${response.statusText}`);
    const data = await response.json();
    const message = data.choices[0].message;

    return {
      content: message.content,
      tool_calls: message.tool_calls?.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments)
      }))
    };
  }

  async ask(prompt: string, context: string, options: any): Promise<string> {
    const res = await this.chat([{ role: 'user', content: `${prompt}\n\nContext:\n${context}` }], options);
    return res.content || '';
  }
}
