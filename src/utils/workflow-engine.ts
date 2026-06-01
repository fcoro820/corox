import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';
import { sanitizeShellInput } from './security.js';
import { configManager } from './config-manager.js';
import chalk from 'chalk';

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
  async loadConfig(): Promise<CoroxConfig> {
    return { workflows: await configManager.getWorkflows() };
  }

  private async resolveVariables(command: string): Promise<string> {
    const variables: Record<string, string | Promise<string>> = {
      branch: this.getGitBranch(),
      user: os.userInfo().username,
      home: os.homedir(),
      cwd: process.cwd(),
    };

    const regex = /\${(\w+)}/g;
    const matches = [...command.matchAll(regex)];

    let resolvedCommand = command;

    for (const match of matches) {
      const fullMatch = match[0];
      const varName = match[1];

      if (varName in variables) {
        const rawValue = await (variables[varName] as Promise<string> | string);
        // Strict sanitization for variables to prevent injection
        const sanitizedValue = sanitizeShellInput(rawValue);
        resolvedCommand = resolvedCommand.replace(fullMatch, sanitizedValue);
      } else {
        await logger.warn(`Variable ${fullMatch} is not supported. Leaving as is.`);
      }
    }

    return resolvedCommand;
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

    await logger.title(`Executing Workflow: ${name}\n${workflow.description}`);
    
    const steps = workflow.steps;
    let i = 0;

    while (i < steps.length) {
      const step = steps[i];

      if (step.parallel) {
        const parallelBatch: WorkflowStep[] = [];
        while (i < steps.length && steps[i].parallel) {
          parallelBatch.push(steps[i]);
          i++;
        }

        await logger.info(`Running ${parallelBatch.length} steps in parallel...`);
        
        const results = await Promise.allSettled(
          parallelBatch.map(s => this.executeStep(s))
        );

        results.forEach((result, index) => {
          const stepName = parallelBatch[index].name;
          if (result.status === 'fulfilled') {
            const { stdout } = result.value;
            if (stdout) {
              console.log(chalk.cyan(`\n[${stepName}] output:`));
              console.log(chalk.dim(stdout));
            }
          } else {
            logger.error(`Step ${stepName} failed: ${result.reason}`);
          }
        });

        if (results.some(r => r.status === 'rejected')) {
          throw new Error(`Workflow failed during parallel execution of ${name}`);
        }
      } else {
        try {
          const { stdout } = await this.executeStep(step);
          if (stdout) console.log(chalk.dim(stdout));
        } catch (error) {
          await logger.error(`Step ${step.name} failed: ${error instanceof Error ? error.message : error}`);
          throw error;
        }
        i++;
      }
    }
    
    await logger.success(`Workflow ${name} completed successfully!`);
  }

  private async executeStep(step: WorkflowStep) {
    const resolvedCommand = await this.resolveVariables(step.command);
    await logger.info(`Running: ${step.name}...`);
    
    try {
      const { stdout, stderr } = await execPromise(resolvedCommand);
      return { stdout, stderr };
    } catch (error: any) {
      // Provide more detailed error if it's a shell error
      const errorMsg = error.stderr ? `Shell Error: ${error.stderr}` : error.message;
      throw new Error(errorMsg);
    }
  }
}
