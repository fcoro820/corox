import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import { logger } from '../utils/logger.js';

async function findNodeModules(dir: string, found: string[] = []) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.lstat(fullPath);
    
    if (stat.isDirectory()) {
      if (file === 'node_modules') {
        found.push(fullPath);
      } else {
        await findNodeModules(fullPath, found);
      }
    }
  }
  return found;
}

export async function cleanModules(targetDir: string = process.cwd()) {
  const spinner = ora(`Searching for node_modules in ${targetDir}...`).start();
  
  try {
    const modules = await findNodeModules(targetDir);
    
    if (modules.length === 0) {
      spinner.warn('No node_modules folders found.');
      return;
    }

    spinner.text = `Found ${modules.length} node_modules folders. Cleaning...`;
    
    for (const mod of modules) {
      await fs.rm(mod, { recursive: true, force: true });
    }
    
    spinner.succeed(`Successfully cleaned ${modules.length} node_modules folders!`);
    logger.success('Disk space recovered. ✅');
  } catch (error) {
    spinner.fail('Cleanup failed');
    logger.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
