import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { z } from 'zod';
import { logger } from './logger.js';

// Define Zod Schema for Config Validation
const StepSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
  parallel: z.boolean().optional(),
});

const WorkflowSchema = z.object({
  description: z.string().optional(),
  steps: z.array(StepSchema),
});

const ConfigSchema = z.object({
  settings: z.object({
    ai_provider: z.string().default('openai'),
    ai_model: z.string().default('gpt-3.5-turbo'),
    theme: z.string().default('dark'),
  }),
  trustedTools: z.array(z.string()).default([]),
  workflows: z.record(z.string(), WorkflowSchema).default({}),
});

type CoroxConfig = z.infer<typeof ConfigSchema>;

const DEFAULT_CONFIG: CoroxConfig = {
  settings: {
    ai_provider: 'openai',
    ai_model: 'gpt-3.5-turbo',
    theme: 'dark',
  },
  trustedTools: [],
  workflows: {},
};

class ConfigManager {
  private configPath = path.join(os.homedir(), '.coroxrc.json');

  async load(): Promise<CoroxConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Validate with Zod
      const result = ConfigSchema.safeParse(parsed);
      
      if (!result.success) {
        await logger.warn('Config validation failed. Some settings will be reverted to defaults.');
        result.error.issues.forEach(issue => {
          console.log(chalk.dim(`- ${issue.path.join('.')} ${issue.message}`));
        });
        return { ...DEFAULT_CONFIG, ...result.data };
      }
      
      return result.data;
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        await logger.error('Config corruption detected in .coroxrc.json. Reverting to defaults.');
      }
      return { ...DEFAULT_CONFIG };
    }
  }

  async set(key: 'settings' | 'workflows' | 'trustedTools', value: any): Promise<void> {
    const config = await this.load();
    (config as any)[key] = value;
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
