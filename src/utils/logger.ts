import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

export interface LogEvent {
  level: string;
  msg: string;
  color: string;
}

export interface LogTransport {
  log(event: LogEvent): Promise<void>;
}

class ConsoleTransport implements LogTransport {
  async log({ level, msg }) {
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
      console.log(`${chalk.magenta('│')} ${chalk.dim(prefix + msg)}`);
    } else {
      console.log(prefix + (level === 'success' || level === 'error' ? chalk.bold(msg) : msg));
    }
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

  async log({ level, msg }) {
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

class CoroxLogger extends EventEmitter {
  private transports: LogTransport[] = [new ConsoleTransport(), new FileTransport()];

  addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  removeTransport(transport: LogTransport) {
    this.transports = this.transports.filter(t => t !== transport);
  }

  private async dispatch(level: string, msg: string, color: string) {
    const event: LogEvent = { level, msg, color };
    // 1. Emit event for TUI/External subscribers
    this.emit('log', event);
    // 2. Run internal transports
    await Promise.all(this.transports.map(t => t.log(event)));
  }

  async info(msg: string) { await this.dispatch('info', msg, 'blue'); }
  async success(msg: string) { await this.dispatch('success', msg, 'green'); }
  async warn(msg: string) { await this.dispatch('warn', msg, 'yellow'); }
  async error(msg: string) { await this.dispatch('error', msg, 'red'); }
  async thought(msg: string) { await this.dispatch('thought', msg, 'magenta'); }
  async title(msg: string) { await this.dispatch('title', msg, 'cyan'); }
  async separator() {
    this.emit('separator');
    // ConsoleTransport can handle separators via 'title' or custom method
    console.log(chalk.dim('────────────────────────────────────────────────────────────────────────────────'));
  }
}

export const logger = new CoroxLogger();
export { ConsoleTransport, FileTransport };
