import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { configManager } from './config-manager.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { z } from 'zod';

export interface ToolResult {
  content: string;
  success: boolean;
}

// Define Schemas for Tool Arguments to prevent AI hallucinations
const ToolSchemas = {
  shell: z.object({ command: z.string().min(1) }),
  read: z.object({ path: z.string().min(1) }),
  write: z.object({ path: z.string().min(1), content: z.string() }),
  edit: z.object({ path: z.string().min(1), oldText: z.string(), newText: z.string() }),
  list_files: z.object({ path: z.string().default('.'), maxDepth: z.number().int().min(0).max(10).default(3) }),
  search_code: z.object({ query: z.string().min(1), path: z.string().default('.') }),
  get_context: z.object({ symbol: z.string().min(1) }),
  get_project_map: z.object({}),
};

const SKIPPED_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
async function walkFiles(root: string, maxDepth: number): Promise<string[]> {
  const resolvedRoot = path.resolve(root);
  const files: string[] = [];

  const walk = async (dir: string, depth: number) => {
    if (depth > maxDepth) return;

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || SKIPPED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  };

  await walk(resolvedRoot, 0);
  return files;
}

export class ToolRegistry {
  private tools: Record<string, (args: any) => Promise<ToolResult>> = {
    shell: async ({ command }) => {
      try {
        // Hardening: Forbidden patterns check
        const forbidden = ['rm -rf /', 'mkfs', 'dd if='];
        if (forbidden.some(p => command.includes(p))) {
          throw new Error('Security Violation: Forbidden command detected.');
        }

        // The shell tool is privileged and remains behind the human confirmation prompt.
        const [cmd, ...args] = command.split(' ');
        
        return new Promise((resolve) => {
          const child = spawn(cmd, args, { shell: true });
          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data) => { stdout += data; });
          child.stderr.on('data', (data) => { stderr += data; });

          child.on('close', (code) => {
            if (code !== 0) resolve({ content: stderr || `Process exited with code ${code}`, success: false });
            resolve({ content: stdout || 'Command executed successfully.', success: true });
          });

          // Safety timeout
          setTimeout(() => {
            child.kill();
            resolve({ content: 'Command timed out after 60s', success: false });
          }, 60000);
        });
      } catch (error: any) {
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
          return { content: `Error: Could not find text to replace in ${path}`, success: false };
        }
        const updated = content.replace(oldText, newText);
        await fs.writeFile(path, updated, 'utf8');
        return { content: `Successfully edited ${path}`, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    list_files: async ({ path = '.', maxDepth = 3 }) => {
      try {
        const files = await walkFiles(path, maxDepth);
        const content = files
          .map(file => pathRelative(process.cwd(), file))
          .join('\n');
        return { content: content || 'No files found.', success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    search_code: async ({ query, path = '.' }) => {
      try {
        const needle = String(query);
        const files = await walkFiles(path, 5);
        const matches: string[] = [];

        for (const file of files) {
          let content: string;
          try {
            content = await fs.readFile(file, 'utf8');
          } catch {
            continue;
          }

          if (!content.includes(needle)) continue;

          const lines = content.split(/\r?\n/);
          for (let index = 0; index < lines.length; index++) {
            if (lines[index].includes(needle)) {
              matches.push(`${pathRelative(process.cwd(), file)}:${index + 1}:${lines[index]}`);
              if (matches.length >= 50) {
                return { content: matches.join('\n'), success: true };
              }
            }
          }
        }

        if (matches.length > 0) {
          return { content: matches.join('\n'), success: true };
        }

        return { content: 'No matches found.', success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    get_context: async ({ symbol }) => {
      try {
        const { contextManager } = await import('./context-manager.js');
        const res = await contextManager.getContextForSymbol(symbol);
        return { content: res, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    },
    get_project_map: async () => {
      try {
        const { contextManager } = await import('./context-manager.js');
        const res = await contextManager.getGlobalMap();
        return { content: res, success: true };
      } catch (error: any) {
        return { content: error.message, success: false };
      }
    }
  };

  private async confirmAction(toolName: string, args: any): Promise<boolean> {
    const config = await configManager.load();
    if (config.trustedTools.includes(toolName)) return true;

    let detail = '';
    if (toolName === 'shell') detail = `Run command: ${chalk.yellow(args.command)}`;
    else if (toolName === 'write') detail = `Write to: ${chalk.yellow(args.path)}`;
    else if (toolName === 'edit') detail = `Edit: ${chalk.yellow(args.path)}`;
    else return true;

    console.log(`\n${chalk.bgRed.white.bold(' SECURITY CHECK ')}`);
    console.log(`${chalk.bold('The AI Agent wants to:')} ${detail}`);
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Do you allow this action?',
        choices: [
          { name: '✅ Yes', value: 'yes' },
          { name: '🛡️ Yes and trust this tool', value: 'trust' },
          { name: '❌ No', value: 'no' },
        ],
      },
    ]);

    if (choice === 'trust') {
      const current = config.trustedTools || [];
      await configManager.set('trustedTools', [...current, toolName]);
      return true;
    }
    return choice === 'yes';
  }

  async execute(name: string, args: any): Promise<ToolResult> {
    // 1. Argument Validation (Zero-Crash)
    const schema = ToolSchemas[name as keyof typeof ToolSchemas];
    if (schema) {
      const validation = schema.safeParse(args);
      if (!validation.success) {
        return { 
          content: `Invalid arguments for tool ${name}: ${validation.error.message}`, 
          success: false 
        };
      }
    }

    // 2. Human-in-the-Loop
    const isAllowed = await this.confirmAction(name, args);
    if (!isAllowed) return { content: 'User denied the action.', success: false };

    const tool = this.tools[name];
    if (!tool) return { content: `Tool ${name} not found.`, success: false };
    return await tool(args);
  }

  getToolDefinitions() {
    return Object.entries(ToolSchemas).map(([name, schema]) => ({
      name,
      description: this.getToolDescription(name),
      parameters: schema
    }));
  }

  private getToolDescription(name: string): string {
    const desc: Record<string, string> = {
      shell: 'Execute a command in the system shell.',
      read: 'Read the content of a file.',
      write: 'Create or overwrite a file.',
      edit: 'Replace a specific block of text in a file.',
      list_files: 'Recursively list files in a directory.',
      search_code: 'Search for a specific string or pattern.',
      get_context: 'Find files containing a specific symbol.',
      get_project_map: 'Get a global map of project symbols.',
    };
    return desc[name] || 'No description available.';
  }
}

function pathRelative(from: string, to: string) {
  return path.relative(from, to) || '.';
}

export const toolRegistry = new ToolRegistry();
