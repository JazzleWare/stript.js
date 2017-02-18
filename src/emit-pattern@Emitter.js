this.emitPattern = function(n) {
  ASSERT.call(this, n.type === 'Identifier',
    'Unknown type for pattern: <'+n.type+'>');
  this.emitID(n);
};
