this.parseClassBody = function() {
  var list = [], classElem = null;
  while (classElem = this.parseClassElem())
    list.push(classElem);
  return list;
};

this.parseClassElem = function() {
  if (!this.tokGet(CH_BACKTICK))
    return null;

  var n = {
    type: 'ClassFunc',
    id: null,
    body: [],
    params: null
  };

  this.no(NL|SP);
  ASSERT.call(this, this.ttype === TOKEN_ID,
    'class elem name has to be an id');
  n.id = this.parseElemStartingWithAnID(IM_EXPR);

  this.no(NL);
  ASSERT.call(this, this.tokGet(CH_LPAREN),
    'a ( was expected');
  n.params = this.parseParams();
  ASSERT.call(this, this.tokGet(CH_RPAREN),
    'a ) was expected');

  this.no(NL);
  ASSERT.call(this, this.tokPeek(CH_LCURLY),
    'a { was expected');
  n.body = this.parseFuncBody();

  return n;
};
