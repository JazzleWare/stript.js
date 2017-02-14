this.ensureStmt = function(idMode) {
  if (!this.ensureStmt_soft(idMode))
    throw new Error('must be in stmt mode');
};

this.ensureStmt_soft = function(idMode) {
  return !!(idMode & IM_STMT);
};

