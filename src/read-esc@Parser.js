this.readEsc = function() {
  var c = this.c, len = this.src.length;
  c++; // the \

  switch (this.ch_or_eof(c)) {
  case CH_v: case CH_b: case CH_f: case CH_r: case CH_t: case CH_n:
  case CH_BACK_SLASH: case CH_SINGLE_QUOTE: case CH_MULTI_QUOTE:
    c++;
    this.setoff(c);
    return;

  case CH_u:
    c++;
    this.setoff(c);
    return this.readEscU();
  }

  this.setoff(c);
  this.err('unknown.escape');
};
