this.no = function(flags) {
  if (flags & NL) {
    ASSERT.call(this, !this.nl,
      'newline is not allowed before the current lookahead');
  }
  if (flags & SP) {
    ASSERT.call(this, !this.sp,
      'white- space is not allwed before the current lookahead');
  }
};

this.peekID = function(idName) {
  if (this.ttype !== TOKEN_ID)
    return false;
  return this.traw === idName;
};

this.tokPeek = function(ttype) {
  return this.ttype === ttype;
};

this.tokGet = function(ttype) {
  if (this.tokPeek(ttype)) {
    this.next();
    return true;
  }
  return false;
};
