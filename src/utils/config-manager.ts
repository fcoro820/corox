import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export interface CoroxConfig {
  settings: {
    ai_provider: string;
    ai_model: string;
    theme: string;
  };
  workflows: Record<string, {
    description: string;
    steps: Array<{
      name: string;
      command: string;
      parallel?: boolean;
    }>;
  }>;
}

const DEFAULT_CONFIG: CoroxConfig = {
  settings: {
    ai_provider: 'openai',
    ai_model: 'gpt-3.5-turbo',
    theme: 'dark',
  },
  workflows: {},
};

class ConfigManager {
  private configPath = path.join(os.homedir(), '.coroxrc.json');

  async load(): Promise<CoroxConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const parsed = JSON.parse(data);
      
      return {
        settings: { ...DEFAULT_CONFIG.settings, ...parsed.settings },
        workflows: { ...DEFAULT_CONFIG.workflows, ...parsed.workflows },
      };
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(chalk.red('❌ Config corruption detected in .coroxrc.json. Reverting to defaults.'));
      }
      return { ...DEFAULT_CONFIG };
    }
  }

  async set(key: 'settings' | 'workflows', value: any): Promise<void> {
    const config = await this.load();
    config[key] = value;
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  async getSetting(key: string): Promise<string> {
    const config = await this.load();
    return (config.settings as any)[key] || DEFAULT_CONFIG.settings[key as keyof typeof DEFAULT_CONFIG.settings];
  }

  async getWorkflows(): Promise<Record<string, any>> {
    const config = await this.load();
    return config.workflows;
  }
}

export const configManager = new ConfigManager();
