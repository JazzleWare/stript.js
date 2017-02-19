this.parseFunction = function(idMode) {
  this.next(); // function()
  var n = {
    type: 'Function',
    id: null,
    body: null,
    params: []
  };

  if (this.ttype === TOKEN_ID) {
    ASSERT.call(this, idMode & IM_STMT,
      'a funcval is not allowed to have a name');
    n.id = this.parseElemStartingWithAnID(IM_EXPR);
  }

  if (this.tokPeek(CH_LPAREN)) {
    this.no(NL);
    this.next(); // (
    n.params = this.parseParams();
    ASSERT.call(this, this.tokGet(CH_RPAREN), 'a ) was expected');

    this.no(NL);
    ASSERT.call(this, this.tokPeek(CH_LCURLY), 'a { was expected');
    n.body = this.parseFuncBody();
  }
  else {
    ASSERT.call(this, idMode & IM_STMT, 'a ( was expected');
    ASSERT.call(this, n.id !== null, 'forward declarations must have names');
  }

  return n;
};
