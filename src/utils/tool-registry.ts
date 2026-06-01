import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { logger } from './logger.js';
import { configManager } from './config-manager.js';
import { contextManager } from './context-manager.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

const execPromise = promisify(exec);

export interface ToolResult {
  content: string;
  success: boolean;
}

export class ToolRegistry {
  private tools: Record<string, (args: any) => Promise<ToolResult>> = {
    shell: async ({ command }) => {
      try {
        const { stdout, stderr } = await execPromise(command, {
          shell: process.env.SHELL || '/bin/sh'
        });
        return { content: stdout || stderr || 'Command executed successfully.', success: true };
      } catch (error: any) {
        return { content: error.stderr || error.message, success: false };
      }
    },
    list_files: async ({ path = '.', maxDepth = 3 }) => {
      try {
        const findCommand = process.platform === 'win32' 
          ? `dir /s /b ${path}` 
          : `find ${path} -maxdepth ${maxDepth} -not -path '*/.*' -not -path '*/node_modules/*' -not -path '*/dist/*'`;
        
        const { stdout } = await execPromise(findCommand);
        return { content: stdout || 'No files found.', success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    get_context: async ({ symbol }) => {
      try {
        const context = await contextManager.getContextForSymbol(symbol);
        return { content: context, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    get_project_map: async () => {
      try {
        const map = await contextManager.getGlobalMap();
        return { content: map, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    search_code: async ({ query, path = '.' }) => {
      try {
        // Use ripgrep (rg) if available, fallback to grep
        const searchCommand = `rg "${query}" ${path} --max-depth 5 || grep -r "${query}" ${path} | head -n 50`;
        const { stdout } = await execPromise(searchCommand);
        return { content: stdout || 'No matches found.', success: true };
      } catch (error: any) {
        // grep returns exit code 1 if no match is found
        if (error.message.includes('Command failed')) {
          return { content: 'No matches found for the given query.', success: true };
        }
        return { content: error.message, success: false };
      }
    },
    read: async ({ path }) => {
      try {
        const content = await fs.readFile(path, 'utf8');
        return { content, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    write: async ({ path, content }) => {
      try {
        await fs.writeFile(path, content, 'utf8');
        return { content: `File written successfully to ${path}`, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    edit: async ({ path, oldText, newText }) => {
      try {
        const content = await fs.readFile(path, 'utf8');
        if (!content.includes(oldText)) {
          return { content: `Error: Could not find the exact text to replace in ${path}`, success: false };
        }
        const updatedContent = content.replace(oldText, newText);
        await fs.writeFile(path, updatedContent, 'utf8');
        return { content: `Successfully replaced text in ${path}`, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    }
  };

  private async confirmAction(toolName: string, args: any): Promise<boolean> {
    const config = await configManager.load();
    
    // If tool is already trusted, skip confirmation
    if (config.trustedTools.includes(toolName)) {
      return true;
    }

    // Determine what to show in the prompt
    let actionDetail = '';
    if (toolName === 'shell') actionDetail = `Run command: ${chalk.yellow(args.command)}`;
    else if (toolName === 'write') actionDetail = `Write to file: ${chalk.yellow(args.path)}`;
    else if (toolName === 'edit') actionDetail = `Edit file: ${chalk.yellow(args.path)}`;
    else return true; // Non-dangerous tools don't need confirmation

    console.log(`\n${chalk.bgRed.white.bold(' SECURITY CHECK ')}`);
    console.log(`${chalk.bold('The AI Agent wants to:')} ${actionDetail}`);
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Do you allow this action?',
        choices: [
          { name: '✅ Yes', value: 'yes' },
          { name: '🛡️ Yes and don\'t ask again for this tool', value: 'trust' },
          { name: '❌ No', value: 'no' },
        ],
      },
    ]);

    if (choice === 'trust') {
      const currentTrusted = config.trustedTools || [];
      await configManager.set('trustedTools', [...currentTrusted, toolName]);
      logger.success(`${toolName} has been added to trusted tools.`);
      return true;
    }

    return choice === 'yes';
  }

  async execute(name: string, args: any): Promise<ToolResult> {
    // --- HUMAN IN THE LOOP ---
    const isAllowed = await this.confirmAction(name, args);
    if (!isAllowed) {
      return { content: 'User denied the action for security reasons.', success: false };
    }
    // --------------------------

    const tool = this.tools[name];
    if (!tool) return { content: `Tool ${name} not found.`, success: false };
    return await tool(args);
  }

  getToolDefinitions() {
    return [
      {
        name: 'shell',
        description: 'Execute a command in the system shell. Use this for any system operation.',
        parameters: { type: 'object', properties: { command: { type: 'string' } } }
      },
      {
        name: 'list_files',
        description: 'Recursively list files in a directory. Useful for understanding project structure.',
        parameters: { type: 'object', properties: { path: { type: 'string', default: '.' }, maxDepth: { type: 'number', default: 3 } } }
      },
      {
        name: 'get_context',
        description: 'Find which files contain a specific symbol (function, class). Useful for navigation.',
        parameters: { type: 'object', properties: { symbol: { type: 'string' } } }
      },
      {
        name: 'get_project_map',
        description: 'Get a global map of all symbols in the project. Use this at the start of complex tasks.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'search_code',
        description: 'Search for a specific string or pattern across the codebase.',
        parameters: { type: 'object', properties: { query: { type: 'string' }, path: { type: 'string', default: '.' } } }
      },
      {
        name: 'read',
        description: 'Read the content of a file.',
        parameters: { type: 'object', properties: { path: { type: 'string' } } }
      },
      {
        name: 'write',
        description: 'Create or overwrite a file with new content.',
        parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } }
      },
      {
        name: 'edit',
        description: 'Replace a specific block of text in a file. Use this for precise edits.',
        parameters: { type: 'object', properties: { path: { type: 'string' }, oldText: { type: 'string' }, newText: { type: 'string' } } }
      }
    ];
  }
}

export const toolRegistry = new ToolRegistry();
