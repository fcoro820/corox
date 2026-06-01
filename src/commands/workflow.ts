import { WorkflowEngine } from '../utils/workflow-engine.js';
import { logger } from '../utils/logger.js';
import Table from 'cli-table3';

const engine = new WorkflowEngine();

export async function runWorkflow(name: string) {
  try {
    await engine.runWorkflow(name);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Workflow execution failed');
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
