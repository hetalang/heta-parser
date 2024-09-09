// parser generator: https://pegjs.org/

start = result: (Comment/Block/Include/BaseStruct/NamespaceBlock)+ (Break/Space)*
  {
    return result
      .flat(1)
      .filter(x => !!x)
      .filter((x) => Object.keys(x).length > 0)
      .map((x) => Object.assign({action: 'upsert'}, x));
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
    (!"*/" .)*
    "*/"
    {
      return null;
    }

BaseStruct = fullLine: (Space/Break/Note/Id/Index/Action/Type/Title/Dict/Assignment/MultylineComment/LineComment)* EndSign
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
    return { class: type[0].toUpperCase() + type.slice(1) }; // replace first letter to capital
  }
Title "Title" = "'" title: $[^']+ "'"
  {
    return { title };
  }

Note "Note" = "'''" s:(!"!(''')" s:("\\'"/[^']))+ "'''" (Break/Space)*
  {
    let notes = s
      .map(x => x[1])
      .join('')
      .replace(/\\'/g, "'")
      .replace(/\r/g, '');
    return { notes };
  }

Dict "Dict" = "{" (Break/Space/Comment)* item: DictPair* (Break/Space/Comment)* "}"
  {
    let res = {};
    item.forEach(([key, value]) => res[key] = value);
    return res;
  }

DictPair = (Break/Space)* key: KeyName (Break/Space)* ":" (Break/Space)* value: ValueTypes ","? Comment?
  {
    return [key, value];
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
          result.assignments = { [sign[1]]: clearValue }
        } else {
          result.assignments = { "start_": clearValue }
        }
      } else {
        switch (sign) {
          case "=":
            result.num = clearValue;
            break;
          case ".=":
            result.assignments = {"start_": clearValue};
            break;
          case ":=":
            result.assignments = {"ode_": clearValue};
            break;
          case "`=": // currently this syntax is not used in Heta
            result.assignments = {"ode_": clearValue};
            break;
        }
      }
    return result;
  }

// allows any string including brakes, do not trim
QuotedString "Quoted String"= (Break/Space)* "\"" s: [^"]* "\""
  {
    return s.join('');
  }

// all string until stop list, trim spaces
AssignString "Assignment String" = s: [^;{#@']*
  {
    let str = s.join('')
      .replace(/[\s]+/g, ' ') // remove multiple spaces
      .replace(/^ +/g, '')    // remove leading spaces
      .replace(/ +$/g, '');   // remove trailing spaces
    let doubleRegExpr = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
    
    if (str === 'null') {
      return null;
    } else if (str === 'true') {
      return true;
    } else if (str === 'false') {
      return false;
    } else if (doubleRegExpr.test(str)) {
      return parseFloat(str);
    } else {
      return str;
    }
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
    //let qArr = !block ? [] : block.map((x) => Object.assign({}, blockObj, x));
    let qArr = block && block.filter((x) => Object.keys(x).length > 0)
      .map((x) => Object.assign({}, blockObj, x));
    return qArr;
  }

// -- NamespaceBlock block --
NamespaceBlock = (Break/Space)* type: ("abstract"/"concrete")? (Break/Space)* "namespace" (Break/Space)+ space: KeyName? Space? block: BeginEnd?
  {
    let q0 = { action: "setNS" };
    if(space) q0.space = space;
    if(type) q0.type = type;
    let qArr = [q0];
    
    block && block.filter((x) => Object.keys(x).length > 0).forEach((x) => {
        let q = Object.assign({space: space}, x);
        qArr.push(q);
    });

    return qArr;
  }

BeginEnd = (Break/Space)*
  "begin" (Break/Space)+
  internal: (Comment/Include/BaseStruct/Block)* (Break/Space)* 
  "end" (Break/Space)*
  {
    return internal
      .flat(1)
      .filter(x => !!x);
  }

// --- Lexis ---
ValueTypes = Dict/Array/QuotedString/String

KeyName = symbol: $([A-Za-z_][A-Za-z0-9_]*)
  {
    return symbol;
  }

String "String" = (Break/Space)* s: $([^,[\]{};] !"//" !"/*")+ Comment?
  {
    let str = s.trim()

    // XXX: alternative but bad solution, remove trailing comments
    //let str = s.match(/\s*(.*?)\s*(?:\/\/|\/\*|$)/)[1] // ignores text after // or /*

    if (str === 'null') {
      res = null;
    } else if (str === 'true') {
      var res = true
    } else if (str === 'false') {
      res = false
    } else if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(str)){
      res = parseFloat(str);
    } else {
      res = str;
    }
    return res;
  }

Array "Array" = "[" (Break/Space)* Comment? items:ArrayValue* (Break/Space)* "]"
  {
    return items.reduce((result, x) => {
      result.push(x);
      return result;
    },[]);
  }

ArrayValue "ArrayValue" = (Break/Space)* value: ValueTypes ","? Comment?
  {
    return value;
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
