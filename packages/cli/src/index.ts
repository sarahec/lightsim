#! /usr/bin/env node
import { Command } from 'commander';
import { compileCommand } from './src/compile/command.js';

const program = new Command();

async function main() {
program
    .name('lightsim-cli')
    .description('Converts Markdown files into a simulation web app');

  program.addCommand(compileCommand());

  await program.parseAsync(process.argv);
}

main();