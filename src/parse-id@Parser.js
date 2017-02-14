this.id = function() {
  var n = {
    type: 'Identifier',
    name: this.traw
  };
  
  this.next();
  return n;
};
