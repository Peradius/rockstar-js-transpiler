var word_lines = [];
var token_lines = [];
var declared_variables = [];
var last_used_variable;

const keywords = {
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
    'EOF' : "eof",
    "put" : "en_reverse_=",
    "into" : "req_reverse_=",
    "shout" : "print",
    "let" : "en_=",
    "be" : "req_=",
    "build" : "en_++",
    "up" : "req_up",
    "knock" : "en_--",
    "down" : "req_down"
};

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
        word = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")
    }
    else
    {
        word = word.replace(/[,/#!$%^&*;:{}=\-_`~()]/g,"")
    }

    if (isKeyword(word.toLowerCase()))
    {
        return new token(word.toLowerCase(), keywords[word.toLowerCase()]);
    }

    return new token(word, "id");
}

function isKeyword(word)
{
    let lc_word = word.toLowerCase();
    return keywords[lc_word] !== undefined;
}

let nonOperators = ["id", "str", "num", "empty_line"]

function isOperator(type)
{
    return !nonOperators.includes(type);
}

function analyzeIntoTokens(word_line)
{
    var pointer = 0;
    var temp_tokens = [];
    var force_next_types = "";

    while (pointer < word_line.length)
    {
        var token = analyzeWord(word_line[pointer], force_next_types === "")

        if (force_next_types !== "")
        {
            token.type = force_next_types;
        }

        if (token.type === "eq")
        {
            force_next_types = "num";
        }
        else if (token.type === "seq")
        {
            force_next_types = "str";
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
    let results = new lexer_analysis_result(token_lines, declared_variables)
    return results;
}

export default Lexer;