import os from 'os';
import Table from 'cli-table3';
import { logger } from '../utils/logger.js';

export async function showSystemInfo() {
  logger.title('Corox System Dashboard');
  
  const table = new Table({
    head: ['Category', 'Detail'],
    colWidths: [20, 40],
    style: { head: ['cyan'] }
  });

  const info = {
    'OS Platform': os.platform(),
    'OS Release': os.release(),
    'Architecture': os.arch(),
    'CPU Model': os.cpus()[0].model,
    'Total Memory': `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    'Free Memory': `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    'Node Version': process.version,
    'Current Directory': process.cwd(),
  };

  for (const [key, value] of Object.entries(info)) {
    table.push([key, value]);
  }

  console.log(table.toString());
  console.log('\n' + logger.info('System check completed successfully.'));
}
