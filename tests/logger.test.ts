import { describe, it, expect, vi } from 'vitest';
import { logger } from '../src/utils/logger.js';

describe('Logger Utility', () => {
  it('should call console.log when info is called', () => {
    const spy = vi.spyOn(console, 'log');
    logger.info('test info');
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain('ℹ test info');
    spy.mockRestore();
  });

  it('should call console.log when success is called', () => {
    const spy = vi.spyOn(console, 'log');
    logger.success('test success');
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain('✔ test success');
    spy.mockRestore();
  });

  it('should call console.log when error is called', () => {
    const spy = vi.spyOn(console, 'log');
    logger.error('test error');
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain('✖ test error');
    spy.mockRestore();
  });
});
