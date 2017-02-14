this.parseProgram = function() {
  var list = [], stmt = null;
  this.next();
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);
  return {
    type: 'Program',
    body: list,
  };
};
