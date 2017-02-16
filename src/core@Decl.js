this.n = function(name) {
  ASSERT.call(this, this.name === "",
    'name is not empty');
  this.name = name;
  return this;
};

this.r = function(ref) {
  ASSERT.call(this, this.ref === null,
    'ref is not null');
  this.ref = ref;
  return this;
};

this.s = function(scope) {
  ASSERT.call(this, this.scope === null,
    'scope is not null');
  this.scope = scope;
  return this;
};

this.t = function(type) {
  ASSERT.call(
    this,
    type === 'v' || type === 't' || type === 'f',
    'invalid type was received ('+type+')');
  ASSERT.call(this, this.type === "",
    'type is not empty');
  this.type = type;
};

this.absorbRef = function(ref, fromScope) {
  this.ref.updateWith(ref, fromScope);
};

