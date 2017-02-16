this.t = function(type) {
  ASSERT.call(
    this,
    type === DT_VAR || type === DT_FUNC,
    'invalid type was received ('+type+')');
  ASSERT.call(this, this.type === -1,
    'type is not empty');
  this.type = type;
  return this;
};

this.r = function(ref) {
  ASSERT.call(this, this.ref === null,
    'ref is not null');
  this.ref = ref;
  return this;
};

this.n = function(name) {
  ASSERT.call(this, this.name === "",
    'name is not empty');
  this.name = name;
  return this;
};
