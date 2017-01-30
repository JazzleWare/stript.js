this.readIdentifier = function() {
  var c = this.c, len = this.src.length;
  
  ++c; // the first character
  while (c < len && isIDBody(this.ch(c)))
    c++;

  this.c = c;
  this.ttype = TOKEN_ID;
  this.traw = this.c0_to_c();
};    
