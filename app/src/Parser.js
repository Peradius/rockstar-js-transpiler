import Lexer from "./Lexer.js";

const OPERATORS = {
    "function_arg_sep": 1,
    "return" : 100,
    "print" : 100,
    "break" : 1,
    "continue" : 1,
    "undefined" : 1,
    "null" : 1,
    "bool_true" : 1,
    "bool_false" : 1,
    "rnd" : 2,
    "rndup": 2,
    "rnddown": 2,
    ">" : 3,
    "<" : 3,
    ">=" : 3,
    "<=" : 3,
    "+" : 4,
    "-" : 4,
    "--": 4,
    "++": 4,
    "*": 5,
    "/": 5,
    "=" : 10,
    "==": 40,
    "!=" : 40,
    "&&" : 39,
    "reverse_=": 20,
    "loop": 45,
    "function_init": 30,
    "function_exec": 30,
    "cond_if" : 45,
    "cond_else" : 45
}

const BLOCK_INITALIZERS = ["loop", "function_init", "function_exec", "cond_if", "cond_else"];

var declared_variables = [];
var trees = [];

class node {
    left;
    right;
    value;
    type;

    constructor(token, left, right) {
        this.value = token.value
        this.type = token.type
        this.left = left
        this.right = right
    }

    toString()
    {
        let desc = this.value + " : " + this.type + "\n";

        if (this.left !== undefined)
        {
            desc += "Left: \n\t{\n\t\t"
                + this.left.toString()
                + "\n\t}\n"
        }

        if (this.right !== undefined)
        {
            desc += "Right: \n\t{\n\t\t"
                + this.right.toString()
                + "\n\t}\n"
        }

        return desc;
    }
}

function parse(unparsed_code)
{
    trees = [];
    let results = Lexer(unparsed_code);
    declared_variables = results.variables;
    results.tokens.forEach(tl => trees.push(treeCreator(tl)));

    let code_lines = [];

    // Always end each block starting '{' sign with '}' sign
    let codeBlocks = [];
    for (let i = 0; i < trees.length; i++) {
        if(BLOCK_INITALIZERS.includes(trees[i].type)) codeBlocks.push(i)

        if(codeBlocks.length > 0 && trees[i].type == "empty_line") {
            codeBlocks.pop();
            code_lines.push('}')
        }
        
        code_lines.push(getCode(trees[i]))
    }

    let codeBlocksLen = codeBlocks.length;
    for(let i = 0; i < codeBlocksLen; i++) {
        code_lines.push('}')
    }

    for (let i = 0; i < code_lines.length; i++)
    {
        let line = code_lines[i];
        let first_word = line.split(' ')[0];

        if (declared_variables.includes(first_word))
        {
            code_lines[i] = "let " + line;
            declared_variables = declared_variables.filter(function(value){
                return value !== first_word;
            });
        }
    }

    let code = getDeclarationsForVariables();
    code_lines.forEach(cl => code += cl + '\n');

    //eval(code);

    return code;
}

function getDeclarationsForVariables()
{
    if (declared_variables.length === 0)
    {
        return "";
    }

    let dec = "";
    declared_variables.forEach(v => dec += "var " + v + ";\n");
    dec += "\n";
    return dec;
}

function isOperator(type)
{
    return OPERATORS[type] !== undefined;
}

function treeCreator(tokens)
{
    if (tokens.length <= 0)
    {
        return undefined;
    }

    let pointer = tokens.length - 1;
    let highIndex = -1;
    let highValue = -1;

    while (pointer >= 0)
    {
        let token = tokens[pointer];
        let tokenValue = -1;

        if (isOperator(token.type))
        {
            tokenValue = OPERATORS[token.type];
        }
        else
        {
            tokenValue = 0;
        }

        if (tokenValue > highValue)
        {
            highValue = tokenValue
            highIndex = pointer
        }

        pointer--;
    }

    let leftTokens;
    let rightTokens;

    if (isOperatorReversed(tokens[highIndex].type))
    {
        leftTokens = tokens.slice(highIndex + 1);
        rightTokens = tokens.slice(0, highIndex);
        tokens[highIndex].type = tokens[highIndex].type.replace("reverse_", "");
    }
    else
    {
        leftTokens = tokens.slice(0, highIndex);
        rightTokens = tokens.slice(highIndex + 1);
    }

    if (highValue <= 0)
    {
        return new node(tokens[highIndex], undefined, undefined);
    }
    else
    {
        return new node(tokens[highIndex], treeCreator(leftTokens), treeCreator(rightTokens));
    }
}

function isOperatorReversed(operator)
{
    return operator.includes("reverse");
}

function getCode(node)
{
    if (node === undefined)
    {
        return "";
    }

    let type = node.type;
    let value = node.value;
    let left = node.left;
    let right = node.right;

    switch (type) {
        case "loop": {
            return "while(" + getCode(right) + ") {"
        }
        case "break": {
            return "break"
        }
        case "continue": {
            return "continue"
        }
        case "undefined": {
            return "undefined"
        }
        case "null": {
            return "null"
        }
        case "bool_true": {
            return "true"
        }
        case "bool_false": {
            return "false"
        }
        case "function_init": {
            return "function " + getCode(left) + "(" + getCode(right) + ") {";
        }
        case "function_arg_sep": {
            let result = "";
            if (left !== undefined) result += getCode(left) + ", "
            if (right !== undefined) result += getCode(right)

            return result
        }
        case "function_exec": {
            let result = "";
            if (left !== undefined) result += "this." + getCode(left) + "("
            if (right !== undefined) result += getCode(right) + ")"
            result + ")"
            return result;
        }
        case "cond_if": {
            let result = "if(";
            if(right !== undefined) result += getCode(right);
            result = result.replaceAll(" {", "");
            result += ") {"
            return result;
        }
        case "cond_else": {
            let result = "else {";
            if(right !== undefined) result += getCode(right);
            return result;
        }
        case "+":
        case "-":
        case "*":
        case "/":
        case "=":
        case ">":
        case "<":
        case ">=":
        case "!=":
        case "==":
        case "&&":
        case "<=": {
            return getCode(left) + " " + type + " " + getCode(right);
        }
        case "print": {
            return "console.log(" + getCode(right) + ");";
        }
        case "return": {
            return "return " + getCode(right) + ";";
        }
        case "rnd": {
            return getCode(left) + " = Math.round(" + getCode(left) + ");"
        }
        case "rndup": {
            return getCode(left) + " = Math.ceil(" + getCode(left) + ");"
        }
        case "rnddown": {
            return getCode(left) + " = Math.floor(" + getCode(left) + ");"
        }
        case "str":
        case "num":
        case "id": {
            return value;
        }
        case "++":
        case "--": {
            if (right !== undefined)
            {
                return "(" + getCode(left) + type + ")" + getCode(right)
            }
            else return "(" + getCode(left) + type + ")"
        }
        case "empty_line": {
            // return "\n";
            return "";
        }
    }
}

export default parse;