this.indent = function() {
  if (!this.lineStarted)
    this.err('indent.not.at.line.start');
  this.code += this.getOrCreateIndent(this.indentLevel+1);
};

this.i = function() {
  this.indent();
  return this; 
};

this.startLine = function() {
  this.insertNL();
  this.indent();
};

this.l = function() {
  this.startLine();
  return this; 
};

var emitters = {};
this.emit = function(n, prec, startStmt) {
  if (HAS.call(emitters, n.type))
    return emitters[n.type].call(this, n, prec, startStmt);
  this.err('unknow.node');
};

this.e = function(n, prec, startStmt) {
  this.emit(n, prec, startStmt); 
 return this; 
};

this.write = function(rawStr) {
  this.code += rawStr;
};

this.w = function(rawStr) {
  this.write(rawStr);
  return this;
};

this.space = function() {
  this.write(' ');
};

this.s = function() {
  this.space();
  return this;
};

this.writeMulti =
this.wm = function() {
  var i = 0;
  while (i < arguments.length) {
    var str = arguments[i++];
    if (str === ' ')
      this.space();
    else
      this.write(str);
  }

  return this;
};

this.getOrCreateIndent = function(indentLen) {
  var cache = this.indentCache;
  if (indentLen >= cache.length) {
    if (indentLen !== cache.length)
      this.err('inceremental.indent');
    cache.push(cache[cache.length-1] + this.space);
  }
  return cache[indentLen];
};

