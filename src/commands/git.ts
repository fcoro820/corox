import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { askAI } from '../utils/ai/index.js';
import chalk from 'chalk';

const execPromise = promisify(exec);

export async function aiCommit() {
  try {
    const { stdout } = await execPromise('git diff --cached');
    const diff = stdout.trim();
    
    if (!diff) {
      logger.warn('No staged changes found. Please run "git add ." first.');
      return;
    }

    const spinner = ora('AI is analyzing changes for a commit message...').start();
    const prompt = `Analyze the following git diff and write a professional, concise commit message in the Conventional Commits format (e.g., feat: add login logic). Only return the message text, nothing else.`;
    
    const commitMessage = await askAI(prompt, diff);
    spinner.succeed('');
    
    logger.info(`Suggested message: ${chalk.bold.green(commitMessage)}`);
    
    const { confirm } = await (await import('inquirer')).default.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to use this commit message?',
        default: true,
      },
    ]);

    if (confirm) {
      await execPromise(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      logger.success('Changes committed successfully! ✅');
    } else {
      logger.info('Commit cancelled.');
    }

  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Git operation failed');
  }
}
