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
