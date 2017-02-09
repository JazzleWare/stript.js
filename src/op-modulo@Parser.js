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
