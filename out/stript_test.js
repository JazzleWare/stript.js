(function(){
"use strict";
;
function Emitter(spaceStr) {
  this.spaceStr = arguments.length ? spaceStr : "  ";
  this.indentCache = [""];
  this.lineStarted = false;
  this.indentLevel = 0;
  this.code = "";
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
var emitters = {};
;
var IM_STMT = 1,
    IM_EXPR = IM_STMT << 1,
    STMT_NULLABLE = IM_EXPR << 1;
var EXPR_NONE = 0, EXPR_NULLABLE = 1;
var NL = 1, SP = NL << 1;

var EC_NONE = 0,
    EC_NEW_HEAD = 1,
    EC_START_STMT = 2;

var STMT_NONE = 0;
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
  this.indentLevel++; 
};

this.i = function() {
  this.indent();
  return this; 
};

this.l = function() {
  this.startLine();
  return this; 
};

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
  if (this.lineStarted) {
    this.code += this.getOrCreateIndent(this.indentLevel);
    this.lineStarted = false;
  }
  this.code += rawStr;
};

this.w = function(rawStr) {
  this.write(rawStr);
  return this;
};

this.space = function() {
  if (this.lineStarted)
    this.err('useless.space');

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

this.unindent = function() {
  if (this.indentLevel <= 0)
    this.err('unindent.nowidth');

  this.indentLevel--;
};

this.u = function() {
  this.unindent();
  return this;
};

this.getOrCreateIndent = function(indentLen) {
  var cache = this.indentCache;
  if (indentLen >= cache.length) {
    if (indentLen !== cache.length)
      this.err('inceremental.indent');
    cache.push(cache[cache.length-1] + this.spaceStr);
  }
  return cache[indentLen];
};

this.startLine = function() {
  this.insertNL();
  this.lineStarted = true;
};

this.insertNL = function() {
  this.code += '\n';
};

},
function(){
this.emitDependentBlock = function(n, isElse) {
  if (n.type === 'BlockStatement')
    this.s().emitBlock(n, PREC_NONE, EC_START_STMT);
  else if (isElse && n.type === 'IfStatement')
    this.s().emit(n, PREC_NONE, EC_START_STMT);
  else 
    this.i().l().e(n, PREC_NONE, EC_START_STMT).u();
};

emitters['BlockStatement'] = 
this.emitBlock = function(n, prec, flags) {
  this.w('{');
  var list = n.body, i = 0;
  if (list.length > 0) {
    this.i();
    while (i < list.length) {
      this.l().e(list[i++], PREC_NONE, EC_START_STMT);
    }
    this.u().l()
  }
  this.w('}');
};

},
function(){
emitters['ExpressionStatement'] = function(n, prec, flags) {
  this.e(n.expression, prec, EC_START_STMT).w(';');
};

},
function(){
emitters['IfStatement'] = function(n, prec, flags) {
  this.wm('if',' ','(');
  this.emit(n.test, PREC_NONE, EC_NONE);
  this.w(')');
  this.emitDependentBlock(n.consequent);
  if (!n.alternate)
    return;
  this.l().w('else');
  this.emitDependentBlock(n.alternate, true);
};

},
function(){
emitters['Identifier'] = function(n, prec, flags) {
  this.write(n.name);
};

},
function(){
emitters['Program'] = function(n, prec, isStmt) {
  var list = n.body, i = 0;
  while (i < list.length) {
    var stmt = list[i++];
    i > 0 && this.startLine();
    this.emit(stmt);
  }
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
  this.skipWhitespace();

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
this.no = function(flags) {
  if (flags & NL) {
    ASSERT.call(this, !this.nl,
      'newline is not allowed before the current lookahead');
  }
  if (flags & SP) {
    ASSERT.call(this, !this.sp,
      'white- space is not allwed before the current lookahead');
  }
};

this.peekID = function(idName) {
  if (this.ttype !== TOKEN_ID)
    return false;
  return this.traw === idName;
};

this.tokPeek = function(ttype) {
  return this.ttype === ttype;
};

this.tokGet = function(ttype) {
  if (this.tokPeek(ttype)) {
    this.next();
    return true;
  }
  return false;
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
this.parseBlock = function() {
  var list = [], stmt = null;
  var n = {
    type: 'BlockStatement',
    body: list
  };
  this.next(); // {
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);

  if (!this.tokGet(CH_RCURLY))
    this.err('unfinished.block');

  return n;
};

},
function(){
this.parseDependentBlock = function() {
  this.no(NL);
  if (this.tokPeek(CH_LCURLY))
    return this.parseBlock();
  if (!this.tokPeek(CH_COLON))
    this.err('expected.:');
  return this.parseSimpleStatement();
};

},
function(){
// idMode: stmt, expr, validate
this.parseElemStartingWithAnID = function(idMode) {
  var id = this.traw, elem = null;
  switch (id.length) {
  case 1:
    return this.parseExprStatementOrID(idMode);
  case 2:
    switch (id) {
    case 'do': return this.parseDo(idMode);
    case 'if': return this.parseIf(idMode);
    case 'in': return this.errNotAnID(idMode);
    }
    break;
  case 3:
    switch (id) {
    case 'new': return this.errNotAnID(idMode);
    case 'for': return this.parseFor(idMode);
    case 'try': return this.errNotAnID(idMode);
    case 'var': return this.parseVar(idMode);
    }
    break;
  case 4:
    switch (id) {
    case 'null': return this.parseNull(idMode);
    case 'void': return this.parseVDT(idMode);
    case 'this': return this.parseThis(idMode);
    case 'true': return this.parseTrue(idMode);
    case 'case':
      return idMode === IM_STMT ? null : this.errNotAnID(idMode);
    case 'else': return this.errNotAnID(idMode);
    case 'with': return this.parseWith(idMode);
    case 'enum': return this.parseEnum();
    }
    break;
  case 5:
    switch (id) {
    case 'class': return this.parseClass(idMode);
    case 'super': return this.parseSuper(idMode); 
    case 'break': return this.parseBreak(idMode);
    case 'throw': return this.parseThrow(idMode);
    case 'catch': return this.errNotAnID(idMode);
    case 'const': return this.parseConst(idMode);
    case 'while': return this.parseWhile(idMode);
    case 'false': return this.parseFalse(idMode);
    }
    break;
  case 6:
    switch (id) {
    case 'static': return this.errNotAnID(idMode);
    case 'delete':
    case 'typeof':
      return this.parseVDT(idMode);
    case 'export': return this.parseExport(idMode);
    case 'import': return this.parseImport(idMode);
    case 'return': return this.parseReturn(idMode);
    case 'switch': return this.parseSwitch(idMode);
    case 'public': return this.errNotAnID(idMode);
    }
    break;
  case 7:
    switch (id) {
    case 'package':
    case 'private':
      return this.errNotAnID(idMode);
    case 'default':
      return idMode === IM_STMT ? null : this.errNotAnID(idMode);
    case 'extends':
    case 'finally':
      return this.errNotAnID(idMode);
    }
    break;
  case 8:
    switch (id) {
    case 'function': return this.parseFunction(idMode);
    case 'debugger': return this.parseDebugger(idMode);
    case 'continue': return this.parseContinue(idMode);
    }
    break;
  case 9:
    switch (id) {
    case 'interface':
    case 'protected':
      return this.errNotAnID(idMode);
    }
    break;
  case 10:
    switch (id) {
    case 'instanceof':
    case 'implements':
      return this.errNotAnID(idMode);
    }
    break;
  }

  return this.parseExprStatementOrID(idMode);
};

},
function(){
this.parseExprHead = function(exFlags) {
  var head = null;

  switch (this.ttype) {
  case TOKEN_ID:
    head = this.parseElemStartingWithAnID(IM_EXPR);
    break;
  case TOKEN_STR: head = this.parseStr(); break;
  case TOKEN_NUM: head = this.parseNum(); break;
  case TOKEN_BINARY|TOKEN_UNARY:
  case TOKEN_UNARY: return null;
  case CH_LCURLY: head = this.parseObj(); break;
  case CH_LPAREN: head = this.parseParen(); break;
  case CH_LSQBRACKET: head = this.parseArray(); break;
  case TOKEN_BINARY:
    if (this.traw === '<') {
      head = this.parseAngleFunc();
      break;
    }
  case TOKEN_DIV: head = this.parseRegex(); break;
  default: return null;
  }

  TRAILER:
  while (true) {
    switch (this.ttype) {
    case CH_SINGLEDOT:
      head = this.parseMem(head, false);
      break;
    case CH_LPAREN:
      head = this.parseCall(head);
      break;
    case CH_LSQBRACKET:
      head = this.parseMem(head, true);
      break;
    default:
      break TRAILER;
    }
  }

  return head;
};

},
function(){
this.parseExprStatementOrID = function(idMode) {
  if (idMode & IM_EXPR)
    return this.id();
  return this.parseExprStmt(STMT_NONE);
};

},
function(){
this.parseExprStmt = function(stmtFlags) {
  var e = this.parseExpr(
    (stmtFlags & STMT_NULLABLE) ? EXPR_NULLABLE : STMT_NONE);

  if (e === null)
    return null;

  var n = { type: 'ExpressionStatement', expression: e },
      isChecked = this.chkExprStmtTrail(n);
  this.verifyExprStmt(n, isChecked);
  return n;
};

this.chkExprStmtTrail = function() {
  return false;
};

},
function(){
this.parseExpr = function(exprMode) {
  var head = this.parseExprHead(exprMode);
  if (head === null) {
    if (!(exprMode & EXPR_NULLABLE))
      this.err('null.expr');
  }

  return head;
};

},
function(){
this.id = function() {
  var n = {
    type: 'Identifier',
    name: this.traw
  };
  
  this.next();
  return n;
};

},
function(){
this.parseIf = function(idMode) {
  this.ensureStmt(idMode); // for now, it is not allowed to be an expression
  this.next(); // id:if

  // node-first approach, for the future tolerant mode
  var n = {
    type: 'IfStatement',
    test: null,
    consequent: null,
    alternate: null
  };

  this.no(NL);
  n.test = this.parseExpr(EXPR_NONE);
  this.verifyIfTest(n.test);

  n.consequent = this.parseDependentBlock(idMode);
  
  if (this.peekID('else'))
    n.alternate = this.parseElse(idMode);

  return n;
};

this.parseElse = function(idMode) {
  this.next();

  if (this.peekID('if')) {
    this.no(NL);
    return this.parseIf(idMode)
  }

  return this.parseDependentBlock(idMode);
};

},
function(){
this.parseProgram = function() {
  var list = [], stmt = null;
  this.next();
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);

  if (this.ttype !== TOKEN_EOF)
    this.err('an.eof.was.expected');

  return {
    type: 'Program',
    body: list,
  };
};

},
function(){
this.parseStatement = function(stmtFlags) {
  var stmt = null;
  if (this.ttype === TOKEN_ID)
    stmt = this.parseElemStartingWithAnID(IM_STMT);
  else
    stmt = this.parseExprStmt(stmtFlags);

  if (stmt !== null)
    this.chkStmtTrail();

  return stmt;
};

this.chkStmtTrail = function() {
  ASSERT.call(this, !(this.ttype & TOKEN_OP),
    'no operator is allowed to come after a statement');

  TRAIL:
  if (this.tokPeek(CH_SEMI)) {
    ASSERT.call(this, !this.nl, 
      'a semicolon can not have a newline before it');
    this.next();
    ASSERT.call(this, this.ttype !== CH_RCURLY,
      'a semicolon can not have a } after it');
    ASSERT.call(this, this.ttype !== TOKEN_EOF,
      'a semicolon can not come as the last token');
    if (!this.nl)
      break TRAIL;
    ASSERT.call(this, this.ttype & TOKEN_OP,
      'a semicolon that is followed by a newline must have an operator after that newline');
  } else if (!this.nl) {
    ASSERT.call(
      this,
      this.ttype === TOKEN_EOF || this.ttype === CH_RCURLY,
      'eof or newline was expected');
  }
  
  return false;
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
        break LOOP;
      }
      break;

    default:
      break LOOP;
    }
  }
  
  this.setoff(c);

  this.sp = sp;
  this.nl = nl;
};

},
function(){
this.ensureStmt = function(idMode) {
  if (!this.ensureStmt_soft(idMode))
    throw new Error('must be in stmt mode');
};

this.ensureStmt_soft = function(idMode) {
  return !!(idMode & IM_STMT);
};


},
function(){
this.verifyExprStmt = function(n, isChecked) {};

},
function(){
this.verifyIfTest = function(test) {};

}]  ],
[Transformer.prototype, [function(){
this.transformIf = function(n, pushTarget, isVal) {
  this.chkPTY(n, pushTarget);
  n.test = this.transform(n.test, null, isVal);
  n.consequent = this.transform(n.consequent, null, isVal);
  n.alternate = this.transform(n.alternate, null, isVal);
  return n;
};

},
function(){
this.transformProgram = function(n, pushTarget, isVal) {
  var list = n.body, i = 0;

  ASSERT.call(pushTarget === null, 'pushTarget not null while transforming a Program node');
  ASSERT.call(isVal === false, 'isVal not false while transforming a Program node');

  while (i < list.length) {
    list[i] = this.transform(list[i], pushTarget, isVal);
    i++;
  }

  return n;
};

}]  ],
null,
null,
null,
null]);
this.Parser = /* name */ Parser;
this.Emitter = Emitter;

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

})();;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))