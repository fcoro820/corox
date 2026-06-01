export interface AIProvider {
  name: string;
  ask(prompt: string, context: string, options: any): Promise<string>;
}
