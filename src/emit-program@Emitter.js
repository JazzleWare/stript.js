this.emitProgram = function(n, prec, isStmt) {
  ASSERT.call(prec === PREC_NONE, 'prec must be PREC_NONE while emitting a Program node');
  ASSERT.call(isStatement === true, 'isStmt must be true while emitting a Program node');
  
  var list = n.body, i = 0;
  while (i < list.length) {
    var stmt = list[i++];
    i > 0 && this.startLine();
    this.emit(stmt);
  }
};
