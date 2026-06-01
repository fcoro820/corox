import { AIProvider, Message, ChatResponse } from './ai/types.js';
import { memoryManager } from './memory-manager.js';
import { toolRegistry } from './tool-registry.js';
import { logger } from './logger.js';
import { contextManager } from './context-manager.js';

export class AgentEngine {
  private isCancelled = false;

  constructor(private provider: AIProvider) {
    // Handle Graceful Interruption (Ctrl+C)
    process.on('SIGINT', () => {
      this.isCancelled = true;
      logger.warn('\n🛑 Interruption signal received. Agent will stop after the current step...');
    });
  }

  async run(userInput: string, options: any = {}) {
    this.isCancelled = false;
    await memoryManager.loadSession();
    await contextManager.init();
    
    const projectRules = contextManager.getProjectRules();

    // 1. Prepare System Prompt with Tool Definitions and Project Rules
    const systemPrompt: Message = {
      role: 'system',
      content: `You are Corox, a world-class Senior Engineering Partner. 
You don't just execute commands; you collaborate, challenge assumptions, and ensure long-term code health.

PROJECT RULES:
${projectRules}

YOUR PHILOSOPHY:
- Elegance over complexity.
- Stability over speed.
- Clarity over cleverness.

INTERACTION STYLE:
- Be professional yet natural. Use a collaborative tone (e.g., "Let's look at this," "I suggest we...").
- When you use a tool, explain WHY you are doing it and what you expect to find.
- If you see a potential bug or architectural flaw while reading code, mention it even if it's not the primary task.

ROADMAP PROTOCOL:
At the start of a new task, you MUST first define a "Roadmap":
1. State the overall GOAL.
2. List the ESTIMATED STEPS to achieve it.
Format: 
GOAL: <goal>
STEPS:
1. <step1>
2. <step2>...

When you complete a step, explicitly state "Step [X] completed".

Available Tools:
${JSON.stringify(toolRegistry.getToolDefinitions(), null, 2)}`
    };

    const history = memoryManager.getHistory();
    if (history.length === 0) {
      memoryManager.addMessage(systemPrompt);
    }

    memoryManager.addMessage({ role: 'user', content: userInput });

    let isThinking = true;
    let iterations = 0;
    const MAX_ITERATIONS = 15;
    const stepsTaken: Array<{ tool: string; status: string; result: string }> = [];
    
    let currentRoadmap = { goal: 'Determining...', steps: [] };
    let currentStepIndex = 0;

    while (isThinking && iterations < MAX_ITERATIONS) {
      if (this.isCancelled) {
        await logger.warn('Agent execution was cancelled by user.');
        break;
      }

      iterations++;
      
      // --- ROADMAP VISUALIZATION ---
      if (currentRoadmap.goal !== 'Determining...') {
        const progress = `Step [${currentStepIndex + 1}/${currentRoadmap.steps.length}]`;
        await logger.title(`🎯 Goal: ${currentRoadmap.goal} | ${progress}`);
      } else {
        await logger.separator();
      }

      await logger.thought('Analyzing current state and planning next step...');
      const messages = memoryManager.getHistory();
      const response = await this.provider.chat(messages, options);

      if (response.content) {
        // Extract Roadmap if present
        if (response.content.includes('GOAL:') && response.content.includes('STEPS:')) {
          const goalMatch = response.content.match(/GOAL:\s*(.*)/);
          const stepsMatch = response.content.match(/STEPS:([\s\S]*)/);
          if (goalMatch && stepsMatch) {
            currentRoadmap.goal = goalMatch[1].trim();
            currentRoadmap.steps = stepsMatch[1]
              .trim()
              .split('\n')
              .filter(line => line.trim().match(/^\d+\./))
              .map(line => line.trim());
            await logger.success(`Roadmap defined: ${currentRoadmap.goal}`);
          }
        }

        // Update step index if AI mentions completing a step
        if (response.content.toLowerCase().includes('step completed')) {
          currentStepIndex++;
        }

        await logger.thought(`AI's reasoning: ${response.content.substring(0, 150)}${response.content.length > 150 ? '...' : ''}`);
        memoryManager.addMessage({ role: 'assistant', content: response.content });
      }

      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const call of response.tool_calls) {
          if (this.isCancelled) break;

          await logger.info(`🛠️  Action: Calling tool [${call.name}]`);
          const result = await toolRegistry.execute(call.name, call.arguments);
          
          if (!result.success) {
            await logger.warn(`⚠️ Tool [${call.name}] failed. AI is analyzing the failure...`);
          } else {
            await logger.thought(`Observation: ${result.content.substring(0, 150)}${result.content.length > 150 ? '...' : ''}`);
          }
          
          memoryManager.addMessage({
            role: 'tool',
            content: result.content,
            tool_call_id: call.id
          });
          
          stepsTaken.push({ tool: call.name, status: result.success ? 'success' : 'failed', result: result.content });
        }
        await logger.separator();
      } else {
        isThinking = false;
      }
    }

    if (stepsTaken.length > 0) {
      await logger.title('🛠️  Agent Execution Summary');
      for (let i = 0; i < stepsTaken.length; i++) {
        const step = stepsTaken[i];
        const icon = step.status === 'success' ? '✅' : '❌';
        await logger.info(`${i + 1}. ${icon} Used [${step.tool}] - ${step.status === 'success' ? 'Completed' : 'Failed'}`);
      }
      console.log('\n');
    }

    await memoryManager.saveSession();
    return memoryManager.getHistory().pop()?.content || 'No response generated.';
  }
}
