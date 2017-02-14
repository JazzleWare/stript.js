this.parseProgram = function() {
  var list = [], stmt = null;
  this.next();
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);

  if (this.ttype !== TOKEN_EOF)
    this.err('an.eof.was.expected');

  return {
    type: 'Program',
    body: list,
  };
};
