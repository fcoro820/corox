import ora from 'ora';
import Table from 'cli-table3';
import { logger } from '../utils/logger.js';

export async function makeRequest(method: string, url: string) {
  const spinner = ora(`Sending ${method.toUpperCase()} request to ${url}...`).start();
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, { method: method.toUpperCase() });
    const endTime = Date.now();
    const data = await response.json();
    
    spinner.succeed('');
    
    const table = new Table({
      head: ['Metric', 'Value'],
      colWidths: [20, 60],
      style: { head: ['cyan'] }
    });

    table.push(
      ['Status', `${response.status} ${response.statusText}`],
      ['Time', `${endTime - startTime}ms`],
      ['Type', response.headers.get('content-type') || 'unknown']
    );

    console.log(table.toString());
    console.log('\n' + logger.info('Response Body:'));
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    spinner.fail('Request failed');
    logger.error(error instanceof Error ? error.message : 'Invalid URL or connection error');
  }
}
