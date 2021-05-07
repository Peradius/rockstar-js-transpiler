const KEYWORDS = {
    "is" : "eq",
    "was" : "eq",
    "were" : "eq",
    "says" : "seq",

    "plus" : "+",
    "with" : "+",
    "minus" : "-",
    "without" : "-",
    "times" : "*",
    "of" : "*",
    "over" : "/",

    "turn" : "en_rnd",
    "around" : "req_around",
    "round" : "req_around",

    "it" : "last_id",
    "he" : "last_id",
    "she" : "last_id",
    "him" : "last_id",
    "her" : "last_id",
    "they" : "last_id",
    "them" : "last_id",
    "ze" : "last_id",
    "hir" : "last_id",
    "zie" : "last_id",
    "zir" : "last_id",
    "xe" : "last_id",
    "xem" : "last_id",
    "ve" : "last_id",
    "ver" : "last_id",
    
    "EOF" : "eof",
    "put" : "en_reverse_=",
    "into" : "req_reverse_=",

    "shout" : "print",
    "whisper" : "print",
    "scream" : "print",
    "say": "print",

    "let" : "en_=",
    "be" : "req_=",
    "build" : "en_++",
    "up" : "req_up",
    "knock" : "en_--",
    "down" : "req_down",

    "while" : "loop",
    "until" : "loop",

    "if" : "cond_if",
    "else" : "cond_else",

    "mysterious" : "undefined",
    "null" : "null",
    "nothing" : "null",
    "nowhere" : "null",
    "nobody" : "null",
    "empty" : "null",
    "gone" : "null",
    
    "true" : "bool_true",
    "right" : "bool_true",
    "yes" : "bool_true",
    "ok" : "bool_true",
    
    "false" : "bool_false",
    "wrong" : "bool_false",
    "no" : "bool_false",
    "lies" : "bool_false",

    "takes" : "function_init", // Creates a function
    "taking" : "function_exec", // Calls a function
    "and" : "function_arg_sep", // Separator between various function arguments

    // Special keywords (see below)
    "special_give_back" : "return",
    "special_break_it_down" : "break",
    "special_take_it_to_the_top" : "continue",

    "special_greater_than" : ">",
    "special_lesser_than" : "<",
    "special_greater_equal_than" : ">=",
    "special_lesser_equal_than" : "<="
};

const SPECIAL_KEYWORDS = {
    "Give back" : "special_give_back",
    "Break it down": "special_break_it_down",
    "Take it to the top" : "special_take_it_to_the_top",

    "is higher than" : "special_greater_than",
    "is greater than" : "special_greater_than",
    "is bigger than" : "special_greater_than",
    "is stronger than" : "special_greater_than",

    "is lower than" : "special_lesser_than",
    "is lesser than" : "special_lesser_than",
    "is smaller than" : "special_lesser_than",
    "is weaker than" : "special_lesser_than",

    "is as high as" : "special_greater_equal_than",
    "is as great as" : "special_greater_equal_than",
    "is as big as" : "special_greater_equal_than",
    "is as strong as" : "special_greater_equal_than",

    "is as low as": "special_lesser_equal_than",
    "is as little as": "special_lesser_equal_than",
    "is as small as": "special_lesser_equal_than",
    "is as weak as": "special_lesser_equal_than"
}

const NON_OPERATORS = ["id", "str", "num", "bool_true", "bool_false", "null", "undefined", "empty_line"]

var word_lines = [];
var token_lines = [];
var declared_variables = [];
var last_used_variable;

class token{
    type;
    value;
    constructor(value, type) {
        this.value = value
        this.type = type
    }

    toString()
    {
        return "[" + this.value + ":" + this.type + "]";
    }
}

class lexer_analysis_result{
    constructor(tokens, variables) {
        this.tokens = tokens
        this.variables = variables
    }

    toString()
    {
        var desc = "Tokens:\n{\n";
        this.tokens.forEach(t => desc += t.toString())
        desc += "},\nDeclared Variables:\n{\n";
        this.variables.forEach(v => desc += v.toString() + ",\n")
        desc += "}\n"

        return desc;
    }
}

function splitIntoWords(line)
{
    // Before splitting up the words with blank space
    // clear the junk and take care of special keywords 
    // such as "Give back" which contain a blank space 
    // but should be treated as a single word

    Object.keys(SPECIAL_KEYWORDS).forEach(key => {
        line = line.replace(/[,/#$%^&*;:{}=\-`~()]/g, "")
        line = line.replaceAll(`${key}`, SPECIAL_KEYWORDS[key])
    })

    return line.trim().split(" ");
}

function analyzeWord(word, removeDots)
{
    if (word === "")
    {
        return new token("", "empty_line");
    }

    if (removeDots)
    {
        word = word.replace(/[.]/g,"")
    }

    if (isKeyword(word.toLowerCase()))
    {
        return new token(word.toLowerCase(), KEYWORDS[word.toLowerCase()]);
    }

    return new token(word, "id");
}

function isKeyword(word)
{
    let lc_word = word.toLowerCase();
    return KEYWORDS[lc_word] !== undefined;
}

function isOperator(type)
{
    return !NON_OPERATORS.includes(type);
}

function analyzeIntoTokens(word_line)
{
    var pointer = 0;
    var temp_tokens = [];
    var force_next_types = [];

    while (pointer < word_line.length)
    {
        var token = analyzeWord(word_line[pointer], force_next_types.length == 0)

        if (force_next_types.length > 0)
        {
            // This situation happen when 'eq' should expect either numeric or boolean/null value
            // example:
            // Expression is amazing    => var Expression = 7
            // Expression is ok         => var Expression = true  //(not var Expression = 2)
            let type = token.type;
            if(type === "null") token.type = force_next_types[1];
            else if(type === "undefined") token.type = force_next_types[2];
            else if(type === "bool_true") token.type = force_next_types[3];
            else if(type === "bool_false") token.type = force_next_types[4];
            else token.type = force_next_types[0];
        }

        if (token.type === "eq")
        {
            force_next_types.push("num");
            force_next_types.push("null");
            force_next_types.push("undefined");
            force_next_types.push("bool_true");
            force_next_types.push("bool_false");
        }
        else if (token.type === "seq")
        {
            force_next_types.push("str");
        }

        temp_tokens.push(token);
        pointer++;
    }

    pointer = 0;
    let tokens = [];
    let current_type = "";
    let enablers = [];
    var tokensToJoin = [];

    while (pointer < temp_tokens.length)
    {
        current_type = temp_tokens[pointer].type;

        if (current_type.includes("en_"))
        {
            enablers.push(current_type);
        }

        if (current_type.includes("req_"))
        {
            current_type = getOperatorFromEnReqPair(enablers.pop(), current_type);
            temp_tokens[pointer].type = current_type;
        }

        tokensToJoin.push(temp_tokens[pointer]);

        if (pointer + 1 >= temp_tokens.length
            || temp_tokens[pointer + 1].type !== temp_tokens[pointer].type || isOperator(current_type))
        {
            tokens.push(joinTokens(tokensToJoin, current_type));
            tokensToJoin = [];
        }

        pointer++
    }

    tokens = tokens.filter(function (t){
        return !t.type.includes("en_")
    });

    token_lines.push(tokens);
}

function joinTokens(tokens, type)
{
    if (type == "eq" || type == "seq")
    {
        return new token(tokens[0].value, "=")
    }

    if (type == "last_id")
    {
        return new token(last_used_variable, "id")
    }
    if (type == "id")
    {
        return joinIds(tokens);
    }
    else if (type == "num")
    {
        return joinNumbers(tokens);
    }
    else if (type == "str")
    {
        return joinStrings(tokens);
    }
    else
    {
        return tokens[0];
    }

    function joinIds(tokens)
    {
        var idName = "";

        tokens.forEach(t => idName += ("_" + t.value));
        idName = idName.substr(1);

        if (!declared_variables.includes(idName))
        {
            declared_variables.push(idName);
        }

        last_used_variable = idName;

        return new token(idName, "id");
    }

    function joinStrings(tokens)
    {
        var string = "";

        tokens.forEach(t => string += " " + t.value);
        string  = "\"" + string.trim() + "\"";

        return new token(string, "str");
    }

    function joinNumbers(tokens)
    {
        var string = "";
        tokens.forEach(t => string += t.value + " ");
        string = string.trim();

        var substrings = string.split(".");
        var integer_string = substrings[0];
        var decimal_string = "";
        let p = 1;

        while (p < substrings.length)
        {
            decimal_string += substrings[p].trim() + " "
            p++
        }

        var int = 0;
        integer_string.trim().split(" ").forEach(s => int = int * 10 + s.length%10);

        var dec = 0;
        var dec_helper = 0.1;

        decimal_string.split(" ").forEach(s =>
        {
            dec = dec + s.length%10 * dec_helper;
            dec_helper *= 0.1;
        })

        var num = int + dec;

        return new token(num, "num");
    }
}

function getOperatorFromEnReqPair(enabler, current_type)
{
    if (enabler === "en_rnd")
    {
        switch (current_type)
        {
            case "req_around": return "rnd";
            case "req_up" : return "rndup";
            case "req_down": return "rnddown";
        }
    }
    if (enabler === "en_++" && current_type === "req_up")
        return "++"
    if (enabler === "en_--" && current_type === "req_down")
        return "--"
    if (enabler === "en_reverse_=" && current_type === "req_reverse_=")
        return "reverse_=";
    if (enabler === "en_=" && current_type === "req_=")
        return "=";

    return "undefined";
}

function Lexer(unparsed_code)
{
    word_lines = [];
    token_lines = [];
    declared_variables = [];
    last_used_variable = "";

    var unparsed_lines = unparsed_code.split("\n")
    unparsed_lines.forEach(l => word_lines.push(splitIntoWords(l)));
    word_lines.forEach(analyzeIntoTokens);
    
    return new lexer_analysis_result(token_lines, declared_variables);
}

export default Lexer;