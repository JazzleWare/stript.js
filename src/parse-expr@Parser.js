this.parseExpr = function(exprMode) {
  var head = this.parseExprHead(exprMode);
  if (head === null) {
    if (!(exprMode & EXPR_NULLABLE))
      this.err('null.expr');
  }

  return head;
};
