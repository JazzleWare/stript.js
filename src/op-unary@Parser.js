this.readOp_unary = function() {
  var c = this.c, ch = this.ch(c);
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
