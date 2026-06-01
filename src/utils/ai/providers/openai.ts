import { AIProvider, Message, ChatResponse, ToolCall } from '../types.js';
import { env } from '../../env.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  async chat(messages: Message[], options: any): Promise<ChatResponse> {
    const apiKey = env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not found in .env');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4-turbo',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            tool_call_id: m.tool_call_id
          })),
          tools: [
            {
              type: 'function',
              function: {
                name: 'shell',
                description: 'Execute a command in the system shell.',
                parameters: { type: 'object', properties: { command: { type: 'string' } } }
              }
            },
            // Simplified for example, usually we'd pass all from ToolRegistry
          ],
          tool_choice: 'auto'
        })
      });

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
    } catch (error: any) {
      throw new Error(`OpenAI Error: ${error.message}`);
    }
  }
}
