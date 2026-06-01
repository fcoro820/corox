import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import { logger } from '../utils/logger.js';

const execPromise = promisify(exec);

export async function killPort(port: string) {
  const spinner = ora(`Searching for process on port ${port}...`).start();
  
  try {
    const { stdout } = await execPromise(`lsof -t -i:${port}`);
    const pid = stdout.trim();
    
    if (!pid) {
      spinner.warn(`No process found running on port ${port}.`);
      return;
    }

    spinner.text = `Killing process ${pid}...`;
    await execPromise(`kill -9 ${pid}`);
    
    spinner.succeed('');
    logger.success(`Process ${pid} on port ${port} has been terminated. ✅`);
  } catch (error) {
    spinner.fail('Failed to kill port');
    if (error instanceof Error && error.message.includes('command not found')) {
      logger.error('lsof is not installed on this system.');
    } else {
      logger.warn(`No process found on port ${port} or permission denied.`);
    }
  }
}
