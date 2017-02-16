this.removeRef = function(name, rt) {
  return this.removeRef_m(name+'%', rt);
};

this.removeRef_m = function(mname, rt) {
  var refs = this.refs[rt];
  ASSERT.call(this, refs.has(mname),
    '<'+mname+'>: name not found (only existing names can be removed)');
  return refs.remove(mname);
};
