import { Command } from 'commander';

export interface CoroxPlugin {
  metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  init: (program: Command) => void;
}
