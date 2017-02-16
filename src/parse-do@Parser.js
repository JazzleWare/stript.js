this.parseDo = function(idMode) {
  this.ensureStmt(idMode);
  this.next();

  var n = {
    type: 'DoStatement',
    body: null,
    test: null
  };

  n.body = this.parseDependentBlock();

  if (this.peekID('while')) {
    this.no(NL);
    this.next();
    this.no(NL);
    ASSERT.call(this, this.tokGet(CH_LPAREN), 'a ( was expected');
    n.test = this.parseExpr(EXPR_NONE);
    ASSERT.call(this, this.tokGet(CH_RPAREN), 'a ) was expected');
  }

  return n;
};
