
[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![Autotests](https://github.com/hetalang/heta-parser/workflows/Autotests/badge.svg)](https://github.com/hetalang/heta-parser/actions)
[![Coverage Status](https://coveralls.io/repos/github/hetalang/heta-parser/badge.svg?branch=master)](https://coveralls.io/github/hetalang/heta-parser?branch=master)
[![NPM version](https://img.shields.io/npm/v/heta-parser.svg)](https://www.npmjs.com/package/heta-parser)
[![GitHub license](https://img.shields.io/github/license/hetalang/heta-parser.svg)](https://github.com/hetalang/heta-parser/blob/master/LICENSE)

# Heta parser

Parsing of the Heta language code in JavaScript.

*This is part of [Heta project](https://hetalang.github.io/) project.*

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

&copy; 2019-2024 InSysBio CY Ltd
