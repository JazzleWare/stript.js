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
