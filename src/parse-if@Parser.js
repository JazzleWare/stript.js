this.parseIf = function(idMode) {
  this.ensureStmt(idMode); // for now, it is not allowed to be an expression
  this.next(); // id:if

  // node-first approach, for the future tolerant mode
  var n = {
    type: 'IfStatement',
    test: null,
    consequent: null,
    alternate: null
  };

  this.no(NL);
  n.test = this.parseExpr(EXPR_NONE);
  this.verifyIfTest(n.test);

  n.consequent = this.parseDependentBlock(idMode);
  
  if (this.peekID('else'))
    n.alternate = this.parseElse(idMode);

  return n;
};

this.parseElse = function(idMode) {
  this.next();

  if (this.peekID('if')) {
    this.no(NL);
    return this.parseIf(idMode)
  }

  return this.parseDependentBlock(idMode);
};
