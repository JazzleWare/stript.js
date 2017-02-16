this.parseFuncBody = function() {
  var list = [], stmt = null;
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);
  return list;
};
