// parser generator: https://pegjs.org/

{
  const _ = require('lodash');
}

start = result: (MultylineComment/LineComment/Block/BaseStruct/NamespaceBlock)+ (Break/Space)*
  {
    return _
      .chain(result)
      .flatten()
      .compact()
      .value();
  }

// --- Grammar ---

// -- COMMENTS --
Comment "Comment" = MultylineComment/LineComment

LineComment
  = (Break/Space)* "//" [^\r\n]* Break?
    {
      return null;
    }

MultylineComment
  = (Space/Break)*
    "/*"
    s:(!"*/" s:(.))+
    "*/"
    {
      return null;
    }

BaseStruct = fullLine: (Space/Break/Note/Id/Index/Action/Type/Title/Dict/Assignment)+ EndSign
  {
    let res = Object.assign({action: 'upsert'}, ...fullLine);
    return res;
  }


Index "Index" = !("block"/"namespace"/"begin"/"end") space: KeyName "::" id: KeyName
  {
    return { id, space };
  }
Id "Id" = !("block"/"namespace"/"begin"/"end") id: KeyName !(Space* "::")
  {
    return { id };
  }

// search string in format #command
Action "Action" = "#" action: KeyName
  {
    return { action };
  }
Type "Type" = "@" type: KeyName
  {
    return { class: _.upperFirst(type) };
  }
Title "Title" = "'" title: $[^']+ "'"
  {
    return { title };
  }

Note "Note" = "'''" s:(!"!(''')" s:("\\'"/[^']))+ "'''" Break
  {
    let notes = _
      .map(s, x => x[1])
      .join('')
      .replace(/\\'/g, "'")
      .replace(/\r/g, '');
    return { notes };
  }

Dict "Dict" = "{"  (Break/Space)* item: DictPair* (Break/Space)* "}"
  {
    return _.fromPairs(item);
  }

DictPair = (Break/Space)* key: KeyName (Break/Space)* ":" (Break/Space)* values: ValueTypes ","? Comment?
  {
    return [key, values];
  }

Assignment "Assignment" = sign: SignAssignment Space* exprString: (String)
  {
    //console.log('= Assignment =')
    let result = {};
    let clearValue = typeof exprString === 'string' // remove multiple spaces, tabs and \t\r
      ? exprString.replace(/\s{2,}/g, ' ')
      : exprString;
    if (Array.isArray(sign)) {
        // statement of type: []= transforms to ['[', null, ']']
        // statement of type: [sw]= transforms to ['[', 'sw', ']']
        if (sign[1]!==null) {
          result.assignments = { [sign[1]]: {expr: clearValue} }
        } else {
          result.assignments = { "start_": {expr: clearValue} }
        }
      } else {
        switch (sign) {
          case "=":
            result.num = clearValue;
            break;
          case ".=":
            result.assignments = {"start_": {expr: clearValue}};
            break;
          case ":=":
            result.assignments = {"ode_": {expr: clearValue}};
            break;
          case "`=": // currently this syntax is not used in Heta
            result.assignments = {"ode_": {expr: clearValue, increment: true}};
            break;
        }
      }
    return result;
  }

// -- BLOCKS --

Block = (Break/Space)* "block" fullLine: (Space/Index/Action/Type/Title/Dict/Assignment)+ "begin" result: (MultylineComment/LineComment/Block/BaseStruct)+ (Break/Space)* "end" 
  {
    let blockObj = Object.assign({}, ...fullLine);
    return  _.chain(result)
      .flatten()
      .compact()
      .value()
      .map((x) => Object.assign(x, blockObj))
  }

// -- NamespaceBlock block --
NamespaceBlock = (Break/Space)* "namespace" (Break/Space)+ space: KeyName (Break/Space)+ "begin" result: (MultylineComment/LineComment/BaseStruct)+ (Break/Space)* "end" (Break/Space)*
  {
    return  _.chain(result)
      .flatten()
      .compact()
      .value()
      .map((x) => Object.assign(x, {space}))
  }

// --- Lexis ---
ValueTypes = Dict/Array/String

KeyName = symbol: $([A-Za-z_][A-Za-z0-9_]*)
  {
    return symbol;
  }

String "String" = (Break/Space)* s:(('"'[^"]+'"')/[^,[\]{};]+)
  {
    let res;
    if (s.length === 3 && Array.isArray(s[1])) {
      res = s[1].join('')
    } else {
      let str = s.join('').trim()
      if (str === 'true') {
        res = true
      } else if (str === 'false') {
        res = false
      } else if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(str)){
        res = parseFloat(str);
      } else {
        res = str;
      }
    }
    return res;
  }

/* XXX: currently not used: all type conversion in String
Digit "Digit" = s: ([-+]?[0-9]+[.]?[0-9]*([eE][-+]?[0-9]+)?) !.
  {
    console.log('= Digit = ', s)
    return parseFloat(_.flatten(s).join(''));
  }
*/

Array "Array"
  = (Break/Space)*
    "["
    (Break/Space)*
    items:(ValueTypes ','?)*
    (Break/Space)*
    "]" {
      return items.reduce((result, x) => {
        result.push(x[0]);
        return result;
      },[]);
    }

SignAssignment = ("="/":="/".="/"`="/("[" KeyName? "]="))

signClass = [@];
signTitle = ['];

Space "Space" = [ \t]
  {
    return null;
  }

EndSign = ";"

quot = ["]

Break "Break" = [\r]*[\n]
  {
    return null
  }
