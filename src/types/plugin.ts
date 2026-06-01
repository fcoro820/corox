import { Command } from 'commander';

export interface PluginHooks {
  onInit?: (program: Command) => void;
  beforeCommand?: (commandName: string, args: any[]) => Promise<void | boolean>;
  afterCommand?: (commandName: string, args: any[]) => Promise<void>;
}

export interface CoroxPlugin {
  metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  init: (program: Command) => void;
  hooks?: PluginHooks;
}
