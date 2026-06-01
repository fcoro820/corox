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
    this.optimizeMemory();
  }

  private optimizeMemory() {
    const MAX_HISTORY = 30;
    if (this.currentSession.length <= MAX_HISTORY) return;

    // PRIORITY-BASED CONTEXT WINDOW
    // Keep: System prompts, Goals, and critical milestones
    const priorityMessages: Message[] = [];
    const normalMessages: Message[] = [];

    for (const msg of this.currentSession) {
      const isSystem = msg.role === 'system';
      const isGoal = msg.content.includes('GOAL:') || msg.content.includes('STEPS:');
      const isMilestone = msg.content.toLowerCase().includes('step completed');

      if (isSystem || isGoal || isMilestone) {
        priorityMessages.push(msg);
      } else {
        normalMessages.push(msg);
      }
    }

    // Keep priority messages + last N normal messages
    const prunedNormal = normalMessages.slice(-15);
    this.currentSession = [...priorityMessages, ...prunedNormal];
  }

  getHistory(): Message[] {
    return this.currentSession;
  }

  clear() {
    this.currentSession = [];
  }
}

export const memoryManager = new MemoryManager();
