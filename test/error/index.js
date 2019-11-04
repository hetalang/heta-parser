/*global describe, it */
const { parse, SyntaxError } = require('../../src');
//const fs = require('fs');
//const path = require('path');
const expect = require('chai').expect;

const cases = [
  {
    source: './input/singleSpace.heta',
    target: 'Expected Class or space or Id but ";" found'
  },
  {
    source: 'scn1{ class: "a[1]"", scope: one,}',
    target: 'Expected ",", "}", Break, Comment, Space, or [A-Za-z] but """ found.'
  },
  {
    source: '\'\'\' hello \'\'\'',
    target: 'Expected "block", Break, Class or space, Command, Comment, Id, Note for object, Space, or Variable definition but "\'" found.'
  },
  {
    source: '#upsert sp1::a',
    target: 'Expected ";", "{", Break, Class or space, or Space but "$" found.'
  },
  {
    source: '%upsert sp1::a;',
    target: 'Expected "block", Break, Class or space, Command, Comment, Id, Note for object, Space, or Variable definition but "%" found.'
  },
  {
    source: 'sp1::a@clss1{two};',
    target: 'Expected ":", "{", Array, Break, Digit, Space, Stirng, or [A-Za-z0-9_.] but "}" found.'
  },
  {
    source: 'x\'=1',
    target: 'Expected "block", Break, Class or space, Command, Comment, Id, Note for object, Space, or Variable definition but "x" found.' 
  },
  {
    source: 'blck @species {space: two} begin s1 {compartment: comp1}; end',
    target: 'Expected ";", "{", Break, Class or space, or Space but "b" found.'
  },
  {
    source: 'x @Const <;',
    target: 'Expected ";", Action, Assignment, Break, Dict, Id, Index, Note, Space, Title, or Type but "<" found.'
  }
];

describe('Check "error"', () => {
  cases.forEach((x) => {
    it('Check error ' + x.source, () => {
      expect(() => parse(x.source)).to.throw(SyntaxError);
    });
  });
});
