import ora from 'ora';
import Table from 'cli-table3';
import { logger } from '../utils/logger.js';

export async function listLocalModels() {
  const spinner = ora('Fetching local models from Ollama...').start();
  
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) throw new Error('Ollama is not running or API is unreachable');
    
    const data = await response.json();
    const models = data.models;

    if (!models || models.length === 0) {
      spinner.warn('No local models found. Run "ollama pull llama3" to get one.');
      return;
    }

    spinner.succeed('');
    
    const table = new Table({
      head: ['Model Name', 'Size', 'Modified'],
      colWidths: [30, 20, 30],
      style: { head: ['cyan'] }
    });

    models.forEach((m: any) => {
      table.push([m.name, `${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB`, m.modified_at]);
    });

    console.log(table.toString());
    logger.info('Use "corox config" to switch to a specific model.');

  } catch (error) {
    spinner.fail('Failed to fetch models');
    logger.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
