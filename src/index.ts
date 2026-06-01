#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from './utils/logger.js';
import { setupProject } from './commands/setup.js';
import { checkStatus } from './commands/status.js';
import { configureSettings } from './commands/settings.js';
import { showSystemInfo } from './commands/system.js';
import { explainCode, fixError, aiMenu } from './commands/ai.js';
import { cleanModules } from './commands/clean.js';
import { killPort } from './commands/network.js';
import { makeRequest } from './commands/http.js';
import { aiCommit } from './commands/git.js';
import { listLocalModels } from './commands/model.js';
import { runWorkflow, listWorkflows } from './commands/workflow.js';
import { installPlugin, listPlugins, removePlugin } from './commands/plugin.js';
import { startDashboard } from './tui/dashboard.js';
import { checkLatestVersion } from './utils/api.js';
import { loadPlugins } from './utils/plugin-loader.js';
import { trackUsage } from './utils/telemetry.js';
import chalk from 'chalk';

const program = new Command();

async function runSafe(fn: () => Promise<void>, commandName?: string, args: any[] = []) {
  try {
    if (commandName) {
      // Hooks logic is handled in plugin-loader
      // We'll assume activeHooks is handled globally or via a separate utility
      // For simplicity, we'll just run the function here.
    }

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
          'Open Dashboard',
          'Setup Project',
          'Check Status',
          'System Info',
          'Corox AI',
          'Run Workflow',
          'List Workflows',
          'Manage Plugins',
          'Port Killer',
          'API Request',
          'AI Git Commit',
          'Clean node_modules',
          'Configure Settings',
          'Exit'
        ],
      },
    ]);

    switch (action) {
      case 'Open Dashboard':
        await runSafe(startDashboard, 'dashboard');
        break;
      case 'Setup Project':
        await runSafe(setupProject, 'init');
        break;
      case 'Check Status':
        await runSafe(checkStatus, 'status');
        break;
      case 'System Info':
        await runSafe(showSystemInfo, 'sys-info');
        break;
      case 'Corox AI':
        await runSafe(aiMenu, 'ai-menu');
        break;
      case 'Run Workflow':
        const { wfName } = await inquirer.prompt([{ type: 'input', name: 'wfName', message: 'Enter workflow name:' }]);
        await runSafe(() => runWorkflow(wfName), 'run-workflow', [wfName]);
        break;
      case 'List Workflows':
        await runSafe(listWorkflows, 'list-workflows');
        break;
      case 'Manage Plugins':
        const { pluginAction } = await inquirer.prompt([
          {
            type: 'select',
            name: 'pluginAction',
            message: 'Plugin Management:',
            choices: ['Install Plugin', 'List Plugins', 'Remove Plugin', 'Back'],
          }
        ]);
        if (pluginAction === 'Install Plugin') {
          const { url } = await inquirer.prompt([{ type: 'input', name: 'url', message: 'Plugin URL:' }]);
          await runSafe(() => installPlugin(url), 'plugin-install', [url]);
        } else if (pluginAction === 'List Plugins') {
          await runSafe(listPlugins, 'plugin-list');
        } else if (pluginAction === 'Remove Plugin') {
          const { name } = await inquirer.prompt([{ type: 'input', name: 'name', message: 'Plugin filename to remove:' }]);
          await runSafe(() => removePlugin(name), 'plugin-remove', [name]);
        }
        break;
      case 'Port Killer':
        const { port } = await inquirer.prompt([{ type: 'input', name: 'port', message: 'Enter port to kill:' }]);
        await runSafe(() => killPort(port), 'port', [port]);
        break;
      case 'API Request':
        const { method, url } = await inquirer.prompt([
          { type: 'input', name: 'method', message: 'Method (GET/POST):', default: 'GET' },
          { type: 'input', name: 'url', message: 'URL:' }
        ]);
        await runSafe(() => makeRequest(method, url), 'request', [method, url]);
        break;
      case 'AI Git Commit':
        await runSafe(aiCommit, 'commit');
        break;
      case 'Clean node_modules':
        await runSafe(() => cleanModules(), 'clean');
        break;
      case 'Configure Settings':
        await runSafe(configureSettings, 'config');
        break;
      case 'Exit':
        logger.warn('Goodbye! 👋');
        process.exit(0);
    }
    console.log('\n');
  }
}

program
  .name('corox-cli')
  .description('Interactive CLI tool built with Node.js')
  .version('1.0.0');

program
  .command('dashboard')
  .description('Launch the interactive TUI dashboard')
  .action(async () => {
    await trackUsage('dashboard');
    await runSafe(startDashboard, 'dashboard');
  });

program
  .command('init')
  .description('Initialize a new project')
  .action(async () => {
    await trackUsage('init');
    await runSafe(setupProject, 'init');
  });

program
  .command('status')
  .description('Check current status')
  .action(async () => {
    await trackUsage('status');
    await runSafe(checkStatus, 'status');
  });

program
  .command('sys-info')
  .description('Show system and node information')
  .action(async () => {
    await trackUsage('sys-info');
    // Import needed for this specific action
    await runSafe(() => (await import('./commands/system.js')).showSystemInfo(), 'sys-info');
  });

program
  .command('run <name>')
  .description('Execute a predefined workflow from .coroxrc')
  .action(async (name) => {
    await trackUsage('run-workflow');
    await runSafe(() => runWorkflow(name), 'run-workflow', [name]);
  });

program
  .command('workflows')
  .description('List all available workflows')
  .action(async () => {
    await trackUsage('list-workflows');
    await runSafe(listWorkflows, 'list-workflows');
  });

program
  .command('model')
  .description('List installed local AI models (Ollama)')
  .action(async () => {
    await trackUsage('model');
    await runSafe(() => (await import('./commands/model.js')).listLocalModels(), 'model');
  });

program
  .command('port <number>')
  .description('Kill process running on a specific port')
  .action(async (number) => {
    await trackUsage('port');
    await runSafe(() => killPort(number), 'port', [number]);
  });

program
  .command('request <method> <url>')
  .description('Make an HTTP request and show formatted output')
  .action(async (method, url) => {
    await trackUsage('request');
    await runSafe(() => makeRequest(method, url), 'request', [method, url]);
  });

program
  .command('commit')
  .description('Generate and apply AI commit message from staged changes')
  .action(async () => {
    await trackUsage('commit');
    await runSafe(aiCommit, 'commit');
  });

program
  .command('ai-explain <file>')
  .description('Explain a piece of code using AI')
  .action(async (file) => {
    await trackUsage('ai-explain');
    await runSafe(() => explainCode(file), 'ai-explain', [file]);
  });

program
  .command('ai-fix <error>')
  .description('Find a solution for an error using AI')
  .action(async (error) => {
    await trackUsage('ai-fix');
    await runSafe(() => fixError(error), 'ai-fix', [error]);
  });

program
  .command('clean <path>')
  .description('Recursively remove all node_modules in a directory')
  .action(async (path) => {
    await trackUsage('clean');
    await runSafe(() => cleanModules(path || process.cwd()), 'clean', [path]);
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
  .command('config')
  .description('Configure Corox settings')
  .action(async () => {
    await trackUsage('config');
    await runSafe(configureSettings, 'config');
  });

async function run() {
  await loadPlugins(program);
  if (!process.argv.slice(2).length) {
    // For TUI experience, we can either keep the menu or go straight to dashboard
    // Let's keep the menu but add "Open Dashboard" as the first option.
    await mainMenu();
  } else {
    program.parse(process.argv);
  }
}

run();
