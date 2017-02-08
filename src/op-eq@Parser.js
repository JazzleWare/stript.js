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
