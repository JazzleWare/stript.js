this.transformProgram = function(n, pushTarget, isVal) {
  var list = n.body, i = 0;

  ASSERT.call(pushTarget === null, 'pushTarget not null while transforming a Program node');
  ASSERT.call(isVal === false, 'isVal not false while transforming a Program node');

  while (i < list.length) {
    list[i] = this.transform(list[i], pushTarget, isVal);
    i++;
  }

  return n;
};
