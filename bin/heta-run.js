#!/usr/bin/env node
'use strict';

const commander = require('commander');
const fs = require('fs');
const { parse } = require('../src');

commander
  .description('Run heta files, return JavaScript object')
  .usage('[inputFile]')
  .option('-o, --output <path>', 'save result to json file')
  .parse(process.argv);


let input = commander.args[0];
let opts = commander.opts();

fs.readFile(input, 'utf8', (err, contents) => {
  if (input.match(/.heta$/) === null) throw new Error('Incorrect file type');

  if (err) {
    process.stderr.write(err.message);
  } else {
    let result = parse(contents);
    if (opts.output) {
      fs.writeFile(opts.output, JSON.stringify(result, null, 2), (err) => {
        if (err) throw err;
        process.stdout.write(`Result successfully written to file: ${opts.output}.`);
      });
    } else {
      process.stdout.write(JSON.stringify(result, null, 2));
    }
  }
});