import { WorkflowEngine } from '../utils/workflow-engine.js';
import { logger } from '../utils/logger.js';
import Table from 'cli-table3';
import { configManager } from '../utils/config-manager.js';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

const engine = new WorkflowEngine();

export async function runWorkflow(name: string) {
  try {
    await engine.runWorkflow(name);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Workflow execution failed');
  }
}

export async function importWorkflow(url: string) {
  const spinner = ora('Fetching workflow from remote...').start();
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const remoteConfig = await response.json();
    
    if (!remoteConfig.workflows || typeof remoteConfig.workflows !== 'object') {
      throw new Error('Invalid workflow format. Expected a JSON with a "workflows" object.');
    }

    // --- SECURITY INSPECTION ---
    const allCommands = Object.values(remoteConfig.workflows)
      .flatMap((wf: any) => wf.steps.map((s: any) => s.command));

    spinner.stop();
    logger.title('🔍 Security Inspection: Remote Workflows');
    console.log(chalk.dim('The following commands will be added to your system:'));
    allCommands.forEach(cmd => console.log(chalk.yellow(`- ${cmd}`)));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '\nDo these commands look safe to you?',
        default: false
      }
    ]);

    if (!confirm) {
      logger.warn('Import cancelled. Malicious commands detected or distrusted.');
      return;
    }
    // --- END SECURITY INSPECTION ---

    const currentWorkflows = await configManager.getWorkflows();
    const mergedWorkflows = { ...currentWorkflows, ...remoteConfig.workflows };
    
    await configManager.set('workflows', mergedWorkflows);
    
    logger.success(`Successfully imported ${Object.keys(remoteConfig.workflows).length} workflow(s)!`);
    logger.info('You can now run them using "corox run <name>"');
  } catch (error) {
    spinner.fail('Failed to import workflow');
    logger.error(error instanceof Error ? error.message : 'An unknown error occurred during import');
  }
}

export async function listWorkflows() {
  const config = await engine.loadConfig();
  const workflows = config.workflows;

  if (Object.keys(workflows).length === 0) {
    logger.warn('No workflows defined in ~/.coroxrc');
    console.log('\nCreate a ~/.coroxrc file to define your workflows.');
    return;
  }

  const table = new Table({
    head: ['Workflow Name', 'Description'],
    colWidths: [25, 50],
    style: { head: ['cyan'] }
  });

  for (const [name, wf] of Object.entries(workflows)) {
    table.push([name, wf.description]);
  }

  logger.title('Available Workflows');
  console.log(table.toString());
  logger.info('Use "corox run <name>" to execute.');
}
