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
