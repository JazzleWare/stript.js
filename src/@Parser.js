function Parser(src, mode) {
  this.c0 = this.c = 0;
  this.li0 = this.li = 1;
  this.col0 = this.col = 0;

  this.lastUsedOffset = 0;
  this.mode = mode;
  this.src = src;

  this.ttype = TOKEN_NONE;
  this.traw = "";

  this.sp = false;
  this.nl = false;

  this.sdepth = -1;
}
