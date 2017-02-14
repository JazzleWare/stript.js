emitters['IfStatement'] = function(n, prec, flags) {
  this.wm('if',' ','(');
  this.emit(n.test, PREC_NONE, EC_NONE);
  this.w(')');
  this.emitDependentBlock(n.consequent);
  if (!n.alternate)
    return;
  this.l().w('else');
  this.emitDependentBlock(n.alternate, true);
};
