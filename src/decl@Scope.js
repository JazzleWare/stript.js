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
  var existingDecl = this.findDecl_m(mname);
  if (existingDecl) {
    ASSERT.call(this, existingDecl.type === DT_FW_FN && dt === DT_FUNC,
      'a name can only have a single func-wide declaration');
    ASSERT.call(this, existingDecl.ref.indirect !== 0,
      'a forward name must have been accessed indirectly before its actual declaration is reached.');
      
    existingDecl.type = dt;
  }
  else {
    ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE),
      'can not locally declare a name that has been previously accessed in the current scope');
    ASSERT.call(this, !this.findRef_m(mname, RT_GLOBAL),
      'can not locally declare a name that has been referenced as global');
    ASSERT.call(this, !this.findRef_m(mname, RT_OUTER),
      'can not locally declare a name that has been referenced as outer');
    ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE_OR_OUTER),
      'can not locally declare a name that has been accessed in an inner func-scope');
  
    var ref = this.findRef_m(mname, RT_SIMPLE, true);
    ref.unresolved = false;
    var newDecl = new Decl().t(dt).r(ref).n(mname);
    this.ownDecls.set(mname, newDecl);
    this.allDecls.set(mname, newDecl);
  }
};
