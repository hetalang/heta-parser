/*global describe, it */
const { parse } = require('../../src');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const cases = [
  { source: './input/comments.heta', target: './output/comments.json' },
  { source: './input/allTypeValues.heta', target: './output/allTypeValues.json' },
  { source: './input/block.heta', target: './output/block.json' },
  { source: './input/namespace.heta', target: './output/namespace.json' },
  { source: './input/delete.heta', target: './output/delete.json' },
  { source: './input/include0.heta', target: './output/include0.json' },
  { source: './input/include.heta', target: './output/include.json' },
  { source: './input/nested.heta', target: './output/nested.json' },
  { source: './input/nestedBlocks.heta', target: './output/nestedBlocks.json' },
  { source: './input/notes.heta', target: './output/notes.json' },
  { source: './input/simple.heta', target: './output/simple.json' },
  { source: './input/syntacticSugar.heta', target: './output/syntacticSugar.json' },
  { source: './input/variables.heta', target: './output/variables.json' },
  { source: './input/other-tabs.heta', target: './output/other-tabs.json' },
  { source: './input/other-strings.heta', target: './output/other-strings.json' },
];

describe('Check "parse"', () => {
  cases.forEach((x) => {
    it('Check ' + x.source, () => {
      let fullPath = path.join(__dirname, x.source);
      let content = fs.readFileSync(fullPath, 'utf8');
      let parsed = parse(content);
      let result = require(x.target);

      expect(parsed).to.be.deep.equal(result);
    });
  });
});
