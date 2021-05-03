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
    "let" : "let",
    "turn up" : "rnd_u",
    "turn down" : "rnd_d",
    "turn around" : "rnd",
    "turn round" : "rnd",
    "a" : "id",
    "an" : "id",
    "the" : "id",
    "my" : "id",
    "your" : "id",
    "it" : "last_id",
    "\EOF" : "eof",
    "put" : "enabler_reverse_eq",
    "into" : "reverse_eq",
    "shout" : "print"
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

//console.log(Lexer("a cat is seven years old. and bold. and funny\n \nOld Cat says mean things\nit is new and shiny\nput a cat with Old Cat into a basket"))

function splitIntoWords(line)
{
    return line.trim().split(" ");
}

function analyzeWord(word)
{
    if (word === "")
    {
        return new token("", "empty_line");
    }

    if (isKeyword(word.toLowerCase()))
    {
        return new token(word.toLowerCase(), keywords[word.toLowerCase()]);
    }

    if (isStartingUpperCase(word))
    {
        return new token(word, "id");
    }

    return new token(word, "undefined");
}

function isKeyword(word)
{
    let lc_word = word.toLowerCase();
    return keywords[lc_word] !== undefined;
}

function isStartingUpperCase(word)
{
    let char = word[0];
    return char != char.toLowerCase() && char == char.toUpperCase();
}

function analyzeIntoTokens(word_line)
{
    var pointer = 0;
    var temp_tokens = [];
    var undef_type = "id";

    while (pointer < word_line.length)
    {
        var token = analyzeWord(word_line[pointer])

        if (token.type === "eq")
        {
            undef_type = "num";
        }
        else if (token.type === "seq")
        {
            undef_type = "str";
        }
        else if (token.type === "undefined")
        {
            token.type = undef_type;
        }

        temp_tokens.push(token);
        pointer++;
    }

    pointer = 0;
    let tokens = [];
    let current_type = "";
    var tokensToJoin = [];

    while (pointer < temp_tokens.length)
    {
        tokensToJoin.push(temp_tokens[pointer]);
        current_type = temp_tokens[pointer].type;

        if (pointer + 1 >= temp_tokens.length
            || temp_tokens[pointer + 1].type !== temp_tokens[pointer].type)
        {
            tokens.push(joinTokens(tokensToJoin, current_type));
            tokensToJoin = [];
        }

        pointer++
    }

    tokens = tokens.filter(t => !t.type.includes("enabler"));

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

function Lexer(unparsed_code)
{
    word_lines = [];
    token_lines = [];
    var unparsed_lines = unparsed_code.split("\n")
    unparsed_lines.forEach(l => word_lines.push(splitIntoWords(l)));
    word_lines.forEach(analyzeIntoTokens);
    let results = new lexer_analysis_result(token_lines, declared_variables)
    return results;
}

export default Lexer;