function isNum(c) {
  return c >= CH_0 && c <= CH_9; 
}

function isIDHead(c) {
  return (c >= CH_a && c <= CH_z) ||
         (c >= CH_A && c <= CH_Z) ||
         (c === CH_UNDERLINE || c === CH_$);
}

function isIDBody(c) {
  return (c >= CH_a && c <= CH_z) ||
         (c >= CH_A && c <= CH_Z) ||
         (c === CH_UNDERLINE || c === CH_$) ||
         (c <= CH_9 && c >= CH_0);
}

function char2int(ch) { return ch.charCodeAt(0); }

function createObj(base) {
  function E() {}
  E. prototype = base;
  return new E();
}
