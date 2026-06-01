import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import { askAI } from '../utils/ai/index.js';

export async function explainCode(filePath: string) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    // Security & Stability: Check file size before reading
    const stats = await fs.stat(absolutePath);
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB limit
    if (stats.size > MAX_SIZE) {
      throw new Error(`File is too large (${(stats.size / 1024 / 1024).toFixed(2)}MB). Max limit is 1MB.`);
    }

    const code = await fs.readFile(absolutePath, 'utf8');
    
    const spinner = ora('Corox AI is analyzing your code...').start();
    const result = await askAI('Please explain this code in detail but concisely. Use markdown for formatting.', code);
    spinner.succeed('');
    
    logger.title(`Explanation for ${filePath}`);
    console.log('\n' + result + '\n');
  }

export async function fixError(errorMessage: string) {
    const spinner = ora('Corox AI is searching for a solution...').start();
    const result = await askAI('I encountered this error in my project. How do I fix it? Provide a step-by-step solution.', errorMessage);
    spinner.succeed('');
    
    logger.title('Suggested Fix');
    console.log('\n' + result + '\n');
  }

export async function aiMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: 'What can Corox AI do for you?',
      choices: ['Explain Code', 'Fix Error', 'Back to Main Menu'],
    },
  ]);

  if (action === 'Explain Code') {
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to the file:',
      },
    ]);
    await explainCode(filePath);
  } else if (action === 'Fix Error') {
    const { errorMessage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'errorMessage',
        message: 'Paste the error message:',
      },
    ]);
    await fixError(errorMessage);
  }
}
