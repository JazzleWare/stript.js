this.reference = function(name, rt) {
  return this.reference_m(name+'%', rt);
};

this.reference_m = function(mname, rt) {
  ASSERT.call(this, rt !== RT_SIMPLE_OR_OUTER,
    'simple/out is a conceptual reference type; it can not get used in normal contexts');
  return this.absorbRef_m(mname, rt, null);
};

this.finish = function() {
  if (!this.parent)
    return;

  var i = 0, ref = null, list = null;

  for (var ri = 0, rt = -1; ri < RT.length; ri++) {
    rt = RT[ri];
    list = this.refs[rt];

    if (rt === RT_OUTER && this.isFunc())
      rt = RT_SIMPLE_OR_OUTER;

    while (i < list.keys.length) {
      ref = list.at(i);
      if (ref.unresolved)
        this.parent.absorbRef_m(list.keys[i], rt, ref);
      i++;
    }
  }
};

this.isFunc = function() { return this.type & ST_FUNC; };
this.isConcrete = function() { return this.type & ST_FUNC; };
this.isLexical = function() { return this.type & ST_LEXICAL; };
