var IM_STMT = 1,
    IM_EXPR = IM_STMT << 1,
    STMT_NULLABLE = IM_EXPR << 1;
var EXPR_NONE = 0, EXPR_NULLABLE = 1;
var NL = 1, SP = NL << 1;

var EC_NONE = 0,
    EC_NEW_HEAD = 1,
    EC_START_STMT = 2;

var STMT_NONE = 0;

var RT_NONE = 0,
    RT_SIMPLE = 1,
    RT_OUTER = RT_SIMPLE << 1,
    RT_SIMPLE_OR_OUTER = RT_SIMPLE|RT_OUTER,
    RT_THIS = RT_OUTER << 1,
    RT_GLOBAL = RT_THIS << 1;

var DT_VAR = 1,
    DT_FUNC = DT_VAR << 1,
    DT_FW_FN = DT_FUNC << 1,
    DT_NONE = 0;

var ST_LOOP = 1,
    ST_FUNC = ST_LOOP << 1,
    ST_LEXICAL = ST_FUNC << 1;

var RT = [RT_SIMPLE, RT_OUTER, RT_SIMPLE_OR_OUTER, RT_GLOBAL, RT_THIS];
