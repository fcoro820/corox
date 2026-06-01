import { AIProvider, Message, ChatResponse } from '../types.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';

  async chat(messages: Message[], options: any): Promise<ChatResponse> {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || 'llama3',
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
      const data = await response.json();
      
      return {
        content: data.message.content,
        tool_calls: [] // Ollama tool support depends on the specific model/version
      };
    } catch (error) {
      throw new Error('Ollama is not running or error occurred. Please start Ollama first (ollama serve).');
    }
  }
}
