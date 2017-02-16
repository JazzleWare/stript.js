this.parseParams = function() {
  var list = [], elem = null;

  elem = this.parsePattern();
  while (elem) {
    list.push(elem);
    if (!this.tokGet(CH_COMMA))
      break;
    elem = this.parsePattern();
    if (elem === null)
      this.err('elem.null');
  }

  return list;
};
