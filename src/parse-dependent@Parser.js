this.parseDependentBlock = function() {
  this.no(NL);
  if (this.tokPeek(CH_LCURLY))
    return this.parseBlock();
  if (!this.tokPeek(CH_COLON))
    this.err('expected.:');
  return this.parseSimpleStatement();
};
