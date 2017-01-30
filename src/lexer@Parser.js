this.ch = function(offset) {
  return this.src.charCodeAt(offset);
};

this.c0_to_c = function() {
  return this.src.substring(this.c0, this.c);
};

this.next = function() {
  if (this.c >= this.src.length) {
    this.ttype = TOKEN_EOF;
    return;
  }

  this.c0 = this.c;
  this.col0 = this.col;
  this.li0 = this.li;

  var ch = this.ch(this.c);
  if (isIDHead(ch))
    return this.readIdentifier();
  if (isNum(ch))
    return this.readNum();
  if (ch === CH_SINGLE_QUOTE || ch === CH_MULTI_QUOTE)
    return this.readString();
};
