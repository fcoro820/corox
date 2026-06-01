import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface LogTransport {
  log(level: string, msg: string, color: string): Promise<void>;
}

class ConsoleTransport implements LogTransport {
  async log(level: string, msg: string, color: string): Promise<void> {
    const prefix = {
      info: chalk.blue('ℹ '),
      success: chalk.green('✔ '),
      warn: chalk.yellow('⚠ '),
      error: chalk.red('✖ '),
      thought: chalk.magenta('💭 '),
      title: '',
    }[level] || '';

    if (level === 'title') {
      console.log(`\n${chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}`);
      console.log(`${chalk.bold.cyan(msg)}`);
      console.log(`${chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`);
    } else if (level === 'thought') {
      // Terminal-specific style: Use a dim sidebar effect for thoughts
      console.log(`${chalk.magenta('│')} ${chalk.dim(prefix + msg)}`);
    } else {
      console.log(prefix + (level === 'success' || level === 'error' ? chalk.bold(msg) : msg));
    }
  }

  async separator() {
    console.log(chalk.dim('────────────────────────────────────────────────────────────────────────────────'));
  }
}

class FileTransport implements LogTransport {
  private logDir = path.join(os.homedir(), '.corox', 'logs');
  private logFile = path.join(this.logDir, 'corox.log');
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  async log(level: string, msg: string): Promise<void> {
    await this.init();
    const timestamp = new Date().toISOString();
    const maskedMsg = msg.replace(
      /(sk-[a-zA-Z0-9]{20,}|sk-ant-api[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,})/g,
      '[MASKED_SECRET]'
    );
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${maskedMsg}\n`;
    try {
      await fs.appendFile(this.logFile, logEntry, 'utf8');
    } catch (error) {
      // Silently fail
    }
  }
}

class CoroxLogger {
  private transports: LogTransport[] = [new ConsoleTransport(), new FileTransport()];

  addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  removeTransport(transportClass: any) {
    this.transports = this.transports.filter(t => !(t instanceof transportClass));
  }

  private async dispatch(level: string, msg: string, color: string) {
    await Promise.all(this.transports.map(t => t.log(level, msg, color)));
  }

  async separator() {
    await Promise.all(this.transports.map(t => {
      if (t instanceof ConsoleTransport) return t.separator();
      return Promise.resolve();
    }));
  }

  async info(msg: string) {
    await this.dispatch('info', msg, 'blue');
  }

  async success(msg: string) {
    await this.dispatch('success', msg, 'green');
  }

  async warn(msg: string) {
    await this.dispatch('warn', msg, 'yellow');
  }

  async error(msg: string) {
    await this.dispatch('error', msg, 'red');
  }

  async thought(msg: string) {
    await this.dispatch('thought', msg, 'magenta');
  }

  async title(msg: string) {
    await this.dispatch('title', msg, 'cyan');
  }
}

export const logger = new CoroxLogger();
export { ConsoleTransport, FileTransport };
