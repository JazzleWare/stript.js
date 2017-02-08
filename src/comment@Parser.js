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
