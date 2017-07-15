// parser.js
var input, currToken, pos;

var TOK_OPERATOR = 1;
var TOK_NUMBER = 2;
var TOK_EOF = 3;

function nextToken() {
  var c, tok = {};

  while(pos < input.length) {
    c = input.charAt(pos++);
    switch(c) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '(':
      case ')':
        tok.op = c;
        tok.type = TOK_OPERATOR;
        return tok;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        tok.value = c;
        tok.type = TOK_NUMBER;
        return tok;

      default:
        throw "Unexpected character: " + c;
    }
  }
  tok.type = TOK_EOF;
  return tok;
}

function getNextToken() {
  var ret;

  if(currToken)
    ret = currToken;
  else
    ret = nextToken();

  currToken = undefined;

  return ret;
}

function peekNextToken() {
  if(!currToken)
    currToken = nextToken();

  return currToken;
}

function skipNextToken() {
  if(!currToken)
    currToken = nextToken();
  currToken = undefined;
}

function parseString(str) {
  input = str;
  pos = 0;

  return expression();
}


function expression() {
  return additiveExpression();
}

function additiveExpression() {
  var left = multiplicativeExpression();
  var tok = peekNextToken();
  while(tok.type == TOK_OPERATOR && (tok.op == '+' || tok.op == '-') ) {
    skipNextToken();
    var node = {};
    node.op = tok.op;
    node.left = left;
    node.right = multiplicativeExpression();
    left = node;
    tok = peekNextToken();
  }
  return left;
}

function multiplicativeExpression() {
  var left = primaryExpression();
  var tok = peekNextToken();
  while(tok.type == TOK_OPERATOR &&  (tok.op == '*' || tok.op == '/') ) {
    skipNextToken();
    var node = {};
    node.op = tok.op;
    node.left = left;
    node.right = primaryExpression();
    left = node;
    tok = peekNextToken();
  }
  return left;
}

function primaryExpression() {
  var tok = peekNextToken();
  if(tok.type == TOK_NUMBER) {
    skipNextToken();
    node = {};
    node.value = tok.value;
    return node;
  }
  else
  if(tok.type == TOK_OPERATOR && tok.op == '(') {
    skipNextToken();
    var node = expression(); // The beauty of recursion
    tok = getNextToken();
    if(tok.type != TOK_OPERATOR || tok.op != ')')
      throw "Error ) expected";
    return node
  }
  else
    throw "Error " + tok + " not exptected";
}