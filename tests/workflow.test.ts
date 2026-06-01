import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowEngine } from '../src/utils/workflow-engine.js';
import { configManager } from '../src/utils/config-manager.js';

vi.mock('child_process', () => ({
  exec: vi.fn()
}));
import { exec } from 'child_process';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
    vi.clearAllMocks();
  });

  it('should correctly resolve variables', async () => {
    vi.spyOn(configManager, 'getWorkflows').mockResolvedValue({
      test: {
        description: 'Test Workflow',
        steps: [{ name: 'Step 1', command: 'echo ${branch}' }]
      }
    });

    (exec as any).mockImplementation((cmd, cb: any) => {
      if (cmd.includes('git rev-parse')) {
        cb(null, { stdout: 'feature/test-branch' });
      } else {
        cb(null, { stdout: 'success' });
      }
    });

    await engine.runWorkflow('test');
    
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('echo feature/test-branch'),
      expect.any(Function)
    );
  });

  it('should execute steps sequentially', async () => {
    vi.spyOn(configManager, 'getWorkflows').mockResolvedValue({
      seq: {
        description: 'Sequential Workflow',
        steps: [
          { name: 'S1', command: 'cmd1' },
          { name: 'S2', command: 'cmd2' }
        ]
      }
    });
    (exec as any).mockImplementation((cmd, cb: any) => cb(null, { stdout: 'ok' }));

    await engine.runWorkflow('seq');
    
    expect(exec).toHaveBeenCalledTimes(4);
  });

  it('should execute steps in parallel when flagged', async () => {
    vi.spyOn(configManager, 'getWorkflows').mockResolvedValue({
      par: {
        description: 'Parallel Workflow',
        steps: [
          { name: 'P1', command: 'cmd1', parallel: true },
          { name: 'P2', command: 'cmd2', parallel: true },
          { name: 'S1', command: 'cmd3' }
        ]
      }
    });
    (exec as any).mockImplementation((cmd, cb: any) => cb(null, { stdout: 'ok' }));

    await engine.runWorkflow('par');
    
    expect(exec).toHaveBeenCalledTimes(6);
  });

  it('should throw error if workflow is not found', async () => {
    vi.spyOn(configManager, 'getWorkflows').mockResolvedValue({});
    await expect(engine.runWorkflow('unknown')).rejects.toThrow('Workflow "unknown" not found');
  });
});
