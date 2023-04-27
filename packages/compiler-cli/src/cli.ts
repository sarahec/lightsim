#! /usr/bin/env node  
import { Command } from 'commander';
import {compileCommand} from "./compile/command.js";  


const program = new Command();

// TODO Rename as lightsim-cli
program  
  .name('compiler-cli')  
  .description('Converts Markdown files into a simulation web app')  
  
program.addCommand(compileCommand());  
  
program.parse(process.argv);

