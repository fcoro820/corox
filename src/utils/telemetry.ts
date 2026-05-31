import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface UsageLog {
  timestamp: string;
  command: string;
  platform: string;
}

export async function trackUsage(command: string) {
  const logPath = path.join(os.homedir(), '.corox', 'usage.json');
  const logEntry: UsageLog = {
    timestamp: new Date().toISOString(),
    command,
    platform: process.platform,
  };
  
  try {
    let logs: UsageLog[] = [];
    try {
      const data = await fs.readFile(logPath, 'utf8');
      logs = JSON.parse(data);
    } catch (e) {
      // File doesn't exist or is empty
    }
    
    logs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    // Fail silently for telemetry
  }
}
