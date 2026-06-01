import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ToolRegistry } from '../src/utils/tool-registry.js';

describe('ToolRegistry', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'corox-tools-'));
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.writeFile(path.join(tempDir, 'src', 'sample.ts'), 'const target = "needle";\n', 'utf8');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('lists files without evaluating shell metacharacters in the path', async () => {
    const registry = new ToolRegistry();
    const sentinel = path.join(tempDir, 'sentinel');

    const result = await registry.execute('list_files', {
      path: `${tempDir}; touch ${sentinel}`,
      maxDepth: 2,
    });

    await expect(fs.access(sentinel)).rejects.toThrow();
    expect(result.success).toBe(false);
  });

  it('searches code without evaluating shell metacharacters in the query', async () => {
    const registry = new ToolRegistry();
    const sentinel = path.join(tempDir, 'sentinel');

    const result = await registry.execute('search_code', {
      path: tempDir,
      query: `needle"; touch ${sentinel}; "`,
    });

    await expect(fs.access(sentinel)).rejects.toThrow();
    expect(result.success).toBe(true);
    expect(result.content).toBe('No matches found.');
  });

  it('returns literal search matches from searchable files', async () => {
    const registry = new ToolRegistry();

    const result = await registry.execute('search_code', {
      path: tempDir,
      query: 'needle',
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain('sample.ts:1:const target = "needle";');
  });
});
