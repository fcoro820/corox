import { logger } from './logger.js';

/**
 * Sanitize strings to prevent shell injection attacks.
 * It escapes characters that could be used to chain commands or redirect output.
 */
export function sanitizeShellInput(input: string): string {
  if (!input) return '';
  
  // List of dangerous characters in shell
  const dangerousChars = /[;&|`$><!\n\r]/g;
  
  if (dangerousChars.test(input)) {
    logger.warn(`Potential shell injection detected in input: "${input}". Escaping dangerous characters.`);
    // Escape dangerous characters by adding a backslash
    return input.replace(dangerousChars, (match) => `\\${match}`);
  }
  
  return input;
}
