function Emitter(spaceStr) {
  this.spaceStr = arguments.length ? spaceStr : "  ";
  this.indentCache = [""];
  this.lineStarted = false;
  this.indentLevel = 0;
  this.code = "";
}
