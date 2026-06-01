import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';

export interface ProjectSymbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable';
  filePath: string;
  line: number;
}

class ContextManager {
  private symbolTable: Map<string, ProjectSymbol[]> = new Map();
  private projectRules: string = '';
  private contextPath = path.join(process.cwd(), '.corox-context.md');
  private cachePath = path.join(os.homedir(), '.corox', 'symbol-cache.json');

  async init() {
    await this.loadProjectRules();
    await this.loadCache();
    
    // Only re-index if cache is empty or outdated (simple implementation)
    if (this.symbolTable.size === 0) {
      await this.indexProject();
      await this.saveCache();
    }
  }

  private async loadCache() {
    try {
      const data = await fs.readFile(this.cachePath, 'utf8');
      const parsed = JSON.parse(data);
      this.symbolTable = new Map(Object.entries(parsed));
    } catch {
      this.symbolTable = new Map();
    }
  }

  private async saveCache() {
    try {
      const obj = Object.fromEntries(this.symbolTable);
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      await fs.writeFile(this.cachePath, JSON.stringify(obj), 'utf8');
    } catch (error) {
      // Silently fail
    }
  }

  private async loadProjectRules() {
    try {
      this.projectRules = await fs.readFile(this.contextPath, 'utf8');
      await logger.info('Loaded project-specific rules from .corox-context.md');
    } catch {
      this.projectRules = 'No specific project rules defined.';
    }
  }

  async indexProject() {
    await logger.thought('Indexing project symbols for advanced context...');
    const files = await this.getProjectFiles();
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        this.extractSymbols(content, file);
      } catch (e) {
        // Skip files that can't be read
      }
    }
    await logger.success(`Indexed ${this.symbolTable.size} unique symbols across project.`);
  }

  private async getProjectFiles(): Promise<string[]> {
    const entries = await fs.readdir('. ', { recursive: true, withFileTypes: true });
    return entries
      .filter(e => e.isFile() && /\.(ts|js|py|go|java)$/.test(e.name))
      .filter(e => !e.name.includes('node_modules') && !e.name.includes('dist'))
      .map(e => e.name);
  }

  private extractSymbols(content: string, filePath: string) {
    // Simple regex for function and class extraction (TS/JS focus)
    const functionRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*=\s*\(.*?\)\s*=>/g;
    const classRegex = /class\s+([a-zA-Z0-9_]+)/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2];
      this.addSymbol(name, 'function', filePath);
    }
    
    while ((match = classRegex.exec(content)) !== null) {
      this.addSymbol(match[1], 'class', filePath);
    }
  }

  private addSymbol(name: string, type: ProjectSymbol['type'], filePath: string) {
    if (!this.symbolTable.has(name)) {
      this.symbolTable.set(name, []);
    }
    this.symbolTable.get(name)!.push({
      name,
      type,
      filePath,
      line: 0 // Simplified for now
    });
  }

  async getContextForSymbol(symbolName: string): Promise<string> {
    const symbols = this.symbolTable.get(symbolName);
    if (!symbols) return `Symbol ${symbolName} not found in project index.`;
    
    return `Symbol ${symbolName} found in:\n${symbols.map(s => `- ${s.filePath} (${s.type})`).join('\n')}`;
  }

  getProjectRules() {
    return this.projectRules;
  }

  async getGlobalMap(): Promise<string> {
    const summary = [];
    for (const [name, symbols] of this.symbolTable.entries()) {
      summary.push(`${name} (${symbols[0].type}) -> ${symbols[0].filePath}`);
    }
    return summary.join('\n').substring(0, 2000) + '\n... (truncated)';
  }
}

export const contextManager = new ContextManager();
