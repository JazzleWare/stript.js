this.parsePattern = function() {
  if (this.ttype !== TOKEN_ID)
    return null;
  var id = this.parseElemStartingWithAnID(IM_EXPR);
  console.log('GOT-PATTERN', '<'+id.name+'>', 'in', this.sdepth);
  return id;
};
