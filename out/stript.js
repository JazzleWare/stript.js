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
;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))