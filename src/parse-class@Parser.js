this.parseClass = function(idMode) {
  this.next(); // class
  var n = {
    type: 'Class',
    id: null, body: []
  };

  this.no(NL);

  if (this.ttype === TOKEN_ID) {
    ASSERT.call(this, idMode & IM_STMT,
      'class expressions can not have a name');
    n.id = this.parseElemStartingWithAnID(IM_EXPR);
  }

  if (this.ttype === CH_LCURLY) {
    this.no(NL);
    this.next();
    n.body = this.parseClassBody();
    ASSERT.call(this, this.tokGet(CH_RCURLY),
      'a } was expected');
  } else {
    ASSERT.call(this, id & IM_STMT,
      'a { was expected');
    ASSERT.call(this, name !== null,
      'forward declaration for a class should have a name');
  }

  return n;
};
