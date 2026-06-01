import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class FileLogger {
  private logDir = path.join(os.homedir(), '.corox', 'logs');
  private logFile = path.join(this.logDir, 'corox.log');

  async init() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  async write(level: string, msg: string) {
    const timestamp = new Date().toISOString();
    
    // Mask common secret patterns (OpenAI, Anthropic, Generic Keys)
    const maskedMsg = msg.replace(
      /(sk-[a-zA-Z0-9]{20,}|sk-ant-api[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,})/g,
      '[MASKED_SECRET]'
    );
    
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${maskedMsg}\n`;
    try {
      await fs.appendFile(this.logFile, logEntry, 'utf8');
    } catch (error) {
      // We don't want logging to crash the main app
    }
  }
}

const fileLogger = new FileLogger();
fileLogger.init();

export const logger = {
  info: async (msg: string) => {
    console.log(chalk.blue('ℹ ') + msg);
    await fileLogger.write('info', msg);
  },
  success: async (msg: string) => {
    console.log(chalk.green('✔ ') + chalk.bold(msg));
    await fileLogger.write('success', msg);
  },
  warn: async (msg: string) => {
    console.log(chalk.yellow('⚠ ') + msg);
    await fileLogger.write('warn', msg);
  },
  error: async (msg: string) => {
    console.log(chalk.red('✖ ') + chalk.bold(msg));
    await fileLogger.write('error', msg);
  },
  title: async (msg: string) => {
    console.log(`\n${chalk.bold.cyan(msg)}\n`);
    await fileLogger.write('title', msg);
  },
};
