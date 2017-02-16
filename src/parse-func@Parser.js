this.parseFunction = function(idMode) {
  this.next(); // function()
  var n = {
    type: 'Function',
    id: null,
    body: [],
    params: []
  };

  var name = null;

  if (this.ttype === TOKEN_ID) {
    ASSERT.call(this, idMode & IM_STMT,
      'a funcval is not allowed to have a name');
    n.id = this.parseElemStartingWithAnID(IM_EXPR);
  }

  this.no(NL);
  ASSERT.call(this, this.tokGet(CH_LPAREN), 'a ( was expected');
  n.params = this.parseParams();
  ASSERT.call(this, this.tokGet(CH_RPAREN), 'a ) was expected');

  this.no(NL);
  ASSERT.call(this, this.tokGet(CH_LCURLY), 'a { was expected');
  n.body = this.parseFuncBody();
  ASSERT.call(this, this.tokGet(CH_RCURLY), 'a } was expected');

  return n;
};
