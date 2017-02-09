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

  this.currentFwRefTarget = null;
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
    CH_NL = CH_LINE_FEED,
    CH_EOF = -1;

var INTBITLEN = function() {
  var maxBits = ~0, bitLen = 0;
  while (maxBits &= (1<<bitLen++));
  return bitLen;
}();

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

var TOKEN_NONE = 0;
var TOKEN_EOF = 1 << 8;
var TOKEN_STR = TOKEN_EOF << 1;
var TOKEN_NUM = TOKEN_STR << 1;
var TOKEN_ID = TOKEN_NUM << 1;
var TOKEN_ASSIG = TOKEN_ID << 1;
var TOKEN_UNARY = TOKEN_ASSIG << 1;
var TOKEN_BINARY = TOKEN_UNARY << 1;
var TOKEN_AA_MM = TOKEN_BINARY << 1;
var TOKEN_OP_ASSIG = TOKEN_AA_MM << 1;
var TOKEN_XOR = TOKEN_OP_ASSIG << 1;
var TOKEN_DIV = TOKEN_XOR << 1;
var TOKEN_OP = TOKEN_ASSIG|TOKEN_UNARY|TOKEN_BINARY|TOKEN_AA_MM|TOKEN_OP_ASSIG|TOKEN_XOR|TOKEN_DIV;
var TOKEN_LIT = TOKEN_NUM|TOKEN_STR;
var TOKEN_OBJ_KEY = TOKEN_ID|TOKEN_LIT;

function nextl(nPrec) { return (nPrec&1) ? nPrec + 1 : nPrec + 2; }
function nextr(nPrec) { return (nPrec&1) ? nPrec + 2 : nPrec + 1; }

var PREC_NONE = 0; // [<start>]
var PREC_COMMA = nextl(PREC_NONE); // ,
var PREC_ASSIG = nextr(PREC_COMMA); // =, [<op>]=
var PREC_COND = nextl(PREC_ASSIG); // ?:
var PREC_LOG_OR = nextl(PREC_COND); // ||
var PREC_LOG_AND = nextl(PREC_LOG_OR); // &&
var PREC_BIT_OR = nextl(PREC_LOG_AND); // |
var PREC_BIT_XOR = nextl(PREC_BIT_OR); // ^
var PREC_BIT_AND = nextl(PREC_BIT_XOR); // &
var PREC_EQ = nextl(PREC_BIT_AND); // !=, ===, ==, !==
var PREC_COMP = nextl(PREC_EQ); // >, <=, <, >=, instanceof, in
var PREC_SH = nextl(PREC_COMP); // >>>, >>, <<
var PREC_ADD = nextl(PREC_SH); // +, -
var PREC_MUL = nextl(PREC_ADD); // *, /
var PREC_EX = nextl(PREC_MUL); // **
var PREC_UNARY = nextr(PREC_EX); // delete, void, -, +, typeof; not really a right-associative thing
var PREC_UP = nextr(PREC_UNARY); // ++, --; not really a right-associative thing

;
function isNum(c) {
  return c >= CH_0 && c <= CH_9; 
}

function isIDHead(c) {
  return (c >= CH_a && c <= CH_z) ||
         (c >= CH_A && c <= CH_Z) ||
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
[Emitter.prototype, [function(){
this.indent = function() {
  if (!this.lineStarted)
    this.err('indent.not.at.line.start');
  this.code += this.getOrCreateIndent(this.indentLevel+1);
};

this.i = function() {
  this.indent();
  return this; 
};

this.startLine = function() {
  this.insertNL();
  this.indent();
};

this.l = function() {
  this.startLine();
  return this; 
};

var emitters = {};
this.emit = function(n, prec, startStmt) {
  if (HAS.call(emitters, n.type))
    return emitters[n.type].call(this, n, prec, startStmt);
  this.err('unknow.node');
};

this.e = function(n, prec, startStmt) {
  this.emit(n, prec, startStmt); 
 return this; 
};

this.write = function(rawStr) {
  this.code += rawStr;
};

this.w = function(rawStr) {
  this.write(rawStr);
  return this;
};

this.space = function() {
  this.write(' ');
};

this.s = function() {
  this.space();
  return this;
};

this.writeMulti =
this.wm = function() {
  var i = 0;
  while (i < arguments.length) {
    var str = arguments[i++];
    if (str === ' ')
      this.space();
    else
      this.write(str);
  }

  return this;
};

this.getOrCreateIndent = function(indentLen) {
  var cache = this.indentCache;
  if (indentLen >= cache.length) {
    if (indentLen !== cache.length)
      this.err('inceremental.indent');
    cache.push(cache[cache.length-1] + this.space);
  }
  return cache[indentLen];
};


}]  ],
[Parser.prototype, [function(){
this.readLineComment = function() {
  var c = this.c, len = this.src.length;
  c += 2; // i.e., //
  while (c < len) {
    switch (this.ch(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL)
        c++;
    case CH_NL:
      c++;
      this.newline(c);
      this.c = c;
      return true;
    default:
      c++;
      break;
    }
  }

  this.setoff(c);
  return false;
};

this.readMultiComment = function() {
  var nl = false, c = this.c, len = this.src.length;
  c += 2; // i.e., /*
  while (c < len) {
    switch (this.ch(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL)
        c++;
    case CH_NL:
      if (!nl)
        nl = true;
      c++;
      this.newline(c);
      this.c = c;
      break;
    case CH_MUL: // *
      c++;
      if (c < len && this.ch(c) === CH_DIV) {
        c++;
        this.setoff(c);
        return nl;
      }
      break;
    default:
      c++;
      break;
    }
  }

  this.setoff(c);
  this.err('comment.multi.is.unfinished');
 
  return nl; // tolerance
};

},
function(){
this.ch_or_eof = function(offset) {
  if (offset >= this.src.length)
    return CH_EOF;
  return this.ch(offset);
};

this.ch = function(offset) {
  return this.src.charCodeAt(offset);
};

this.c0_to_c = function() {
  return this.src.substring(this.c0, this.c);
};

this.next = function() {

  this.c0 = this.c;
  this.col0 = this.col;
  this.li0 = this.li;

  if (this.c >= this.src.length) {
    this.ttype = TOKEN_EOF;
    return;
  }

  var ch = this.ch(this.c);
  if (isIDHead(ch))
    return this.readIdentifier();
  if (isNum(ch))
    return this.readNum();
  switch (ch) {
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return this.readString();
  case CH_MIN:
  case CH_ADD:
    return this.readOp_add_min();
  case CH_GREATER_THAN: 
    return this.readOp_gt();
  case CH_LESS_THAN:
    return this.readOp_lt();
  case CH_EXCLAMATION:
  case CH_COMPLEMENT:
    return this.readOp_unary();
  case CH_AND:
  case CH_OR:
    return this.readOp_and_or();
  case CH_EQUALITY_SIGN:
    return this.readOp_eq();
  case CH_MUL:
    return this.readOp_mul();
  case CH_XOR:
    return this.readOp_xor();
  case CH_MODULO:
    return this.readOp_modulo();
  default:
    return this.readSingleCharacter();
  
  }
};

this.readSingleCharacter = function() {
  var ch = this.src.charAt(this.c),
      chCode = ch.charCodeAt(0);
  if (chCode >= (1<<8) || chCode < 0)
    this.err('char.src.not.in.range');
  this.c++;
  this.ttype = chCode;
  this.traw = ch;
};

},
function(){
// set the next position to `offset`, updating column along the way
this.setoff = function(offset) {
  this.col += (offset-this.lastUsedOffset);
  this.lastUsedOffset = this.c = offset;
};

// set the character immediately following a newline as the index for column 0, updating li along the way
// NOTE: this.c won't get updated
this.newline = function(offset) {
  this.li++;
  this.col = 0;
  this.lastUsedOffset = offset;
};

this.lcFromOffset = function(offset) {
  var li = 1, col = -1, c = 0, len = this.src.length, nl = false, isCRNL = false;
  while (c <= len) {
    switch (this.ch_or_eof(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL) {
        isCRNL = true;
        c++;
      }
    case CH_NL:
      col++;
      nl = true;
      break;
    default:
      col++;
    }
    if ((isCRNL ? c - 1 : c) === offset)
      break;
    if (nl) {
     col = -1;
     ++li;
     nl = isCRNL = false;
    }

    ++c;
  }

  if ((isCRNL ? c - 1 : c) !== offset)
    throw new Error("no lineCol for @"+offset);

  return {line: li, column: col};
};

this.offsetFromLC = function(liRef, colRef) {
  var li = 1, col = -1, c = 0, len = this.src.length, nl = false, isCRNL = false;
  while (c <= len) {
    switch (this.ch_or_eof(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL) {
        isCRNL = true;
        c++;
      }
    case CH_NL:
      col++;
      nl = true;
      break;
    default:
      col++;
    }
    if (li === liRef && col === colRef)
      break;
    if (nl) {
      col = -1;
      ++li;
      nl = isCRNL = false;
    }    

    ++c;
  }
  
  if (li !== liRef || col !== colRef)
    throw new Error("No offset for ["+liRef+","+colRef+"]");

  return isCRNL ? c - 1 : c;
};

},
function(){
this.readOp_add_min = function() {
  var op = TOKEN_NONE, c = this.c, len = this.src.length;
  c++;
  if (c < len) {
    var ch = this.ch(c-1);
    switch (this.ch(c)) {
    case CH_EQUALITY_SIGN:
      c++;
      op = TOKEN_OP_ASSIG;
      this.prec = PREC_ASSIG;
      break;
    case ch:
      c++;
      op = TOKEN_AA_MM;
      // +++ and --- are not allowed in source
      if (c < len && this.ch(c) === ch)
        this.err('aa.mm.has.same.after');
      break;
    }
  }

  if (op === TOKEN_NONE)
    op = TOKEN_UNARY|TOKEN_BINARY;

  this.ttype = op;
  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_and_or = function() {
  var c = this.c, len = this.src.length;
  var ch = this.ch(c);
  c++;
  switch (c >= len ? CH_EOF : this.ch(c)) {
  case CH_EQUALITY_SIGN:
    c++;
    this.ttype = TOKEN_OP_ASSIG;
    this.prec = PREC_ASSIG;
    break;
  case ch:
    c++
    this.ttype = TOKEN_BINARY;
    this.prec = ch === CH_OR ?
      PREC_LOG_OR : PREC_LOG_AND;
    break;
  default:
    this.ttype = TOKEN_BINARY;
    this.prec = ch === CH_OR ?
      PREC_BIT_OR : PREC_BIT_AND;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_eq = function() {
  var c = this.c, len = this.src.length;
  c++;
  switch (c >= len ? CH_EOF : this.ch(c)) {
  case CH_EQUALITY_SIGN:
    c++;
    if (this.ch(c) === CH_EQUALITY_SIGN)
      c++;
    this.ttype = TOKEN_BINARY;
    this.prec = PREC_EQ;
    break;
  default:
    this.ttype = TOKEN_ASSIG;
    this.prec = PREC_ASSIG;
    break;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_gt = function() {
  var op = TOKEN_NONE, c = this.c, len = this.src.length;
  c++; // the >
  if (c < len) {
    var ch = this.ch(c);
    if (ch === CH_EQUALITY_SIGN) { // >=
      c++;
      op = TOKEN_BINARY;
      this.prec = PREC_COMP;
    } else if (ch === CH_GREATER_THAN) { // >> 
      c++;
      if (c < len) {
        ch = this.ch(c);
        if (ch === CH_EQUALITY_SIGN) { // >>=
          c++;
          op = TOKEN_OP_ASSIG;
          this.prec = PREC_ASSIG;
        } else if (ch === CH_GREATER_THAN) { // >>>
          c++;
          if (c < len) {
            if (this.ch(c) === CH_EQUALITY_SIGN) {
              c++;
              op = TOKEN_OP_ASSIG;
              this.prec = PREC_ASSIG;
            }
          }
          if (op === TOKEN_NONE) {
            op = TOKEN_BINARY;
            this.prec = PREC_SH;
          }
        }
      }
      if (op === TOKEN_NONE) {
        op = TOKEN_BINARY;
        this.prec = PREC_SH;
      }
    }
  }

  if (op === TOKEN_NONE) {
    op = TOKEN_BINARY;
    this.prec = PREC_COMP;
  }

  this.setoff(c);
  this.ttype = op;
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_lt = function() {
  var op = TOKEN_NONE, c = this.c, len = this.src.length;
  c++; // the <
  if (c < len) {
    var ch = this.ch(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      op = TOKEN_BINARY;
      this.prec = PREC_COMP;
    } else if (ch === CH_LESS_THAN) {
      c++;
      if (c < len) {
        if (this.ch(c) === CH_EQUALITY_SIGN) {
          c++;
          op = TOKEN_OP_ASSIG;
          this.prec = PREC_ASSIG;
        }
      }
      if (op === TOKEN_NONE) {
        op = TOKEN_BINARY;
        this.prec = PREC_SH;
      }
    }
  }
  if (op === TOKEN_NONE) {
    op = TOKEN_BINARY;
    this.prec = PREC_COMP;
  }

  this.setoff(c);
  this.ttype = op;
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_modulo = function() {
  var c = this.c, len = this.src.length;
  c++;
  if (c < len && this.ch(c) === CH_EQUALITY_SIGN) {
    c++;
    this.ttype = TOKEN_OP_ASSIG;
    this.prec = PREC_ASSIG;
  } else {
    this.ttype = TOKEN_BINARY;
    this.prec = PREC_MUL;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_mul = function() {
  var c = this.c, len = this.src.length;
  c++;
  switch (c < len ? this.ch(c) : CH_EOF) {
  case CH_MUL:
    c++;
    if (c < len && this.ch(c) === CH_EQUALITY_SIGN) {
      c++;
      this.ttype = TOKEN_OP_ASSIG;
      this.prec = PREC_ASSIG;
    } else {
      this.ttype = TOKEN_BINARY;
      this.prec = PREC_EX;
    }
    break;

  case CH_EQUALITY_SIGN:
    c++;
    this.ttype = TOKEN_OP_ASSIG;
    this.prec = PREC_ASSIG;
    break;

  default:
    this.ttype = TOKEN_BINARY;
    this.prec = PREC_MUL;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_unary = function() {
  var c = this.c, ch = this.ch(c), len = this.src.length;
  c++;
  if (ch === CH_EXCLAMATION) {
    if (c < len && this.ch(c) === CH_EQUALITY_SIGN) {
      c++;
      if (c < len && this.ch(c) === CH_EQUALITY_SIGN)
        c++;
      this.ttype = TOKEN_BINARY;
      this.prec = PREC_EQ;
    } else {
      this.ttype = TOKEN_UNARY;
      this.prec = PREC_UNARY;
    }
  } else {
    this.ttype = TOKEN_UNARY;
    this.prec = PREC_UNARY;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readOp_xor = function() {
  var c = this.c, len = this.src.length;
  c++;
  if (c < len && this.ch(c) === CH_EQUALITY_SIGN) {
    c++;
    this.ttype = TOKEN_OP_ASSIG;
    this.prec = PREC_ASSIG;
  } else {
    this.ttype = TOKEN_BINARY;
    this.prec = PREC_BIT_XOR;
  }

  this.setoff(c);
  this.traw = this.c0_to_c();
};

},
function(){
this.readEsc = function() {
  var c = this.c, len = this.src.length;
  c++; // the \

  switch (this.ch_or_eof(c)) {
  case CH_v: case CH_b: case CH_f: case CH_r: case CH_t: case CH_n:
  case CH_BACK_SLASH: case CH_SINGLE_QUOTE: case CH_MULTI_QUOTE:
    c++;
    this.setoff(c);
    return;

  case CH_u:
    c++;
    this.setoff(c);
    return this.readEscU();
  }

  this.setoff(c);
  this.err('unknown.escape');
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
    case CH_NL: case CH_CR:
      this.setoff(c);
      return this.err('str.newline');
    default:
      c++;
    }
  }

  if (c >= len)
    this.err('str.unfinished');

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