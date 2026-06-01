import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';

const execPromise = promisify(exec);

export interface WorkflowStep {
  name: string;
  command: string;
  parallel?: boolean;
}

export interface Workflow {
  description: string;
  steps: WorkflowStep[];
}

export interface CoroxConfig {
  workflows: Record<string, Workflow>;
}

export class WorkflowEngine {
  private configPath = path.join(os.homedir(), '.coroxrc');

  async loadConfig(): Promise<CoroxConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Return default empty config if file doesn't exist
      return { workflows: {} };
    }
  }

  private async resolveVariables(command: string): Promise<string> {
    // Simple variable replacement
    const branch = await this.getGitBranch();
    return command.replace(/\\${branch}/g, branch);
  }

  private async getGitBranch(): Promise<string> {
    try {
      const { stdout } = await execPromise('git rev-parse --abbrev-ref HEAD');
      return stdout.trim();
    } catch {
      return 'main';
    }
  }

  async runWorkflow(name: string) {
    const config = await this.loadConfig();
    const workflow = config.workflows[name];

    if (!workflow) {
      throw new Error(`Workflow "${name}" not found in .coroxrc`);
    }

    logger.title(`Executing Workflow: ${name}\n${workflow.description}`);
    
    const queue: WorkflowStep[] = [];
    
    for (const step of workflow.steps) {
      if (step.parallel) {
        // Execute parallel block
        const parallelSteps = [];
        // Collect all subsequent parallel steps
        // (In this simple version, we just run the current one in parallel)
        parallelSteps.push(this.executeStep(step));
        // Note: Real parallel blocks would need a different array structure in config
        await Promise.all(parallelSteps);
      } else {
        // Execute sequential
        await this.executeStep(step);
      }
    }
    
    logger.success(`Workflow ${name} completed successfully!`);
  }

  private async executeStep(step: WorkflowStep) {
    const resolvedCommand = await this.resolveVariables(step.command);
    logger.info(`Running: ${step.name}...`);
    
    try {
      const { stdout } = await execPromise(resolvedCommand);
      if (stdout) console.log(chalk.dim(stdout));
    } catch (error: any) {
      logger.error(`Step ${step.name} failed: ${error.message}`);
      throw error;
    }
  }
}

import chalk from 'chalk';
