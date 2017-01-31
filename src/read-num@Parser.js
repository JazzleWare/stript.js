this.readNum = function() {
  var c = this.c, len = this.src.length;
  var first = this.ch(c);
  if (first === CH_0)
    return this.readNumStartingWith0();

  c++; // first
  while (c < len && isNum(this.ch(c)))
    c++;

  this.setoff(c);
  this.ttype = TOKEN_NUM;
  this.traw = this.c0_to_c();
};

this.readNumStartingWith0 = function() {
  var c = this.c, len = this.src.length;
  c++;
  this.setoff(c);
  this.ttype = TOKEN_NUM;
  this.traw = '0';
};

