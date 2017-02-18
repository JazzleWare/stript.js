this.emitParams = function(list) {
  var i = 0;
  while (i < list.length) {
    if (i > 0) this.wm(',',' ');
    this.emitPattern(list[i]);
    i++;
  }
};

emitters['Function'] = function(n, prec, flags) {
  var paren = (flags & EC_START_STMT) && !n.id;
  if (paren) this.w('(');
  this.w('function');
  if (n.id)
    this.s().emitPattern(n.id);
  this.w('(').emitParams(n.params);
  this.w(')').emitDependentBlock(n.body);
  if (paren) this.w(')');
};
