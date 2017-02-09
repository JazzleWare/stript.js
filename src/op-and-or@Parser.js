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
