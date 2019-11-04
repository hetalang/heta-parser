
[![Travis](https://travis-ci.org/insysbio/heta-parser.svg?branch=master)](https://travis-ci.org/insysbio/heta-parser)
[![Coverage Status](https://coveralls.io/repos/github/insysbio/heta-parser/badge.svg?branch=master)](https://coveralls.io/github/insysbio/heta-parser?branch=master)
[![GitHub release](https://img.shields.io/github/release/insysbio/heta-parser.svg)](https://github.com/insysbio/heta-parser/releases/)
[![NPM version](https://img.shields.io/npm/v/heta-parser.svg)](https://www.npmjs.com/package/heta-parser)
[![GitHub license](https://img.shields.io/github/license/insysbio/heta-parser.svg)](https://github.com/insysbio/heta-parser/blob/master/LICENSE)

# Heta parser

Parsing of heta-language files.

*This is part of [heta-language](https://hetalang.github.io/) project.*

## Usage in JavaScript

```javascript
const { parse } = require('heta-parser');

let content = 'k1 @Const = 1; one::A @Species {compartment: c1};';
let res = parse(content);
```

## Console
To create json from heta-file

```shell
npm i -g heta-parser
heta run ./path/to/file.heta >> output.json
```

## Copyright

&copy; 2019 InSysBio LLC
