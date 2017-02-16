this.declare = function(name, dt) {
  return this.declare_m(name+'%', dt);
};

this.findDecl = function(mname) {
  return this.findDecl_m(mname);
};

this.findDecl_m = function(mname) {
  if (this.allDecls.has(mname))
    return this.allDecls.get(mname);

  return null;
};

this.declare_m = function(mname, dt) {
  ASSERT.call(this, !this.findDecl_m(mname),
    'a name can only have a single func-wide declaration');
  ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE),
    'can not locally declare a name that has been previously accessed in the current scope');
  ASSERT.call(this, !this.findRef_m(mname, RT_GLOBAL),
    'can not locally declare a name that has been referenced as global');
  ASSERT.call(this, !this.findRef_m(mname, RT_OUTER),
    'can not locally declare a name that has been referenced as outer');

  var ref = this.findRef_m(mname, RT_SIMPLE_OR_OUTER);
  if (ref !== null) {
    ASSERT.call(this, dt === DT_FUNC,
      'forward references has to be indirect, and they must resolve to function declarations');
    this.removeRef_m(mname, RT_SIMPLE_OR_OUTER);
  }

  ref = this.findRef_m(mname, RT_SIMPLE, true);
  ref.unresolved = false;

  var newDecl = new Decl().t(dt).r(ref).n(mname);

  this.ownDecls.set(mname, newDecl);
  this.allDecls.set(mname, newDecl);
};
