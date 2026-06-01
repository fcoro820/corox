import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ContextManager } from '../src/utils/context-manager.js';

describe('ContextManager', () => {
  let originalCwd: string;
  let tempDir: string;
  let cachePath: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'corox-context-'));
    cachePath = path.join(tempDir, 'symbol-cache.json');
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext' }, include: ['src/**/*'] }),
      'utf8'
    );
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('indexes TypeScript symbols from the current project', async () => {
    await fs.writeFile(
      path.join(tempDir, 'src', 'sample.ts'),
      'export class SampleService {}\nexport function runSample() {}\n',
      'utf8'
    );

    const manager = new ContextManager();
    (manager as any).cachePath = cachePath;

    await manager.init();

    await expect(manager.getContextForSymbol('SampleService')).resolves.toContain('SampleService found');
    await expect(manager.getContextForSymbol('runSample')).resolves.toContain('runSample found');
  });

  it('ignores symbol cache from a different project root', async () => {
    await fs.writeFile(
      cachePath,
      JSON.stringify({
        projectRoot: '/some/other/project',
        symbols: {
          StaleSymbol: [{ name: 'StaleSymbol', type: 'class', filePath: '/old/file.ts', line: 1 }],
        },
      }),
      'utf8'
    );
    await fs.writeFile(path.join(tempDir, 'src', 'fresh.ts'), 'export class FreshSymbol {}\n', 'utf8');

    const manager = new ContextManager();
    (manager as any).cachePath = cachePath;

    await manager.init();

    await expect(manager.getContextForSymbol('FreshSymbol')).resolves.toContain('FreshSymbol found');
    await expect(manager.getContextForSymbol('StaleSymbol')).resolves.toContain('not found');
  });
});
