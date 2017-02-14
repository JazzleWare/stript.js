this.transformIf = function(n, pushTarget, isVal) {
  this.chkPTY(n, pushTarget);
  n.test = this.transform(n.test, null, isVal);
  n.consequent = this.transform(n.consequent, null, isVal);
  n.alternate = this.transform(n.alternate, null, isVal);
  return n;
};
