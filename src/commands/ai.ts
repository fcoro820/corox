import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';
import { AgentEngine } from '../utils/agent-engine.js';
import { OpenAIProvider } from '../utils/ai/providers/openai.js';
import { OllamaProvider } from '../utils/ai/providers/ollama.js';
import { configManager } from '../utils/config-manager.js';

async function getProvider() {
  const providerName = await configManager.getSetting('ai_provider');
  switch (providerName) {
    case 'ollama': return new OllamaProvider();
    case 'openai': return new OpenAIProvider();
    default: return new OpenAIProvider();
  }
}

export async function aiMenu() {
  const provider = await getProvider();
  const agent = new AgentEngine(provider);

  logger.title('Corox AI Agent 🤖');
  logger.info('I now have Memory and Built-in Tools (shell, read, write, edit).');
  logger.info('I can modify your files and execute commands directly.');

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Ask me to do something (e.g., "Create a new test file and run it") or type "exit":',
      },
    ]);

    if (input.toLowerCase() === 'exit') break;

    try {
      const response = await agent.run(input);
      console.log(`\nAI: ${response}\n`);
    } catch (error: any) {
      await logger.error(`Agent Error: ${error.message}`);
    }
  }
}

export async function explainCode(filePath: string) {
  const provider = await getProvider();
  const agent = new AgentEngine(provider);
  const response = await agent.run(`Please explain the following file: ${filePath}`);
  console.log(`\nAnalysis:\n${response}`);
}

export async function fixError(errorMessage: string) {
  const provider = await getProvider();
  const agent = new AgentEngine(provider);
  const response = await agent.run(`I encountered this error: "${errorMessage}". Can you fix it for me?`);
  console.log(`\nSolution:\n${response}`);
}
