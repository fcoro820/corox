import inquirer from 'inquirer';
import Conf from 'conf';
import { logger } from '../utils/logger.js';

const config = new Conf({ projectName: 'corox-cli' });

export async function configureSettings() {
  const { theme, aiProvider, aiModel } = await inquirer.prompt([
    {
      type: 'select',
      name: 'theme',
      message: 'Choose your CLI theme:',
      choices: ['Dark', 'Light', 'High Contrast'],
      default: config.get('theme') || 'Dark',
    },
    {
      type: 'select',
      name: 'aiProvider',
      message: 'Choose AI Provider:',
      choices: [
        { name: 'OpenAI (Cloud)', value: 'openai' },
        { name: 'Anthropic (Claude)', value: 'anthropic' },
        { name: 'Google (Gemini)', value: 'google' },
        { name: 'Groq (Ultra Fast)', value: 'groq' },
        { name: 'Ollama (Local)', value: 'ollama' },
        { name: 'Custom (API Compatible)', value: 'custom' },
      ],
      default: config.get('ai_provider') || 'openai',
    },
    {
      type: 'input',
      name: 'aiModel',
      message: 'Specify AI Model (e.g., gpt-4o, claude-3, gemini-pro, llama3):',
      default: config.get('ai_model') || 'llama3',
    },
  ]);

  config.set('theme', theme);
  config.set('ai_provider', aiProvider);
  config.set('ai_model', aiModel);
  
  logger.success(`Settings saved! Theme: ${theme}, AI: ${aiProvider} (${aiModel})`);
}

export function getSettings() {
  return config.store;
}
