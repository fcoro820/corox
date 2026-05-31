import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';
import { STACKS } from '../templates/stacks.js';

const execPromise = promisify(exec);

export async function setupProject() {
  const { projectName, stackKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      validate: (input) => input ? true : 'Project name cannot be empty',
    },
    {
      type: 'select',
      name: 'stackKey',
      message: 'Select a project stack:',
      choices: Object.entries(STACKS).map(([key, value]) => ({
        name: `${value.name} - ${value.description}`,
        value: key,
      })),
    },
  ]);

  const stack = STACKS[stackKey];
  const projectPath = path.join(process.cwd(), projectName);
  const spinner = ora(`Scaffolding ${stack.name}...`).start();
  
  try {
    // 1. Create base directory
    await fs.mkdir(projectPath, { recursive: true });

    // 2. Create folder structure
    for (const folder of stack.folders) {
      await fs.mkdir(path.join(projectPath, folder), { recursive: true });
    }

    // 3. Create files
    for (const [filePath, content] of Object.entries(stack.files)) {
      await fs.writeFile(path.join(projectPath, filePath), content);
    }

    // 4. Handle package.json & Dependencies
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      type: 'module',
      main: 'src/index.js',
      dependencies: {},
      devDependencies: {}
    };

    // Add specified dependencies
    if (stack.dependencies.length > 0) {
      stack.dependencies.forEach(dep => {
        packageJson.dependencies[dep] = 'latest';
      });
    }

    await fs.writeFile(
      path.join(projectPath, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );

    spinner.text = 'Installing dependencies...';
    
    // 5. Auto-run npm install
    if (stack.dependencies.length > 0) {
      await execPromise('npm install', { cwd: projectPath });
    }

    spinner.succeed(null);
    logger.success(`Project ${projectName} created with ${stack.name} stack!`);
    logger.info(`Next steps: \n  cd ${projectName}\n  npm start`);

  } catch (error) {
    spinner.fail('Scaffolding failed');
    logger.error(error instanceof Error ? error.message : 'Unknown error occurred');
    throw error;
  }
}
