emitters['Identifier'] = function(n, prec, flags) {
  this.emitID(n);
};

this.emitID = function(id) {
  this.write(id.name);
};
