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
      if (op === TOKEN_NONE)
        op = TOKEN_BINARY;
        this.prec = PREC_SH;
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
