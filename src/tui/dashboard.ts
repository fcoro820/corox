import blessed from 'blessed';
import contrib from 'blessed-contrib';
import os from 'os';
import { logger } from '../utils/logger.js';
import { setupProject } from '../commands/setup.js';
import { showSystemInfo } from '../commands/system.js';
import { cleanModules } from '../commands/clean.js';
import { listLocalModels } from '../commands/model.js';

export async function startDashboard() {
  const screen = blessed.screen({
    smartTerminal: true,
    title: 'Corox Dashboard'
  });

  const grid = new (contrib.grid as any)({ rows: 12, cols: 12, screen: screen });

  const header = grid.set(0, 0, 1, 12, (contrib as any).border({}))
    .set('style', { fg: 'cyan', bold: true });
  header.setContent('🚀 COROX INTERACTIVE DASHBOARD v1.1.0');

  const menu = grid.set(1, 0, 9, 3, (contrib as any).border({}))
    .set('label', 'Menu');

  const commands = [
    { name: 'Setup Project', action: setupProject, interactive: true },
    { name: 'System Info', action: showSystemInfo, interactive: false },
    { name: 'Clean Modules', action: cleanModules, interactive: false },
    { name: 'Local Models', action: listLocalModels, interactive: false },
    { name: 'Exit Dashboard', action: () => process.exit(0), interactive: false },
  ];

  let selectedIndex = 0;
  const renderMenu = () => {
    let menuText = '';
    commands.forEach((cmd, idx) => {
      const prefix = idx === selectedIndex ? '👉 ' : '  ';
      menuText += `${prefix}${cmd.name}\n`;
    });
    menu.setContent(menuText);
  };

  const consoleBox = grid.set(1, 3, 9, 9, (contrib as any).log({
    label: 'Console Output'
  }));

  const sysMonitor = grid.set(10, 0, 2, 12, (contrib as any).border({}))
    .set('label', 'System Status');

  const updateStats = () => {
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    sysMonitor.setContent(`CPU Load: ${cpuLoad} | RAM: ${freeMem}GB / ${totalMem}GB | Platform: ${os.platform()}`);
  };

  const originalLog = console.log;
  console.log = (...args) => {
    if (consoleBox && typeof consoleBox.log === 'function') {
      consoleBox.log(args.join(' '));
    }
    originalLog(...args);
  };

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
    
    if (cmd.interactive) {
      consoleBox.log(`\nExiting TUI to run interactive command: ${cmd.name}...`);
      screen.render();
      // Give it a moment to render before destroying
      await new Promise(resolve => setTimeout(resolve, 100));
      screen.destroy();
      try {
        await cmd.action();
      } catch (e) {
        console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
      // We don't automatically restart the dashboard here to avoid 
      // potential recursive issues and let the user decide.
      return;
    }

    consoleBox.log(`\nExecuting: ${cmd.name}...`);
    try {
      await cmd.action();
    } catch (e) {
      consoleBox.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    screen.render();
  });

  screen.key(['q', 'C-c'], () => {
    clearInterval(statsInterval);
    process.exit(0);
  });

  renderMenu();
  updateStats();
  const statsInterval = setInterval(updateStats, 2000);
  screen.render();
}
