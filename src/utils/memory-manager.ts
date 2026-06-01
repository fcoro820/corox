import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Message } from './ai/types.js';

class MemoryManager {
  private memoryPath = path.join(os.homedir(), '.corox', 'memory.json');
  private currentSession: Message[] = [];

  async saveSession() {
    try {
      await fs.mkdir(path.dirname(this.memoryPath), { recursive: true });
      await fs.writeFile(this.memoryPath, JSON.stringify(this.currentSession, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  async loadSession() {
    try {
      const data = await fs.readFile(this.memoryPath, 'utf8');
      this.currentSession = JSON.parse(data);
    } catch (error) {
      this.currentSession = [];
    }
  }

  addMessage(msg: Message) {
    this.currentSession.push(msg);
    // Keep memory lean: limit to last 20 messages
    if (this.currentSession.length > 20) {
      this.currentSession = this.currentSession.slice(-20);
    }
  }

  getHistory(): Message[] {
    return this.currentSession;
  }

  clear() {
    this.currentSession = [];
  }
}

export const memoryManager = new MemoryManager();
