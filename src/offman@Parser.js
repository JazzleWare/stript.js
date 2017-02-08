// set the next position to `offset`, updating column along the way
this.setoff = function(offset) {
  this.col += (offset-this.lastUsedOffset);
  this.lastUsedOffset = this.c = offset;
};

// set the character immediately following a newline as the index for column 0, updating li along the way
// NOTE: this.c won't get updated
this.newline = function(offset) {
  this.li++;
  this.col = 0;
  this.lastUsedOffset = offset;
};

this.lcFromOffset = function(offset) {
  var li = 1, col = -1, c = 0, len = this.src.length, nl = false, isCRNL = false;
  while (c <= len) {
    switch (this.ch_or_eof(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL) {
        isCRNL = true;
        c++;
      }
    case CH_NL:
      col++;
      nl = true;
      break;
    default:
      col++;
    }
    if ((isCRNL ? c - 1 : c) === offset)
      break;
    if (nl) {
     col = -1;
     ++li;
     nl = isCRNL = false;
    }

    ++c;
  }

  if ((isCRNL ? c - 1 : c) !== offset)
    throw new Error("no lineCol for @"+offset);

  return {line: li, column: col};
};

this.offsetFromLC = function(liRef, colRef) {
  var li = 1, col = -1, c = 0, len = this.src.length, nl = false, isCRNL = false;
  while (c <= len) {
    switch (this.ch_or_eof(c)) {
    case CH_CR:
      if (c+1 < len && this.ch(c+1) === CH_NL) {
        isCRNL = true;
        c++;
      }
    case CH_NL:
      col++;
      nl = true;
      break;
    default:
      col++;
    }
    if (li === liRef && col === colRef)
      break;
    if (nl) {
      col = -1;
      ++li;
      nl = isCRNL = false;
    }    

    ++c;
  }
  
  if (li !== liRef || col !== colRef)
    throw new Error("No offset for ["+liRef+","+colRef+"]");

  return isCRNL ? c - 1 : c;
};
