function Emitter(space) {
  this.space = arguments.length ? space : "  ";
  this.indentCache = [""];
  this.lineStarted = false;
  this.indentLevel = 0;
  this.code = "";
}
