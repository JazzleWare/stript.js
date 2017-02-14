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
  return false;
};
