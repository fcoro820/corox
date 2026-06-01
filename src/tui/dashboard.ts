import blessed from 'blessed';
import contrib from 'blessed-contrib';
import os from 'os';
import { logger, LogTransport, ConsoleTransport } from '../utils/logger.js';
import { setupProject } from '../commands/setup.js';
import { showSystemInfo } from '../commands/system.js';
import { cleanModules } from '../commands/clean.js';
import { listLocalModels } from '../commands/model.js';

class TuiTransport implements LogTransport {
  private consoleBox: any;
  private thoughtBox: any;

  constructor(consoleBox: any, thoughtBox: any) {
    this.consoleBox = consoleBox;
    this.thoughtBox = thoughtBox;
  }

  async log(level: string, msg: string): Promise<void> {
    const prefix = {
      info: 'ℹ ',
      success: '✔ ',
      warn: '⚠ ',
      error: '✖ ',
      thought: '💭 ',
      title: '🎯 ',
    }[level] || '';

    if (level === 'thought' || level === 'title') {
      // Route thinking and roadmap to the Thought Panel
      if (this.thoughtBox && typeof this.thoughtBox.log === 'function') {
        this.thoughtBox.log(`${prefix}${msg}`);
      }
    } else {
      // Route everything else to the Console Panel
      if (this.consoleBox && typeof this.consoleBox.log === 'function') {
        this.consoleBox.log(`${prefix}${msg}`);
      }
    }
  }
}

export async function startDashboard() {
  const screen = blessed.screen({
    smartTerminal: true,
    title: 'Corox Command Center'
  });

  // Grid Layout: 12 rows, 12 cols
  const grid = new (contrib.grid as any)({ rows: 12, cols: 12, screen: screen });

  // 1. Header
  const header = grid.set(0, 0, 1, 12, (contrib as any).border({}))
    .set('style', { fg: 'cyan', bold: true });
  header.setContent('🚀 COROX AI COMMAND CENTER v1.1.0');

  // 2. Menu Panel (Left)
  const menu = grid.set(1, 0, 9, 3, (contrib as any).border({}))
    .set('label', 'Navigation');

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

  // 3. Agent Thought Panel (Middle) - THE BRAIN
  const thoughtBox = grid.set(1, 3, 9, 4, (contrib as any).log({
    label: 'Agent Reasoning & Roadmap'
  }));
  thoughtBox.set('style', { fg: 'magenta' });

  // 4. Console Output Panel (Right) - THE EXECUTION
  const consoleBox = grid.set(1, 7, 9, 5, (contrib as any).log({
    label: 'Command Output'
  }));

  // 5. System Monitor (Bottom)
  const sysMonitor = grid.set(10, 0, 2, 12, (contrib as any).border({}))
    .set('label', 'System Status');

  // --- LOGGER INTEGRATION ---
  // Now we pass both boxes to the transport
  const tuiTransport = new TuiTransport(consoleBox, thoughtBox);
  logger.addTransport(tuiTransport);
  logger.removeTransport(ConsoleTransport);

  const updateStats = () => {
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    sysMonitor.setContent(`CPU Load: ${cpuLoad} | RAM: ${freeMem}GB / ${totalMem}GB | Platform: ${os.platform()}`);
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
      await logger.info(`Exiting TUI to run interactive command: ${cmd.name}...`);
      screen.render();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      logger.removeTransport(TuiTransport);
      logger.addTransport(new ConsoleTransport());
      
      screen.destroy();
      try {
        await cmd.action();
      } catch (e) {
        console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
      return;
    }

    await logger.info(`Executing: ${cmd.name}...`);
    try {
      await cmd.action();
    } catch (e) {
      await logger.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
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
