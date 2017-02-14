this.parseStatement = function(stmtFlags) {
  var stmt = null;
  if (this.ttype === TOKEN_ID)
    stmt = this.parseElemStartingWithAnID(IM_STMT);
  else
    stmt = this.parseExprStmt(stmtFlags);

  if (stmt !== null)
    this.chkStmtTrail();

  return stmt;
};

this.chkStmtTrail = function() {
  ASSERT.call(this, !(this.ttype & TOKEN_OP),
    'no operator is allowed to come after a statement');

  TRAIL:
  if (this.tokPeek(CH_SEMI)) {
    ASSERT.call(this, !this.nl, 
      'a semicolon can not have a newline before it');
    this.next();
    ASSERT.call(this, this.ttype !== CH_RCURLY,
      'a semicolon can not have a } after it');
    ASSERT.call(this, this.ttype !== TOKEN_EOF,
      'a semicolon can not come as the last token');
    if (!this.nl)
      break TRAIL;
    ASSERT.call(this, this.ttype & TOKEN_OP,
      'a semicolon that is followed by a newline must have an operator after that newline');
  } else if (!this.nl) {
    ASSERT.call(
      this,
      this.ttype === TOKEN_EOF || this.ttype === CH_RCURLY,
      'eof or newline was expected');
  }
  
  return false;
};
