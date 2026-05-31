#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from './utils/logger.js';
import { setupProject } from './commands/setup.js';
import { checkStatus } from './commands/status.js';
import { configureSettings } from './commands/settings.js';
import { showSystemInfo } from './commands/system.js';
import { checkLatestVersion } from './utils/api.js';
import { loadPlugins } from './utils/plugin-loader.js';
import { trackUsage } from './utils/telemetry.js';
import { env } from './utils/env.js';

const program = new Command();

// Global Error Handler Wrapper
async function runSafe(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (error) {
    logger.error('An unexpected error occurred:');
    if (error instanceof Error) {
      console.error(chalk.dim(error.stack));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Import chalk for the wrapper above
import chalk from 'chalk';

async function mainMenu() {
  while (true) {
    await checkLatestVersion();
    logger.title('Welcome to Corox CLI! 🚀');
    console.log(chalk.dim('The powerful interactive tool for your workflow.\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'select',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Setup Project',
          'Check Status',
          'System Info',
          'Configure Settings',
          'Exit'
        ],
      },
    ]);

    switch (action) {
      case 'Setup Project':
        await runSafe(setupProject);
        break;
      case 'Check Status':
        await runSafe(checkStatus);
        break;
      case 'System Info':
        await runSafe(showSystemInfo);
        break;
      case 'Configure Settings':
        await runSafe(configureSettings);
        break;
      case 'Exit':
        logger.warn('Goodbye! 👋');
        process.exit(0);
    }
    console.log('\n'); // Space before returning to menu
  }
}

program
  .name('corox')
  .description('Interactive CLI tool built with Node.js')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .action(async () => {
    await trackUsage('init');
    await runSafe(setupProject);
  });

program
  .command('status')
  .description('Check current status')
  .action(async () => {
    await trackUsage('status');
    await runSafe(checkStatus);
  });

program
  .command('sys-info')
  .description('Show system and node information')
  .action(async () => {
    await trackUsage('sys-info');
    await runSafe(showSystemInfo);
  });

program
  .command('completions')
  .description('Generate shell completion script')
  .action(async () => {
    await trackUsage('completions');
    console.log('# Corox Shell Completion Script');
    console.log('complete -C "corox"'); 
    logger.success('Completion script generated. Add this to your .bashrc or .zshrc');
  });

program
  .command('env')
  .description('List all loaded API keys from .env')
  .action(async () => {
    await trackUsage('env');
    const keys = env.listLoadedKeys();
    
    if (keys.length === 0) {
      logger.warn('No .env file found or no keys defined.');
      return;
    }

    logger.title('Loaded Environment Variables');
    console.log('--------------------------------------------------');
    keys.forEach(key => {
      const value = env.get(key);
      console.log(`${key.padEnd(20)}: ${env.maskValue(value)}`);
    });
    console.log('--------------------------------------------------');
  });

program
  .command('config')
  .description('Configure Corox settings')
  .action(async () => {
    await trackUsage('config');
    await runSafe(configureSettings);
  });

async function run() {
  // 1. Load Plugins first
  await loadPlugins(program);

  if (!process.argv.slice(2).length) {
    await mainMenu();
  } else {
    program.parse(process.argv);
  }
}

run();
