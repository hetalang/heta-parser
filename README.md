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
