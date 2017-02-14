emitters['ExpressionStatement'] = function(n, prec, flags) {
  this.e(n.expression, prec, EC_START_STMT).w(';');
};
