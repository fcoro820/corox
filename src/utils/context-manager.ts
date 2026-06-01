import { Project, SyntaxKind } from 'ts-morph';
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

interface SymbolCache {
  projectRoot: string;
  symbols: Record<string, ProjectSymbol[]>;
}

export class ContextManager {
  private symbolTable: Map<string, ProjectSymbol[]> = new Map();
  private projectRules: string = '';
  private projectRoot = process.cwd();
  private contextPath = path.join(this.projectRoot, '.corox-context.md');
  private cachePath = path.join(os.homedir(), '.corox', 'symbol-cache.json');

  async init() {
    await this.loadProjectRules();
    await this.loadCache();
    
    // Only re-index if cache is empty or outdated
    if (this.symbolTable.size === 0) {
      await this.indexProject();
      await this.saveCache();
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
    await logger.thought('Performing AST-based indexing of project symbols...');
    this.symbolTable = new Map();
    
    try {
      const tsConfigFilePath = path.join(this.projectRoot, 'tsconfig.json');
      const hasTsConfig = await fs.access(tsConfigFilePath).then(() => true).catch(() => false);
      const project = hasTsConfig
        ? new Project({ tsConfigFilePath })
        : new Project({ compilerOptions: { allowJs: true } });

      // Add all relevant source files
      const sourceFiles = await this.getProjectFiles();
      if (sourceFiles.length > 0) {
        project.addSourceFilesAtPaths(sourceFiles);
      }

      for (const sourceFile of project.getSourceFiles()) {
        const filePath = sourceFile.getFilePath();

        // 1. Extract Classes
        sourceFile.getClasses().forEach(cls => {
          this.addSymbol(cls.getName(), 'class', filePath, cls.getStartLineNumber());
        });

        // 2. Extract Interfaces
        sourceFile.getInterfaces().forEach(iface => {
          this.addSymbol(iface.getName(), 'interface', filePath, iface.getStartLineNumber());
        });

        // 3. Extract Functions (Top-level)
        sourceFile.getFunctions().forEach(fn => {
          this.addSymbol(fn.getName(), 'function', filePath, fn.getStartLineNumber());
        });

        // 4. Extract Variable Declarations (e.g., const myFunc = () => {})
        sourceFile.getVariableDeclarations().forEach(varDecl => {
          const initializer = varDecl.getInitializer();
          if (initializer && (
            // Check if it's an arrow function
            (initializer as any).getKind() === SyntaxKind.ArrowFunction || 
            (initializer as any).getKind() === SyntaxKind.FunctionExpression
          )) {
            this.addSymbol(varDecl.getName(), 'function', filePath, varDecl.getStartLineNumber());
          }
        });
      }
      
      await logger.success(`Indexed ${this.symbolTable.size} unique symbols using AST parsing.`);
    } catch (error: any) {
      await logger.error(`AST Indexing failed: ${error.message}. Falling back to basic scan.`);
    }
  }

  private async getProjectFiles(): Promise<string[]> {
    const ignoredDirs = new Set(['node_modules', 'dist', 'build', '.git']);
    const files: string[] = [];

    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.corox-context.md') continue;
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!ignoredDirs.has(entry.name)) await walk(fullPath);
        } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    await walk(this.projectRoot);
    return files;
  }

  private addSymbol(name: string, type: ProjectSymbol['type'], filePath: string, line: number) {
    if (!name) return;
    if (!this.symbolTable.has(name)) {
      this.symbolTable.set(name, []);
    }
    this.symbolTable.get(name)!.push({ name, type, filePath, line });
  }

  async getContextForSymbol(symbolName: string): Promise<string> {
    const symbols = this.symbolTable.get(symbolName);
    if (!symbols) return `Symbol ${symbolName} not found in project index.`;
    
    return `Symbol ${symbolName} found in:\n${symbols.map(s => `- ${s.filePath} (Line ${s.line}, ${s.type})`).join('\n')}`;
  }

  getProjectRules() {
    return this.projectRules;
  }

  async getGlobalMap(): Promise<string> {
    const summary = [];
    for (const [name, symbols] of this.symbolTable.entries()) {
      summary.push(`${name} (${symbols[0].type}) -> ${symbols[0].filePath}:${symbols[0].line}`);
    }
    return summary.join('\n').substring(0, 2000) + '\n... (truncated)';
  }

  private async loadCache() {
    try {
      const data = await fs.readFile(this.cachePath, 'utf8');
      const parsed = JSON.parse(data) as SymbolCache;
      if (parsed.projectRoot !== this.projectRoot || !parsed.symbols) {
        this.symbolTable = new Map();
        return;
      }
      this.symbolTable = new Map(Object.entries(parsed.symbols));
    } catch {
      this.symbolTable = new Map();
    }
  }

  private async saveCache() {
    try {
      const obj: SymbolCache = {
        projectRoot: this.projectRoot,
        symbols: Object.fromEntries(this.symbolTable),
      };
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      await fs.writeFile(this.cachePath, JSON.stringify(obj), 'utf8');
    } catch (error) {
      // Silently fail
    }
  }
}

export const contextManager = new ContextManager();
