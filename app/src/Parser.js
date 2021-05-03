import Lexer from "./Lexer.js";

var operators = {"+" : 1, "-" : 1, "=" : 10, "*": 5, "/": 5, "reverse_eq": 20, "print" : 1}
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

console.log(Parser("a cat is seven years old. and bold. and funny \n \n Old Cat says mean things\nit is new and shiny\nput a cat with Old Cat into a basket\nshout a basket"));

function Parser(unparsed_code)
{
    let results = Lexer(unparsed_code);
    declared_variables = results.variables;
    results.tokens.forEach(tl => trees.push(treeCreator(tl)));
    console.log(trees.toString());
}

function isOperator(type)
{
    return operators[type] !== undefined;
}

function treeCreator(tokens)
{
    if (tokens.length <= 0)
    {
        return undefined;
    }

    let pointer = 0;
    let highIndex = -1;
    let highValue = -1;

    while (pointer < tokens.length)
    {
        let token = tokens[pointer];
        let tokenValue = -1;

        if (isOperator(token.type))
        {
            tokenValue = operators[token.type];
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

        pointer++;
    }

    let leftTokens;
    let rightTokens;

    if (isOperatorReversed(tokens[highIndex].type))
    {
        leftTokens = tokens.slice(highIndex + 1);
        rightTokens = tokens.slice(0, highIndex);
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
    return operator === "reverse_eq";
}


