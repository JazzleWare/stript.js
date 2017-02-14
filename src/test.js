function rand(min, max) {
  var r = Math.random();
  var len = 1 + max - min;
  if (len < 0)
    len = -len;
  r *= len;
  r |= 0;
  return r + min;
}

var TTYPES = [TOKEN_ID, TOKEN_NUM, TOKEN_STR];
var _randToken = {};

function range(min, max) {
  var str = "";
  var ch = min;
  while (ch <= max) {
    str += String.fromCharCode(ch);
    ++ch;
  }
  return str;
}

var ID_HEAD = range(CH_a, CH_z) + range(CH_A, CH_Z) + '$' + '_';
var NUM = range(CH_0, CH_9);
var ID_CONTINUE = ID_HEAD + NUM;
var PUNCT = "@#()`{}[]:;,.?/\\"; // no \, ', or " for now
var ESC = ['v', 'b', 'n', 'r', 't', 'f', '"', '\'', '\\'];

var STR = ID_CONTINUE + PUNCT;

function randLen(min) {
  if (arguments.length === 0)
    min = 0;

  return rand(min, 40);
}

function randCh(charset) {
  return charset.charAt(rand(0, charset.length-1));
}

function randElem(list) {
  return list[rand(0, list.length-1)];
}

function randSpace_sn(sp, nl) {
  var SPACE = [' ', '\t'], NL = ['\r', '\r\n', '\n'], len = randLen();
  if (len === 0) {
    sp && len++;
    nl && len++;
  }

  var sp_len = 0;
  if (sp) sp_len = rand(1, len>>1);

  var nl_len = 0;
  if (nl) nl_len = len - sp_len || 1;

  var str = "";
  while (true) {
    if (rand(0,1) && sp_len) {
      sp_len--; str += SPACE[rand(0, SPACE.length-1)]; continue;
    }
    if (nl_len) {
      nl_len--; str += NL[rand(0, NL.length-1)]; continue;
    }
    if (nl_len + sp_len === 0)
      break;
  }

  return str;
};

function randEsc() {
  return '\\'+randElem(ESC);
}

_randToken[TOKEN_ID] = function() {
  var len = randLen(), tok = "";
  tok += randCh(ID_HEAD);
  while (len-->0)
    tok += randCh(ID_CONTINUE);
  return tok;
};

_randToken[TOKEN_NUM] = function() {
  var len = randLen(), tok = "";
  tok += randCh(NUM);
  if (tok !== '0')
    while (len-->0)
      tok += randCh(NUM);
  return tok;
};

_randToken[TOKEN_STR] = function() {
  var len = randLen(), tok = "";
  var strDelim = rand(1,2) === 1 ? "'" : '"';
  tok += strDelim;
  while (len-->0) {
    var ch = randCh(STR);
    if (ch === '\\') ch = randEsc();
    tok += ch;
  }
  tok += strDelim;
  return tok;
};

var OP = [
  [TOKEN_ASSIG, [PREC_ASSIG, '=']],
  [TOKEN_UNARY, [PREC_UNARY, '!', '~']],
  [TOKEN_BINARY,
    [PREC_LOG_OR, '||'],
    [PREC_LOG_AND, '&&'],
    [PREC_BIT_OR, '|'],
    [PREC_BIT_XOR, '^'],
    [PREC_BIT_AND, '&'],
    [PREC_EQ, '!=', '===', '==', '!='],
    [PREC_COMP, '>', '<=', '<', '>='],
    [PREC_SH, '>>>', '>>', '<<'],
    [PREC_MUL, '%', '*'],
    [PREC_EX, '**']],
  [TOKEN_AA_MM, 
    [PREC_UP, '++', '--']],
  [TOKEN_OP_ASSIG, [PREC_ASSIG,
    '^=', '&=', '-=', '+=', '**=',
    '*=', '%=', '<<=', '>>>=', '|=', '>>=']]
];

function randOp() {
  var op = OP[rand(0, OP.length-1)];
  var opGroup = op[rand(1, op.length-1)];
  return {
    sp: false,
    ttype: op[0],
    traw: opGroup[rand(1, opGroup.length-1)],
    prec: opGroup[0],
    nl: false
  };
}

function randTokens(num) {
  if (arguments.length === 0)
    num = 1;

  var tokens = [];
  var prev_ttype = TOKEN_NONE;

  while (tokens.length !== num+1) {
    var tok = null, sp = !!rand(0,1), nl = !!rand(0,1);

    if (tokens.length === num)
      tok = { ttype: TOKEN_EOF, traw: "", nl: false, sp: false };
    else if (rand(0,1))
      tok = randOp();
    else {
      var ttype = TTYPES[rand(0, TTYPES.length-1)];

      if (!sp && !nl)
        while ((ttype === prev_ttype) || (prev_ttype === TOKEN_ID && ttype === TOKEN_NUM))
          ttype = TTYPES[rand(0, TTYPES.length-1)];

      prev_ttype = ttype;
      tok = {
        ttype: ttype,
        traw: ttype !== TOKEN_EOF ? (0, _randToken[ttype])() : "",
        nl: false,
        sp: false
      };
    }

    tok.sp = sp;
    tok.nl = nl;

    tokens.push(tok);
  }

  return tokens;
};

function tokens2src(tokens) {
  var str = "", i = 0;
  while (i < tokens.length) {
    var tok = tokens[i++];
    var space = randSpace_sn(tok.sp, tok.nl);
    str += space;
    if ((tok.ttype & TOKEN_OP) &&
       space.length === 0) {
      tok.sp = true;
      str += ' ';
    }

    str += tok.traw;
  }
  return str;
}

function assertEq_ea(name, expected, actual) {
  if (expected !== actual)
    throw new Error('Error: <'+name+'>: {expected: "'+expected+'", actual: "'+actual+'"}');
}

var COMPARE_ATTRIBUTES = ['ttype', 'traw', 'nl', 'sp'];

function testTokens(num) {
  var tokens = randTokens(num),
      testParser = new Parser(tokens2src(tokens)),
      e = 0;

  try {
    do {
      testParser.next();

      var start = testParser.offsetFromLC(testParser.li0, testParser.col0);
      var end = testParser.offsetFromLC(testParser.li, testParser.col);

      assertEq_ea('token.start', testParser.c0, start);
      assertEq_ea('token.end', testParser.c, end);
  
      assertEq_ea('token.raw.from.start.end', testParser.src.substring(start, end), tokens[e].traw);
 
      COMPARE_ATTRIBUTES.forEach(function(item) {
        if (tokens[e].ttype === TOKEN_EOF && item === 'traw')
          return;

        assertEq_ea(item, testParser[item], tokens[e][item]);
      });

      if (tokens[e].ttype & (TOKEN_ASSIG|TOKEN_OP_ASSIG|TOKEN_BINARY|TOKEN_UNARY))
        assertEq_ea('prec', testParser.prec, tokens[e].prec);
      
      ++e;
    } while (e < tokens.length);
  }
  catch (err) {
    console.error(tokens, testParser, e, tokens[e]);
    throw err;
  }
}

testTokens(40);

