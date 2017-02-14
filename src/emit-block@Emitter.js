this.emitDependentBlock = function(n, isElse) {
  if (n.type === 'BlockStatement')
    this.s().emitBlock(n, PREC_NONE, EC_START_STMT);
  else if (isElse && n.type === 'IfStatement')
    this.s().emit(n, PREC_NONE, EC_START_STMT);
  else 
    this.i().l().e(n, PREC_NONE, EC_START_STMT).u();
};

emitters['BlockStatement'] = 
this.emitBlock = function(n, prec, flags) {
  this.w('{');
  var list = n.body, i = 0;
  if (list.length > 0) {
    this.i();
    while (i < list.length) {
      this.l().e(list[i++], PREC_NONE, EC_START_STMT);
    }
    this.u().l()
  }
  this.w('}');
};
