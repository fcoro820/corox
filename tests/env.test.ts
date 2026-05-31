import { describe, it, expect, vi } from 'vitest';
import { env, validateEnv } from '../src/utils/env.js';
import fs from 'fs';

vi.mock('fs');

describe('Env Utility', () => {
  it('should mask values correctly', () => {
    expect(env.maskValue('sk-1234567890abcdef')).toBe('sk-1****cdef');
    expect(env.maskValue('short')).toBe('********');
    expect(env.maskValue(undefined)).toBe('NOT SET');
  });

  it('should return default value if key is missing', () => {
    expect(env.get('NON_EXISTENT_KEY', 'default')).toBe('default');
  });

  it('should validate env keys correctly', () => {
    process.env.TEST_KEY = 'exists';
    expect(validateEnv(['TEST_KEY'])).toBe(true);
    expect(validateEnv(['MISSING_KEY'])).toBe(false);
    delete process.env.TEST_KEY;
  });
});
