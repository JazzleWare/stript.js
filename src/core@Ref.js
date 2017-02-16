this.absorb = function(otherRef) {
  ASSERT.call(this, otherRef.unresolved,
    'the ref that is going to be absorbed has to be unresolved');
  if (otherRef.scope.isFunc())
    this.indirect += otherRef.indirect + otherRef.direct;
  else {
    this.direct += otherRef.direct;
    this.indirect += otherRef.indirect;
  }
};

this.totalAcc = function() {
  return this.direct + this.indirect;
};
