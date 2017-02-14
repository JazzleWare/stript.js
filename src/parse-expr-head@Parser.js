this.parseExprHead = function(exFlags) {
  var head = null;

  switch (this.ttype) {
  case TOKEN_ID:
    head = this.parseElemStartingWithAnID(IM_EXPR);
    break;
  case TOKEN_STR: head = this.parseStr(); break;
  case TOKEN_NUM: head = this.parseNum(); break;
  case TOKEN_BINARY|TOKEN_UNARY:
  case TOKEN_UNARY: return null;
  case CH_LCURLY: head = this.parseObj(); break;
  case CH_LPAREN: head = this.parseParen(); break;
  case CH_LSQBRACKET: head = this.parseArray(); break;
  case TOKEN_BINARY:
    if (this.traw === '<') {
      head = this.parseAngleFunc();
      break;
    }
  case TOKEN_DIV: head = this.parseRegex(); break;
  default: return null;
  }

  TRAILER:
  while (true) {
    switch (this.ttype) {
    case CH_SINGLEDOT:
      head = this.parseMem(head, false);
      break;
    case CH_LPAREN:
      head = this.parseCall(head);
      break;
    case CH_LSQBRACKET:
      head = this.parseMem(head, true);
      break;
    default:
      break TRAILER;
    }
  }

  return head;
};
