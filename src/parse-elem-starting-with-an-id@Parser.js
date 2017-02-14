// idMode: stmt, expr, validate
this.parseElemStartingWithAnID = function(idMode) {
  var id = this.traw, elem = null;
  switch (id.length) {
  case 1:
    return this.parseExprStatementOrID(idMode);
  case 2:
    switch (id) {
    case 'do': return this.parseDo(idMode);
    case 'if': return this.parseIf(idMode);
    case 'in': return this.errNotAnID(idMode);
    }
    break;
  case 3:
    switch (id) {
    case 'new': return this.errNotAnID(idMode);
    case 'for': return this.parseFor(idMode);
    case 'try': return this.errNotAnID(idMode);
    case 'var': return this.parseVar(idMode);
    }
    break;
  case 4:
    switch (id) {
    case 'null': return this.parseNull(idMode);
    case 'void': return this.parseVDT(idMode);
    case 'this': return this.parseThis(idMode);
    case 'true': return this.parseTrue(idMode);
    case 'case':
      return idMode === IM_STMT ? null : this.errNotAnID(idMode);
    case 'else': return this.errNotAnID(idMode);
    case 'with': return this.parseWith(idMode);
    case 'enum': return this.parseEnum();
    }
    break;
  case 5:
    switch (id) {
    case 'class': return this.parseClass(idMode);
    case 'super': return this.parseSuper(idMode); 
    case 'break': return this.parseBreak(idMode);
    case 'throw': return this.parseThrow(idMode);
    case 'catch': return this.errNotAnID(idMode);
    case 'const': return this.parseConst(idMode);
    case 'while': return this.parseWhile(idMode);
    case 'false': return this.parseFalse(idMode);
    }
    break;
  case 6:
    switch (id) {
    case 'static': return this.errNotAnID(idMode);
    case 'delete':
    case 'typeof':
      return this.parseVDT(idMode);
    case 'export': return this.parseExport(idMode);
    case 'import': return this.parseImport(idMode);
    case 'return': return this.parseReturn(idMode);
    case 'switch': return this.parseSwitch(idMode);
    case 'public': return this.errNotAnID(idMode);
    }
    break;
  case 7:
    switch (id) {
    case 'package':
    case 'private':
      return this.errNotAnID(idMode);
    case 'default':
      return idMode === IM_STMT ? null : this.errNotAnID(idMode);
    case 'extends':
    case 'finally':
      return this.errNotAnID(idMode);
    }
    break;
  case 8:
    switch (id) {
    case 'function': return this.parseFunction(idMode);
    case 'debugger': return this.parseDebugger(idMode);
    case 'continue': return this.parseContinue(idMode);
    }
    break;
  case 9:
    switch (id) {
    case 'interface':
    case 'protected':
      return this.errNotAnID(idMode);
    }
    break;
  case 10:
    switch (id) {
    case 'instanceof':
    case 'implements':
      return this.errNotAnID(idMode);
    }
    break;
  }

  return this.parseExprStatementOrID(idMode);
};
