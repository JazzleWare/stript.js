this.setoff = function(offset) {
  this.col += (offset-this.lastUsedOffset);
  this.lastUsedOffset = this.c = offset;
};

this.newline = function(offset) {
  this.li++;
  this.col = 0;
  this.lastUsedOffset = offset;
};
