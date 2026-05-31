import { describe, it, expect, vi } from 'vitest';
import { loadPlugins } from '../src/utils/plugin-loader.js';
import { Command } from 'commander';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('Plugin Loader', () => {
  it('should handle empty plugin directory gracefully', async () => {
    (fs.readdir as any).mockResolvedValue([]);
    const program = new Command();
    await expect(loadPlugins(program)).resolves.not.toThrow();
  });
});
