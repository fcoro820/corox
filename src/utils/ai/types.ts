export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

export interface AIProvider {
  name: string;
  chat(messages: Message[], options: any): Promise<ChatResponse>;
  ask?(prompt: string, context: string, options: any): Promise<string>;
}

export interface ChatResponse {
  content: string | null;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: any;
}
