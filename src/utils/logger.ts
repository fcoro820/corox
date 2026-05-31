import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ ') + msg),
  success: (msg: string) => console.log(chalk.green('✔ ') + chalk.bold(msg)),
  warn: (msg: string) => console.log(chalk.yellow('⚠ ') + msg),
  error: (msg: string) => console.log(chalk.red('✖ ') + chalk.bold(msg)),
  title: (msg: string) => console.log(`\n${chalk.bold.cyan(msg)}\n`),
};
