this.findRef = function(name, rt, createAndSetIfNotFound) {
  return this.findRef_m(name, rt, createAndSetIfNotFound);
};

this.findRef_m = function(mname, rt, createAndSetIfNotFound) {
  var refs = this.refs[rt];
  if (refs.has(mname))
    return refs.get(mname);
  if (createAndSetIfNotFound) {
    var ref = new Ref();
    ref.scope = this;
    return refs.set(mname, ref);
  }
  return null;
};
