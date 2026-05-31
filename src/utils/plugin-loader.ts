import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';
import { CoroxPlugin, PluginHooks } from '../types/plugin.js';

export const activeHooks: {
  beforeCommand: PluginHooks['beforeCommand'][];
  afterCommand: PluginHooks['afterCommand'][];
} = {
  beforeCommand: [],
  afterCommand: [],
};

export async function loadPlugins(program: Command) {
  const pluginsDir = path.join(os.homedir(), '.corox', 'plugins');
  
  try {
    await fs.mkdir(pluginsDir, { recursive: true });
    const files = await fs.readdir(pluginsDir);
    const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));

    if (jsFiles.length === 0) return;

    for (const file of jsFiles) {
      const pluginPath = path.join(pluginsDir, file);
      const pluginModule = await import(`file://${pluginPath}`);
      const plugin: CoroxPlugin = pluginModule.default;
      
      if (plugin && plugin.init && plugin.metadata) {
        // 1. Run core initialization
        plugin.init(program);
        
        // 2. Register hooks if they exist
        if (plugin.hooks) {
          if (plugin.hooks.beforeCommand) activeHooks.beforeCommand.push(plugin.hooks.beforeCommand);
          if (plugin.hooks.afterCommand) activeHooks.afterCommand.push(plugin.hooks.afterCommand);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to load plugins: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
