(function(){
"use strict";
;
function Emitter(space) {
  this.space = arguments.length ? space : "  ";
}
;
function Parser(src, mode) {
  this.c0 = this.c = 0;
  this.li0 = this.li = 1;
  this.col0 = this.col = 0;

  this.lastUsedOffset = 0;
  this.mode = mode;
  this.src = src;

  this.ttype = TOKEN_NONE;
  this.traw = "";

  this.sp = false;
  this.nl = false;
}
;
function Transformer() {
  this.scope = null;
}
;
var CH_1 = char2int('1'),
    CH_2 = char2int('2'),
    CH_3 = char2int('3'),
    CH_4 = char2int('4'),
    CH_5 = char2int('5'),
    CH_6 = char2int('6'),
    CH_7 = char2int('7'),
    CH_8 = char2int('8'),
    CH_9 = char2int('9'),
    CH_0 = char2int('0'),

    CH_a = char2int('a'), CH_A = char2int('A'),
    CH_b = char2int('b'), CH_B = char2int('B'),
    CH_e = char2int('e'), CH_E = char2int('E'),
    CH_g = char2int('g'),
    CH_f = char2int('f'), CH_F = char2int('F'),
    CH_i = char2int('i'),
    CH_m = char2int('m'),
    CH_n = char2int('n'),
    CH_o = char2int('o'), CH_O = char2int('O'),
    CH_r = char2int('r'),
    CH_t = char2int('t'),
    CH_u = char2int('u'), CH_U = char2int('U'),
    CH_v = char2int('v'), CH_X = char2int('X'),
    CH_x = char2int('x'),
    CH_y = char2int('y'),
    CH_z = char2int('z'), CH_Z = char2int('Z'),

    CH_UNDERLINE = char2int('_'),
    CH_$ = char2int('$'),

    CH_TAB = char2int('\t'),
    CH_CARRIAGE_RETURN = char2int('\r'),
    CH_LINE_FEED = char2int('\n'),
    CH_VTAB = char2int('\v'),
    CH_FORM_FEED   = char2int( '\f') ,

    CH_WHITESPACE = char2int(' '),

    CH_BACKTICK = char2int('`'),
    CH_SINGLE_QUOTE = char2int('\''),
    CH_MULTI_QUOTE = char2int('"'),
    CH_BACK_SLASH = char2int(('\\')),

    CH_DIV = char2int('/'),
    CH_MUL = char2int('*'),
    CH_MIN = char2int('-'),
    CH_ADD = char2int('+'),
    CH_AND = char2int('&'),
    CH_XOR = char2int('^'),
    CH_MODULO = char2int('%'),
    CH_OR = char2int('|'),
    CH_EQUALITY_SIGN = char2int('='),

    CH_SEMI = char2int(';'),
    CH_COMMA = char2int(','),
    CH_SINGLEDOT = char2int('.'),
    CH_COLON = char2int((':')),
    CH_QUESTION = char2int('?'),

    CH_EXCLAMATION = char2int('!'),
    CH_COMPLEMENT = char2int('~'),

    CH_ATSIGN = char2int('@'),

    CH_LPAREN = char2int('('),
    CH_RPAREN = char2int(')'),
    CH_LSQBRACKET = char2int('['),
    CH_RSQBRACKET = char2int(']'),
    CH_LCURLY = char2int('{'),
    CH_RCURLY = char2int('}'),
    CH_LESS_THAN = char2int('<'),
    CH_GREATER_THAN = char2int('>')
 ;

var CH_CR = CH_CARRIAGE_RETURN,
    CH_SP = CH_WHITESPACE,
    CH_NL = CH_LINE_FEED;

var INTBITLEN = (function() { var i = 0;
  while ( 0 < (1 << (i++)))
     if (i >= 512) return 8;

  return i;
}());


var D_INTBITLEN = 0, M_INTBITLEN = INTBITLEN - 1;
while ( M_INTBITLEN >> (++D_INTBITLEN) );

var PAREN = 'paren';
var PAREN_NODE = PAREN;

var INTERMEDIATE_ASYNC = 'intermediate-async';

var FUNCTION_TYPE = typeof function() {};
var STRING_TYPE = typeof "string";
var NUMBER_TYPE = typeof 0;
var BOOL_TYPE = typeof false;
var HAS = {}.hasOwnProperty;

function ASSERT(cond, message) { if (!cond) throw new Error(message); }

var VDT_VOID = 1;
var VDT_TYPEOF = 2;
var VDT_NONE = 0;
var VDT_DELETE = 4;
var VDT_AWAIT = 8;

var base = 0;

var TOKEN_NONE = base++;
var TOKEN_STR = base++;
var TOKEN_NUM = base++;
var TOKEN_ID = base++;
var TOKEN_EOF = -1;

;
function isNum(c) {
  return c >= CH_0 && c <= CH_9; 
}

function isIDHead(c) {
  return (c >= CH_a && c <= CH_z) ||
         (c >= CH_A && c <= CH_z) ||
         (c === CH_UNDERLINE || c === CH_$);
}

function isIDBody(c) {
  return (c >= CH_a && c <= CH_z) ||
         (c >= CH_A && c <= CH_Z) ||
         (c === CH_UNDERLINE || c === CH_$) ||
         (c <= CH_9 && c >= CH_0);
}

function char2int(ch) { return ch.charCodeAt(0); }

;
 (function(){
       var i = 0;
       while(i < this.length){
          var def = this[i++];
          if ( !def ) continue;
          var e = 0;
          while ( e < def[1].length )
             def[1][e++].call(def[0]);
       }
     }).call([
null,
[Parser.prototype, [function(){
this.ch = function(offset) {
  return this.src.charCodeAt(offset);
};

this.c0_to_c = function() {
  return this.src.substring(this.c0, this.c);
};

this.next = function() {
  if (this.c >= this.src.length) {
    this.ttype = TOKEN_EOF;
    return;
  }

  this.c0 = this.c;
  this.col0 = this.col;
  this.li0 = this.li;

  var ch = this.ch(this.c);
  if (isIDHead(ch))
    return this.readIdentifier();
  if (isNum(ch))
    return this.readNum();
  if (ch === CH_SINGLE_QUOTE || ch === CH_MULTI_QUOTE)
    return this.readString();
};

},
function(){
this.setoff = function(offset) {
  this.col += (offset-this.lastUsedOffset);
  this.lastUsedOffset = this.c = offset;
};

this.newline = function(offset) {
  this.li++;
  this.col = 0;
  this.lastUsedOffset = offset;
};

},
function(){
this.readIdentifier = function() {
  var c = this.c, len = this.src.length;
  
  ++c; // the first character
  while (c < len && isIDBody(this.ch(c)))
    c++;

  this.setoff(c);
  this.ttype = TOKEN_ID;
  this.traw = this.c0_to_c();
};    

},
function(){
this.readNum = function() {
  var c = this.c, len = this.src.length;
  var first = this.ch(c);
  if (first === CH_0)
    return this.readNumStartingWith0();

  c++; // first
  while (c < len && isNum(this.ch(c)))
    c++;

  this.setoff(c);
  this.ttype = TOKEN_NUM;
  this.traw = this.c0_to_c();
};

this.readNumStartingWith0 = function() {
  var c = this.c, len = this.src.length;
  c++;
  this.setoff(c);
  this.ttype = TOKEN_NUM;
  this.traw = '0';
};


},
function(){
this.readString = function() {
  var c = this.c, len = this.src.length;
  var strDelim = this.ch(c);
  c++; // " or '
  
  LOOP:
  while (c < len) {
    switch (this.ch(c)) {
    case CH_BACK_SLASH:
      this.setoff(c)
      this.readEsc();
      c = this.c;
      break;
    case strDelim:
      break LOOP;
    default:
      c++;
    }
  }

  if (c >= len)
    this.err('unfinished.str');

  c++; // the closing " or '

  this.setoff(c);
  this.ttype = TOKEN_STR;
  this.traw = this.c0_to_c();
};

},
function(){
this.skipWhitespace = function() {
  var sp = false, nl = false;
  var c = this.c, len = this.src.length;

  LOOP:
  while (c < len) {
    switch (this.ch(c)) {
    case CH_CR:
      c++;
      if (c < len && this.ch(c) === CH_NL) c++;
      if (!nl) nl = true;
      this.newline(c);
      break;

    case CH_NL:
      c++;
      if (!nl) nl = true;
      this.newline(c);
      break;

    case CH_SP:
    case CH_TAB:
      if (!sp) sp = true;
      c++;
      break;

    case CH_DIV:
      this.setoff(c);
      switch (c+1<len?this.ch(c+1):CH_EOF) {
      case CH_DIV:
        nl = this.readLineComment() || nl;
        c = this.c;
        break;
      case CH_MUL:
        nl = this.readMultiComment() || nl;
        c = this.c;
        break;
      default:
        this.nl = nl;
        this.sp = sp;
        this.ttype = TOKEN_DIV;
        this.traw = '/';
        return true;
      }
      break;

    default:
      break LOOP;
    }
  }
  
  this.setoff(c);

  this.sp = sp;
  this.nl = nl;

  return false;
};

}]  ],
null,
null,
null]);
this.Parser = /* name */ Parser;

;(function(){function rand(min, max) {
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

function randLen(min) {
  if (arguments.length === 0)
    min = 0;

  return rand(min, 40);
}

function randCh(charset) {
  return charset.charAt(rand(0, charset.length-1));
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

      try { assertEq_ea(item, testParser[item], tokens[e][item]); }
      catch (err) { console.error(tokens, testParser, e, tokens[e]); throw err; }
    });
    ++e;
  } while (e < tokens.length);
}

testTokens(40);

})();;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))