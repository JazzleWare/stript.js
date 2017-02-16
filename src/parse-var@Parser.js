this.parseVar = function(idMode) {
  this.ensureStmt(idMode);

  this.next(); // var
  var list = [], decl = null;
  var n = {
    type: 'VariableDeclaration',
    declarations: list
  };

  while (true) {
    decl = this.parseDecl();
    if (decl === null)
      this.err('decl.null');

    list.push(decl);
    if (this.ttype !== CH_COMMA)
      break;
    
    this.next(); // ,
  }

  return n;
};

this.parseDecl = function() {
  var pat = this.parsePattern();
  if (pat === null)
    return null;

  var n = {
    type: 'VariableDeclarator',
    id: pat,
    init: null
  };

  if ((this.ttype & TOKEN_OP) && this.traw === '=') {
    this.next(); // =
    n.init = this.parseExpr(EXPR_NONE);
  }

  return n;
};
