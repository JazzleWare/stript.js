var IM_STMT = 1,
    IM_EXPR = IM_STMT << 1,
    STMT_NULLABLE = IM_EXPR << 1;
var EXPR_NONE = 0, EXPR_NULLABLE = 1;
var NL = 1, SP = NL << 1;

var EC_NONE = 0,
    EC_NEW_HEAD = 1,
    EC_START_STMT = 2;

var STMT_NONE = 0;
