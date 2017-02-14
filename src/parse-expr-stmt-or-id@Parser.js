this.parseExprStatementOrID = function(idMode) {
  if (idMode & IM_EXPR)
    return this.id();
  return this.parseExprStmt(STMT_NONE);
};
