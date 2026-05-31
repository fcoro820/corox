import inquirer from 'inquirer';
import Conf from 'conf';
import { logger } from '../utils/logger.js';

const config = new Conf({ projectName: 'corox-cli' });

export async function configureSettings() {
  const { theme } = await inquirer.prompt([
    {
      type: 'select',
      name: 'theme',
      message: 'Choose your CLI theme:',
      choices: ['Dark', 'Light', 'High Contrast'],
      default: config.get('theme') || 'Dark',
    },
  ]);

  config.set('theme', theme);
  logger.success(`Theme set to ${theme}. Settings saved to local config!`);
}

export function getSettings() {
  return config.store;
}
