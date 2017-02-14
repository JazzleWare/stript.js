this.parseStatement = function(stmtFlags) {
  if (this.ttype === TOKEN_ID)
    return this.parseElemStartingWithAnID(IM_STMT);

  return this.parseExprStmt(stmtFlags);
};

this.chkStmtTrail = function() {
  if (this.tokPeek(CH_SEMI))
    this.semi();
  else {
    ASSERT.call(this, !this.nl,
      'a statement must either end in a semicolon or a newline');
  }
};

this.semi = function() {
  ASSERT.call(this, !this.nl,
    'a semicolon can not have a newline before it');
  this.next();
  ASSERT.call(
    this,
    this.ttype !== CH_RCURLY && this.ttype !== TOKEN_EOF,
    'a semicolon can not have a } after it, nor can it appear as the last input token');
};
