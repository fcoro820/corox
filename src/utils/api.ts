import { logger } from './logger.js';

export async function checkLatestVersion() {
  logger.info('Checking for updates...');
  
  try {
    // Simulasi API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const latestVersion: string = '1.1.0'; // Mock value from "API"
    const currentVersion: string = '1.0.0';

    if (latestVersion !== currentVersion) {
      logger.warn(`A new version is available: ${latestVersion} (Current: ${currentVersion})`);
      logger.info('Run "npm update -g corox" to update.');
    } else {
      logger.success('You are using the latest version of Corox!');
    }
  } catch (error) {
    logger.error('Failed to check for updates. Please check your internet connection.');
  }
}
