#!/usr/bin/env node
'use strict';

const commander = require('commander');
const pkg = require('../package');

commander
  .version(pkg.version, '-v, --version')
  .description('Directive language for easy description of biological models')
  .command('run <inputFile>', 'Run heta files, return JavaScript object')
  .command('create <inputFile>', 'Create heta file from json')
  .parse(process.argv);
