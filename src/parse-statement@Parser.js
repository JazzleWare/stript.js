this.parseStatement = function(stmtFlags) {
  if (this.ttype === TOKEN_ID)
    return this.parseElemStartingWithAnID(IM_STMT);

  return this.parseExprStatement(stmtFlags);
};
