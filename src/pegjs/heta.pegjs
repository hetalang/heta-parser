// parser generator: https://pegjs.org/

{
  const _ = require('lodash');
}

start = result: (MultylineComment/LineComment/Block/Include/BaseStruct/NamespaceBlock)+ (Break/Space)*
  {
    return _
      .chain(result)
      .flatten()
      .compact()
      .filter((x) => Object.keys(x).length > 0)
      .forEach((x) => _.defaults(x, {action: 'upsert'}))
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

BaseStruct = fullLine: (Space/Break/Note/Id/Index/Action/Type/Title/Dict/Assignment)* EndSign
  {
    let res = Object.assign({}, ...fullLine);
    return res;
  }

Index "Index" = !("block"/"namespace"/"begin"/"end") space: KeyName "::" id: (KeyName/"*")
  {
    if(id==='*'){
      return { space };
    }else{
      return { id, space };
    }
  }
Id "Id" = !("block"/"namespace"/"begin"/"end") id: (KeyName/"*") !(Space* "::")
  {
    if(id==='*'){
      return {};
    }else{
      return { id };
    }
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

Note "Note" = "'''" s:(!"!(''')" s:("\\'"/[^']))+ "'''" (Break/Space)*
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

Assignment "Assignment" = sign: SignAssignment exprString: (QuotedString/AssignString)
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

// allows any string including brakes, do not trim
QuotedString "Quoted String"= (Break/Space)* "\"" s: [^"]+ "\""
  {
    return s.join('');
  }

// all string until stop list, trim spaces
AssignString "Assignment String" = s: [^;{#@']*
  {
    let str = s.join('').replace(/[\s]+/g, '');
    let doubleRegExpr = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
    let res = doubleRegExpr.test(str)
        ? parseFloat(str)
        : str;

    return res;
  }

// -- BLOCKS --

Include "Include" = (Break/Space)* "include" Space+ source: (FilePath/FilePathExt) oftype:(Space+ "type" Space+ "\""? [a-zA-Z0-9]+ "\""?)? ofwith:(Space+ "with" Space+ Dict)? Space* Break?
  {
    let res = {
      action: "include",
      source: source
    };
    let type = oftype 
      ? oftype[4].join('')
      : undefined;
    if(type) res.type = type;
    let with_ = ofwith
      ? ofwith[3]
      : undefined;
    if(with_) Object.assign(res, with_);

    return res;
  }

FilePath = s:([a-zA-Z0-9.\-/_\\]+)
  {
    return s.join('');
  }
FilePathExt = "\""? s:([^"]+) "\""?
  {
    return s.join('');
  }

Block = (Break/Space)* "block" fullLine: (Space/Index/Action/Type/Title/Dict/Assignment)+ block: BeginEnd
  {
    let blockObj = Object.assign({}, ...fullLine);
    let qArr = !block
      ? []
      : block.map((x) => Object.assign({}, blockObj, x));
    return qArr;
  }

// -- NamespaceBlock block --
NamespaceBlock = (Break/Space)* type: ("abstract"/"concrete")? (Break/Space)* "namespace" (Break/Space)+ space: KeyName? Space? block: BeginEnd?
  {
    let q0 = { action: "setNS" };
    if(space) q0.space = space;
    if(type) q0.type = type;
    let qArr = [q0];
    
    if(block){
      block.map((x) => {
        let q = Object.assign({}, {space: space}, x);
        qArr.push(q);
      });
    }

    return qArr;
  }

BeginEnd = (Break/Space)*
  "begin" (Break/Space)+
  internal: (MultylineComment/LineComment/Include/BaseStruct/Block)* (Break/Space)* 
  "end" (Break/Space)*
  {
    return _.chain(internal)
        .flatten()
        .compact()
        .value();
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

Array "Array" = (Break/Space)* "[" (Break/Space)* items:(ValueTypes ','? (Break/Space)*)* (Break/Space)* "]"
  {
    return items.reduce((result, x) => {
      result.push(x[0]);
      return result;
    },[]);
  }

SignAssignment = ("="/":="/".="/"`="/("[" KeyName? "]="))

signClass = [@];
signTitle = ['];

Space "Space" = [ \t\u202F\u00A0\u2000\u2001\u2003]
  {
    return null;
  }

EndSign = ";"

quot = ["]

Break "Break" = [\r]*[\n]
  {
    return null
  }
