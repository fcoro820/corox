import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configManager } from '../src/utils/config-manager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

vi.mock('fs/promises');

describe('ConfigManager', () => {
  const mockPath = path.join(os.homedir(), '.coroxrc.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load default config if file does not exist', async () => {
    (fs.readFile as any).mockRejectedValue({ code: 'ENOENT' });
    
    const config = await configManager.load();
    
    expect(config.settings.ai_provider).toBe('openai');
    expect(config.workflows).toEqual({});
  });

  it('should load and merge user config correctly', async () => {
    const userConfig = {
      settings: { ai_provider: 'ollama' },
      workflows: { test: { description: 'test', steps: [] } }
    };
    (fs.readFile as any).mockResolvedValue(JSON.stringify(userConfig));
    
    const config = await configManager.load();
    
    expect(config.settings.ai_provider).toBe('ollama');
    expect(config.settings.theme).toBe('dark'); // Default value merged
    expect(config.workflows.test.description).toBe('test');
  });

  it('should handle corrupted JSON by reverting to defaults', async () => {
    (fs.readFile as any).mockResolvedValue('INVALID JSON {[[');
    
    const config = await configManager.load();
    
    expect(config.settings.ai_provider).toBe('openai');
  });

  it('should save settings correctly', async () => {
    (fs.readFile as any).mockResolvedValue(JSON.stringify({ settings: {}, workflows: {} }));
    
    await configManager.set('settings', { ai_provider: 'groq', ai_model: 'llama3', theme: 'light' });
    
    expect(fs.writeFile).toHaveBeenCalledWith(
      mockPath,
      expect.stringContaining('"ai_provider": "groq"'),
      'utf8'
    );
  });
});
