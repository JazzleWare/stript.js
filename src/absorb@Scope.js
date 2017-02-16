this.absorbRef = function(refName, refType, refInfo) {
  return this.absorbRef_m(refName+'%', refType, refInfo || null);
};

this.absorbRef_m = function(mname, refType, refInfo) {
  return absorbRef[refType].call(this, mname, refInfo);
};

var absorbRef = {};
absorbRef[RT_SIMPLE] = function(mname, refInfo) {
  if (refInfo) {
    ASSERT.call(this, refInfo.scope !== this,
      'absorbing own ref is invalid');
    ASSERT.call(this, !refInfo.scope.isFunc(),
      'a simple refInfo must not have escaped a func scope');
  }
  ASSERT.call(this, !this.findRef_m(mname, RT_OUTER),
    'this ref can not be handed over to this scope because it already exists there '+
    'as an outer');
  ASSERT.call(this, !this.findRef_m(mname, RT_GLOBAL),
    'this ref can not be handed over to the current scope because it already exists there '+
    'as a global');

  if (this.findRef_m(mname, RT_SIMPLE_OR_OUTER))
    this.removeRef_m(mname, RT_SIMPLE_OR_OUTER);

  var currentRef = this.findRef_m(mname, RT_SIMPLE, true);
  if (refInfo) currentRef.absorb(refInfo);
  else currentRef.direct++;
};

absorbRef[RT_OUTER] = function(mname, refInfo) {
  ASSERT.call(this, !refInfo || !refInfo.scope.isFunc(),
    'an outer ref will not escape a func as an outer ref;' +
    'it escapes that scope as an outer-or-simple ref') ;
  ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE),
    'an outer ref is not allowed to override an '+
    'existing simple ref');
  ASSERT.call(this, !this.findRef_m(mname, RT_GLOBAL), 
    'an outer ref is not allowed to override an '+
    'existing global ref');

  if (this.findRef_m(mname, RT_SIMPLE_OR_OUTER))
    this.removeRef_m(mname, RT_SIMPLE_OR_OUTER);

  var currentRef = this.findRef_m(mname, RT_OUTER, true);
  if (refInfo) currentRef.absorb(refInfo);
  else currentRef.direct++;
};

absorbRef[RT_SIMPLE_OR_OUTER] = function(mname, refInfo) {
  ASSERT.call(this, refInfo !== null,
    'a simple/outer-ref can not be referenced directly');
  ASSERT.call(this, !this.findRef_m(mname, RT_GLOBAL),
    'a simple/outer-ref is not allowed to verride an existing global ref');
  var currentRef = 
    this.findRef_m(mname, RT_SIMPLE) ||
    this.findRef_m(mname, RT_OUTER) ||
    this.findRef_m(mname, RT_SIMPLE_OR_OUTER, true);

  currentRef.absorb(refInfo);
};

absorbRef[RT_GLOBAL] = function(mname, refInfo) {
  ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE),
    'a global name is not allowed to override an existing simple ref');
  ASSERT.call(this, !this.findRef_m(mname, RT_OUTER),
    'a global name is not allowed to override an existing outer ref');
  ASSERT.call(this, !this.findRef_m(mname, RT_SIMPLE_OR_OUTER),
    'a global name is not allowed to override an existing simple/outer ref');

  var currentRef = this.findRef_m(mname, RT_GLOBAL, true);

  if (refInfo)
    currentRef.absorb(refInfo);
  else
    currentRef.direct += 1;
};

absorbRef[RT_THIS] = function(mname, refInfo) {
  ASSERT.call(this, false,
    'this-ref is not allowed to escape its scope');
};
