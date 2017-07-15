
String.prototype.isNumeric = function() {
  return !isNaN(parseFloat(this)) && isFinite(this);
};

Array.prototype.clean = function() {
  for(var i = 0; i < this.length; i++) {
    if(this[i] === "") {
      this.splice(i, 1);
    }
  }
  return this;
};

function MathSolver() {

  this.infixToPostfix = function(infix) {
    var outputQueue = "";
    var operatorStack = [];
    var operators = {
      "^": {
        precedence: 4,
        associativity: "Right"
      },
      "/": {
        precedence: 3,
        associativity: "Left"
      },
      "*": {
        precedence: 3,
        associativity: "Left"
      },
      "+": {
        precedence: 2,
        associativity: "Left"
      },
      "-": {
        precedence: 2,
        associativity: "Left"
      }
    }
    infix = infix.replace(/\s+/g, "");
    infix = infix.split(/([\+\-\*\/\^\(\)])/).clean();
    for(var i = 0; i < infix.length; i++) {
      var token = infix[i];
      if(token.isNumeric()) {
        outputQueue += token + " ";
      } else if("^*/+-".indexOf(token) !== -1) {
        var o1 = token;
        var o2 = operatorStack[operatorStack.length - 1];
        while("^*/+-".indexOf(o2) !== -1 && ((operators[o1].associativity === "Left" && operators[o1].precedence <= operators[o2].precedence) || (operators[o1].associativity === "Right" && operators[o1].precedence < operators[o2].precedence))) {
          outputQueue += operatorStack.pop() + " ";
          o2 = operatorStack[operatorStack.length - 1];
        }
        operatorStack.push(o1);
      } else if(token === "(") {
        operatorStack.push(token);
      } else if(token === ")") {
        while(operatorStack[operatorStack.length - 1] !== "(") {
          outputQueue += operatorStack.pop() + " ";
        }
        operatorStack.pop();
      }
    }
    while(operatorStack.length > 0) {
      outputQueue += operatorStack.pop() + " ";
    }
    return outputQueue;
  }

}