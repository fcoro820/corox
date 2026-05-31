import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import Table from 'cli-table3';

const pluginsDir = path.join(os.homedir(), '.corox', 'plugins');

export async function installPlugin(url: string) {
  const spinner = ora(`Downloading plugin from ${url}...`).start();
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch plugin: ${response.statusText}`);
    
    const content = await response.text();
    
    // Extract filename from URL
    const filename = path.basename(new URL(url).pathname) || 'plugin.js';
    if (!filename.endsWith('.js')) {
      throw new Error('URL must point to a .js file');
    }

    await fs.mkdir(pluginsDir, { recursive: true });
    await fs.writeFile(path.join(pluginsDir, filename), content);
    
    spinner.succeed(null);
    logger.success(`Plugin ${filename} installed successfully! Restart Corox to apply.`);
  } catch (error) {
    spinner.fail('Installation failed');
    logger.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

export async function listPlugins() {
  try {
    const files = await fs.readdir(pluginsDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    if (jsFiles.length === 0) {
      logger.warn('No plugins installed.');
      return;
    }

    const table = new Table({
      head: ['Plugin File', 'Status'],
      colWidths: [30, 15],
      style: { head: ['cyan'] }
    });

    for (const file of jsFiles) {
      table.push([file, 'Active ✅']);
    }

    logger.title('Installed Plugins');
    console.log(table.toString());
  } catch (error) {
    logger.error('Failed to list plugins');
  }
}

export async function removePlugin(name: string) {
  try {
    const filePath = path.join(pluginsDir, name);
    await fs.unlink(filePath);
    logger.success(`Plugin ${name} removed successfully!`);
  } catch (error) {
    logger.error(`Could not remove plugin ${name}. Make sure the filename is correct.`);
  }
}
