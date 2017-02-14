this.parseBlock = function() {
  var list = [], stmt = null;
  var n = {
    type: 'BlockStatement',
    body: list
  };
  this.next(); // {
  while (stmt = this.parseStatement(STMT_NULLABLE))
    list.push(stmt);

  if (!this.tokGet(CH_RCURLY))
    this.err('unfinished.block');

  return n;
};
