this.emitIf = function(n, prec, isVal) {
  this.wm('if',' ','(');
  this.emit(n.test, PREC_NONE, true);
  this.w(')');
  this.emitDependentBlock(n.consequent);
  if (!n.alternate)
    return;
  this.wm(' ','else');
  this.emitDependentBlock(n.alternate)
};
