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
var PUNCT = "!@#$%^&*()_+-=~`{}[]|:;<>,.?/"; // no \, ', or " for now
var STR = ID_CONTINUE + PUNCT;

function randLen() {
  return rand(0, 40);
}

function randCh(charset) {
  return charset.charAt(rand(0, charset.length-1));
}

function randSpace_sn(sp, nl) {
  var SPACE = [' ', '\t'], NL = ['\r', '\r\n', '\n'], len = randLen();

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
  while (len-->0)
    tok += randCh(STR);
  tok += strDelim;
  return tok;
};

function randTokens(num) {
  if (arguments.length === 0)
    num = 1;

  var tokens = [];
  var prev_ttype = TOKEN_NONE;

  while (tokens.length !== num+1) {
    var sp = !!rand(0,1), nl = !!rand(0,1);

    var ttype = tokens.length < num ?
      TTYPES[rand(0, TTYPES.length-1)] : TOKEN_EOF;

    if (!sp && !nl)
      while ((ttype === prev_ttype) || (prev_ttype === TOKEN_ID && ttype === TOKEN_NUM))
        ttype = TTYPES[rand(0, TTYPES.length-1)];

    prev_ttype = ttype;

    tokens.push({
      ttype: ttype,
      traw: ttype !== TOKEN_EOF ? (0, _randToken[ttype])() : "",
      nl: nl,
      sp: sp
    });
  }

  return tokens;
};

function tokens2src(tokens) {
  var str = "", i = 0;
  while (i < tokens.length) {
    var tok = tokens[i++];
    str += randSpace_sn(tok.sp, tok.nl);
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

  do {
    testParser.skipWhitespace();
    testParser.next();

    COMPARE_ATTRIBUTES.forEach(function(item) {
      if (tokens[e].ttype === TOKEN_EOF && item === 'traw')
        return;

      assertEq_ea(item, testParser[item], tokens[e][item]);
    });
    ++e;
  } while (e < tokens.length);
}

testTokens(40);

