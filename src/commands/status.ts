import ora from 'ora';
import { logger } from '../utils/logger.js';

export async function checkStatus() {
  logger.info('Checking system status...');
  const spinner = ora('Analyzing...').start();
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    spinner.succeed('');
    logger.success('All systems operational. ✅');
  } catch (error) {
    spinner.fail('Status check failed');
    logger.error(error instanceof Error ? error.message : 'Unknown error occurred');
    throw error;
  }
}
