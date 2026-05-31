import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';
import { CoroxPlugin } from '../types/plugin.js';

export async function loadPlugins(program: Command) {
  const pluginsDir = path.join(os.homedir(), '.corox', 'plugins');
  
  try {
    await fs.mkdir(pluginsDir, { recursive: true });
    const files = await fs.readdir(pluginsDir);
    const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));

    if (jsFiles.length === 0) return;

    logger.info(`Loading ${jsFiles.length} plugin(s)...`);

    for (const file of jsFiles) {
      const pluginPath = path.join(pluginsDir, file);
      const pluginModule = await import(`file://${pluginPath}`);
      const plugin: CoroxPlugin = pluginModule.default;
      
      if (plugin && plugin.init && plugin.metadata) {
        plugin.init(program);
        logger.info(`Plugin loaded: ${plugin.metadata.name} v${plugin.metadata.version} - ${plugin.metadata.description}`);
      } else {
        logger.warn(`Plugin ${file} is invalid. It must export a default object with metadata and init function.`);
      }
    }
  } catch (error) {
    logger.error('Failed to load plugins: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
