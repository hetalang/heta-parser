/*global describe, it */

const { parse } = require('../../src');
const { expect } = require('chai');

let to_test = [
  {
    source: '{ id: a, class: A };',
    expectation: [{ id: 'a', class: 'A', action: 'upsert' }]
  },
  {
    source: 'a;',
    expectation: [{id: 'a', action: 'upsert'}]
  },
  {
    source: 'sp1::a;',
    expectation: [{id: 'a', space:'sp1', action: 'upsert'}]
  },
  {
    source: '#upsert sp1::a;',
    expectation: [{id: 'a', space:'sp1', action: 'upsert'}]
  },
  {
    source: '#update sp1::a;',
    expectation: [{id: 'a', space:'sp1', action: 'update'}]
  },
  {
    source: '#insert sp1::a @clss1;',
    expectation: [{id: 'a', space:'sp1', class: 'Clss1', action: 'insert'}]
  },
  {
    source: '#insert sp1::a @abcAbc;',
    expectation: [{id: 'a', space:'sp1', class: 'AbcAbc', action: 'insert'}]
  },
  {
    source: '#delete sp1::a;',
    expectation: [{id: 'a', space:'sp1', action: 'delete'}]
  },
  {
    source: 'sp1::a@clss1;',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1'}]
  },
  {
    source: 'sp1::a@clss1{};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1'}]
  },
  {
    source: 'sp1::a@clss1{key: value};',
    expectation:  [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'value'}]
  },
  {
    source: 'sp1::a@clss1{key  : value};',
    expectation:  [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'value'}]
  },
  {
    source: 'sp1::a@clss1{key: two words};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'two words'}]
  },
  {
    source: 'sp1::a@clss1{key: "value"};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'value'}]
  },
  {
    source: 'sp1::a@clss1{key: "two words"};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'two words'}]
  },
  {
    source: 'sp1::a@clss1{key: 1};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 1}]
  },
  {
    source: 'sp1::a@clss1{key: []};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: []}]
  },
  {
    source: 'sp1::a@clss1{key: {}};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: {}}]
  },
  {
    source: 'sp1::a@clss1{key1: {key2: 12}};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key1: {key2: 12}}]
  },
  {
    source: 'sp1::a@clss1{key: [a,b,c]};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: ['a','b','c']}]
  },
  {
    source: 'sp1::a@clss1{key: [a a, b b, c c]};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: ['a a','b b','c c']}]
  },
  {
    source: 'sp1::a@clss1{key: [1,2,3]};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: [1,2,3]}]
  },
  {
    source: 'sp1::a @clss1 {key: value};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'value'}]
  },
  {
    source: '@clss1 sp1::a {key: value};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'value'}]
  },
  {
    source: '@clss1 sp1::a {key: "true"};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'true'}]
  },
  {
    source: '@clss1 sp1::a {key: "false"};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: 'false'}]
  },
  {
    source: '@clss1 sp1::a {key: true};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: true}]
  },
  {
    source: '@clss1 sp1::a {key: false};',
    expectation: [{id: 'a', space:'sp1', action: 'upsert', class: 'Clss1', key: false}]
  },
  {
    source: 'x1 := (true and false) ? 1 : 2;',
    expectation: [{id: 'x1', action: 'upsert', assignments: {ode_ : '(true and false) ? 1 : 2'}}]
  },

  {
    source: 'x=1;',
    expectation: [{action: 'upsert', id: 'x', num: 1}]
  },
  {
    source: 'x=1.1;',
    expectation: [{action: 'upsert', id: 'x', num: 1.1}]
  },
  {
    source: 'x=1e5;',
    expectation: [{action: 'upsert', id: 'x', num: 1e5}]
  },
  {
    source: 'x=1.2e-5;',
    expectation: [{action: 'upsert', id: 'x', num: 1.2e-5}]
  },
  {
    source: 'x=-1.2e-5;',
    expectation: [{action: 'upsert', id: 'x', num: -1.2e-5}]
  },
  {
    source: 'x=+1.2e-5;',
    expectation: [{action: 'upsert', id: 'x', num: 1.2e-5}]
  },
  {
    source: 'one::y []= 1.1;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {start_: 1.1}}]
  },
  {
    source: 'one::y []= a/b;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {start_: 'a/b'}}]
  },
  {
    source: 'one::y []= 1e-3*exp(z);',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {start_: '1e-3*exp(z)'}}]
  },
  {
    source: 'one::y [start_]= x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {start_: 'x'}}]
  },
  {
    source: 'one::y [ode_]= x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {ode_: 'x'}}]
  },
  {
    source: 'one::y [sw1]= x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {sw1: 'x'}}]
  },
  {
    source: 'one::y .= x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {start_: 'x'}}]
  },
  {
    source: 'one::y .= x {key: false};',
    expectation: [{action: 'upsert', id: 'y', key: false, space: 'one', assignments: {start_: 'x'}}]
  },
  {
    source: 'one::y := x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {ode_: 'x'}}]
  },
  {
    source: 'one::y `= x;',
    expectation: [{action: 'upsert', id: 'y', space: 'one', assignments: {ode_: 'x'}}]
  },
  {
    source: 'a{str: with trailing blank };',
    expectation: [{id: 'a', action: 'upsert', str: 'with trailing blank'}]
  },
  {
    source: 'a{str: "with trailing blank "};',
    expectation: [{id: 'a', action: 'upsert', str: 'with trailing blank '}]
  },
  {
    source: 'a{str: with trailing comma ,};',
    expectation: [{id: 'a', action: 'upsert', str: 'with trailing comma'}]
  },
  {
    source: 'block @Class1 {title: title1 } begin y @Class2 { title: title1, compartment: comp1 }; end',
    expectation: [{id: 'y', action: 'upsert', class: 'Class2', title: 'title1', compartment: 'comp1'}]
  },
  {
    source: '\'\'\'this is the notes\'\'\'\na;',
    expectation: [{id: 'a', action: 'upsert', notes: 'this is the notes'}]
  },
  {
    source: '   \'\'\'this is the notes\'\'\'   \n   a;',
    expectation: [{id: 'a', action: 'upsert', notes: 'this is the notes'}]
  },
  {
    source: '   \'\'\'this is the notes\'\'\'   a;',
    expectation: [{id: 'a', action: 'upsert', notes: 'this is the notes'}]
  },
  {
    source: 'k1 @Record \'title three words\';',
    expectation: [{id: 'k1', action: 'upsert', class: 'Record', title: 'title three words'}]
  },
  {
    source: 'namespace one begin\n  #include {source: 1.heta, type: heta};\nend',
    expectation: [{action: 'setNS', space: 'one'}, {action: 'include', space: 'one', source: '1.heta', type: 'heta'}]
  },
  {
    source: '\ninclude 1_.heta type heta\n',
    expectation: [{action: 'include', source: '1_.heta', type: 'heta'}]
  },
  // @Const
  {
    source: 'p1 @Const = 1;',
    expectation: [{action: 'upsert', class: 'Const', id: 'p1', num: 1}]
  },
  {
    source: 'p1 = 1 {units: UL};',
    expectation: [{action: 'upsert', units: 'UL', id: 'p1', num: 1}]
  },
  {
    source: '\'\'\'this is the notes\'\'\'\np1 {num: 1};',
    expectation: [{action: 'upsert', id: 'p1', num: 1, notes: 'this is the notes'}]
  },
  {
    source: '\'\'\'this is the notes\'\'\'\n p1 = 1;',
    expectation: [{action: 'upsert', id: 'p1', num: 1, notes: 'this is the notes'}]
  },
  {
    source: 'p1 @Const = 1 {units: UL};',
    expectation: [{action: 'upsert', class: 'Const', id: 'p1', num: 1, units: 'UL'}]
  },
  {
    description: 'no space',
    source: 'k1 @Const = 3.3;',
    expectation: [{action: 'upsert', class: 'Const', id: 'k1', num: 3.3}]
  },
  {
    description: 'no id',
    source: 'one::* @Const = 3.3;',
    expectation: [{action: 'upsert', class: 'Const', space: 'one', num: 3.3}]
  },
  {
    description: 'no id no space',
    source: '* @Const = 3.3;',
    expectation: [{action: 'upsert', class: 'Const', num: 3.3}]
  },
  {
    description: 'no num',
    source: 'k1 @Const \'title\';',
    expectation: [{action: 'upsert', class: 'Const', id: 'k1', title: 'title'}]
  },
  {
    description: 'empty statements',
    source: ';;;',
    expectation: []
  },
  {
    description: 'statements with blanks and many semicolons',
    source: ' a=1.1  ; ;  ;',
    expectation: [{
      action: 'upsert',
      id: 'a', 
      num: 1.1
    }]
  },
  {
    description: 'start_ functions',
    source: 'p1 .= a*b*func(\n  1,\n  x,\n  y\n);',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: {
        start_: 'a*b*func( 1, x, y )'
      }
    }]
  },
  {
    description: 'start_ functions',
    source: 'p1 .= "a*b*func(1,x,y)";',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: {
        start_: 'a*b*func(1,x,y)'
      }
    }]
  },
  {
    description: 'unit definition component',
    source: 'xxx @UnitDef {components: [{kind: nM, exponent: 1}, {kind: kg, exponent: -3}]};',
    expectation: [{
      action: 'upsert',
      id: 'xxx',
      class: 'UnitDef',
      components: [
        {kind: 'nM', exponent: 1},
        {kind: 'kg', exponent: -3}
      ]
    }]
  },
  {
    description: 'Empty MathExpr in dictionary',
    source: 'p1 { assignments: {start_: ""}};',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: { start_: '' }
    }]
  },
  {
    description: 'Empty MathExpr in sugar assignment',
    source: 'p1 .= ;',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: { start_: '' }
    }]
  },
  {
    description: 'Comments inside dict 1',
    source: 'r1 { actors: s1=>s2, // comment 1\nmodifiers: [m1] //comment 2\n};',
    expectation: [{
      action: 'upsert',
      id: 'r1',
      actors: 's1=>s2',
      modifiers: ['m1']
    }]
  },
  {
    description: 'Comments inside dict 2',
    source: 'r1 { // comment 0\nactors: s1=>s2, modifiers: [m1]};',
    expectation: [{
      action: 'upsert',
      id: 'r1',
      actors: 's1=>s2',
      modifiers: ['m1']
    }]
  },
  {
    description: 'Comments inside dict 3',
    source: 'r1 { // comment 0\n  actors: s1=>s2, modifiers: [m1]};',
    expectation: [{
      action: 'upsert',
      id: 'r1',
      actors: 's1=>s2',
      modifiers: ['m1']
    }]
  },
  {
    description: 'Comments inside dict 4',
    source: 'r1 { /* comment 0 */ actors: s1=>s2, /* comment 1 */ modifiers: [m1]};',
    expectation: [{
      action: 'upsert',
      id: 'r1',
      actors: 's1=>s2',
      modifiers: ['m1']
    }]
  },
  {
    description: 'Comments inside dict 5',
    source: 'm1 {compartment: c1, // comment \n} .= 0;',
    expectation: [{
      action: 'upsert',
      id: 'm1',
      compartment: 'c1',
      assignments: {start_: 0}
    }]
  },
  {
    description: 'Comments inside dict 6a',
    source: 'm1 {compartment: c1 // comment \n};',
    expectation: [{
      action: 'upsert',
      id: 'm1',
      compartment: 'c1'
    }]
  },
  {
    description: 'Comments inside dict 6b',
    source: 'm1 {compartment: c1 /* comment */,\n xxx: 12};',
    expectation: [{
      action: 'upsert',
      id: 'm1',
      compartment: 'c1',
      xxx: 12
    }]
  },
  {
    description: 'Comments inside dict 7',
    source: 'm1 {array: [] // comment \n};',
    expectation: [{
      action: 'upsert',
      id: 'm1',
      array: []
    }]
  },
  {
    description: 'Comments inside dict 8',
    source: 'm1 {obj: {} // comment \n};',
    expectation: [{
      action: 'upsert',
      id: 'm1',
      obj: {}
    }]
  },
  {
    description: 'Comments inside array 1',
    source: 'x1 {array: [ // comment 0 \n one, // comment 1 \n two, three // comment 3\n]};',
    expectation: [{
      action: 'upsert',
      id: 'x1',
      array: ['one', 'two', 'three']
    }]
  },
  {
    description: '/ sign in string',
    source: 'p1 {string: xxx/yyy};',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      string: 'xxx/yyy'
    }]
  },
  // null
  {
    description: 'null as property',
    source: 'p1 {key: null};',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      key: null
    }]
  },
  {
    description: 'null as deep property',
    source: 'p1 {key: {subkey: null}};',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      key: {subkey: null}
    }]
  },
  {
    description: 'null as array element',
    source: 'p1 {key: [null]};',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      key: [null]
    }]
  },
  {
    description: 'null inside assignment',
    source: 'p1 .= null;',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: {start_: null}
    }]
  },
  {
    description: 'null inside assignment expression',
    source: 'p1 .= a + null;',
    expectation: [{
      action: 'upsert',
      id: 'p1',
      assignments: {start_: 'a + null'}
    }]
  }
];

describe('Single object parsing.', () => {
  to_test.forEach((x) => {
    it(`Testing "${x.source}"`, () => {
      let parsed = parse(x.source);
      // console.log(parsed);
      expect(parsed).to.be.deep.equal(x.expectation);
    });
  });
});
