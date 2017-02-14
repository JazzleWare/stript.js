this.parseExprStmt = function(stmtFlags) {
  var e = this.parseExpr(
    (stmtFlags & STMT_NULLABLE) ? EXPR_NULLABLE : STMT_NONE);

  if (e === null)
    return null;

  var n = { type: 'ExpressionStatement', expression: e },
      isChecked = this.chkExprStmtTrail(n);
  this.verifyExprStmt(n, isChecked);
  return n;
};

this.chkExprStmtTrail = function() {
  ASSERT.call(this, !(this.ttype & TOKEN_OP),
    'no operator is allowed to come after an expression statement');

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
    ASSERT.call(this, this.ttype === TOKEN_EOF,
      'eof or newline was expected');
  }
  
  return false;
};
