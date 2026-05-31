import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js';

// Load .env from root directory
dotenv.config();

export const env = {
  get: (key: string, defaultValue: string | undefined = undefined): string | undefined => {
    return process.env[key] || defaultValue;
  },
  
  // Check which keys are currently loaded from .env
  listLoadedKeys: () => {
    const loadedKeys: string[] = [];
    // We check process.env, but to specifically find .env file keys:
    try {
      const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
      envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=/);
        if (match) loadedKeys.push(match[1]);
      });
    } catch (e) {
      // .env file might not exist
    }
    return loadedKeys;
  },

  // Utility to mask API keys for security when displaying them
  maskValue: (value: string | undefined) => {
    if (!value) return 'NOT SET';
    if (value.length <= 8) return '********';
    return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
  }
};

export function validateEnv(requiredKeys: string[]) {
  const missing = requiredKeys.filter(key => !process.env[key]);
  if (missing.length > 0) {
    logger.warn(`Missing environment variables: ${missing.join(', ')}`);
    logger.info('Please add them to your .env file.');
    return false;
  }
  return true;
}
