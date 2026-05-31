import blessed from 'blessed';
import contrib from 'blessed-contrib';
import os from 'os';
import { logger } from '../utils/logger.js';
import { showSystemInfo } from '../commands/system.js';
import { setupProject } from '../commands/setup.js';
import { cleanModules } from '../commands/clean.js';
import { listLocalModels } from '../commands/model.js';

export async function startDashboard() {
  const screen = blessed.screen({
    smartTerminal: true,
    title: 'Corox Dashboard'
  });

  // Layout Grid
  const grid = new contrib.grid({ rows: 12, cols: 12, cellWidth: 40 });

  // 1. Header
  const header = grid.set(0, 0, 1, 12, contrib.border({}))
    .set('style', { fg: 'cyan', bold: true });
  header.setContent('🚀 COROX INTERACTIVE DASHBOARD v1.0.0');

  // 2. Sidebar Menu
  const menu = grid.set(1, 0, 9, 3, contrib.border({}))
    .set('label', 'Menu');

  const commands = [
    { name: 'Setup Project', action: setupProject },
    { name: 'System Info', action: showSystemInfo },
    { name: 'Clean Modules', action: cleanModules },
    { name: 'Local Models', action: listLocalModels },
    { name: 'Exit Dashboard', action: () => process.exit(0) },
  ];

  let selectedIndex = 0;
  const renderMenu = () => {
    let menuText = '';
    commands.forEach((cmd, idx) => {
      const prefix = idx === selectedIndex ? '👉 ' : '  ';
      const style = idx === selectedIndex ? '{bold}{cyan}' : '';
      menuText += `${prefix}${style}${cmd.name}{/}\n`;
    });
    menu.setContent(menuText);
  };

  // 3. Main Console / Output
  const consoleBox = grid.set(1, 3, 9, 9, contrib.log({
    label: 'Console Output',
    style: { fg: 'white' }
  }));

  // 4. System Monitor (Footer)
  const sysMonitor = grid.set(10, 0, 2, 12, contrib.border({}))
    .set('label', 'System Status');

  const updateStats = () => {
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    sysMonitor.setContent(`CPU Load: ${cpuLoad} | RAM: ${freeMem}GB / ${totalMem}GB | Platform: ${os.platform()}`);
  };

  // Intercept console.log for the dashboard
  const originalLog = console.log;
  console.log = (...args) => {
    consoleBox.log(args.join(' '));
    originalLog(...args);
  };

  // Keyboard Navigation
  screen.key(['up'], () => {
    selectedIndex = Math.max(0, selectedIndex - 1);
    renderMenu();
    screen.render();
  });

  screen.key(['down'], () => {
    selectedIndex = Math.min(commands.length - 1, selectedIndex + 1);
    renderMenu();
    screen.render();
  });

  screen.key(['enter'], async () => {
    const cmd = commands[selectedIndex];
    consoleBox.log(`\n${chalk.cyan('Executing: ' + cmd.name + '...')}`);
    try {
      await cmd.action();
    } catch (e) {
      consoleBox.log(chalk.red('Error executing command'));
    }
    screen.render();
  });

  screen.key(['q', 'C-c'], () => process.exit(0));

  // Initial Render
  renderMenu();
  updateStats();
  setInterval(updateStats, 2000);
  screen.render();
}

import chalk from 'chalk';
