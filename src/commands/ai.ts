import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { askAI } from '../utils/ai/index.js';

export async function explainCode(filePath: string) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const code = await fs.readFile(absolutePath, 'utf8');
    
    const spinner = ora('Corox AI is analyzing your code...').start();
    const result = await askAI('Please explain this code in detail but concisely. Use markdown for formatting.', code);
    spinner.succeed(null);
    
    logger.title(`Explanation for ${filePath}`);
    console.log('\n' + result + '\n');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Failed to explain code');
  }
}

export async function fixError(errorMessage: string) {
  try {
    const spinner = ora('Corox AI is searching for a solution...').start();
    const result = await askAI('I encountered this error in my project. How do I fix it? Provide a step-by-step solution.', errorMessage);
    spinner.succeed(null);
    
    logger.title('Suggested Fix');
    console.log('\n' + result + '\n');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Failed to fix error');
  }
}

// Wrapper for interactive menu
export async function aiMenu() {
  const { action } = await (await import('inquirer')).default.prompt([
    {
      type: 'select',
      name: 'action',
      message: 'What can Corox AI do for you?',
      choices: ['Explain Code', 'Fix Error', 'Back to Main Menu'],
    },
  ]);

  if (action === 'Explain Code') {
    const { filePath } = await (await import('inquirer')).default.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to the file:',
      },
    ]);
    await explainCode(filePath);
  } else if (action === 'Fix Error') {
    const { errorMessage } = await (await import('inquirer')).default.prompt([
      {
        type: 'input',
        name: 'errorMessage',
        message: 'Paste the error message:',
      },
    ]);
    await fixError(errorMessage);
  }
}
