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
  case CH_XOR:
  case CH_MODULO:
    return this.readOp_other();
  case CH_SINGLEDOT:
    return this.readDot();
  default:
    return this.readSingleCharacter();
  
  }
};
