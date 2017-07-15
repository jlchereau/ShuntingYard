/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: false */

(function (global, undefined) {

  'use strict';

  /**
   * Array equality
   * @see http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
   * Use as in [1, 2, 3].equals([1, 2, 3])
   */
  Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array) {
      return false;
    }

    // compare lengths - can save a lot of time
    if (this.length !== array.length) {
      return false;
    }

    for (var i = 0, length = this.length; i < length; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i])) {
          return false;
        }
      } else if (this[i] !== array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };
  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

  /**
   * Operators
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
   */
  var operators = {
    '=' : {
      sign: '=',
      precedence: 10,
      commutative: true
    },
    '+' : {
      sign: '+',
      precedence: 13,
      commutative: true
    },
    '-' : {
      sign: '+',
      unary: '-',
      precedence: 13,
      commutative: true
    },
    '*' : {
      sign: '*',
      precedence: 14,
      commutative: true
    },
    '/' : {
      sign: '*',
      unary: '/', // or 1/
      precedence: 14,
      commutative: true
    },
    '^' : {
      sign: '^',
      precedence: 15
    }
    // TODO Add ! and %
  };

  // TODO latex has operations like \sin \sum and characters like \alpha \beta
  var latex = {
    '\\ast': {
      operator: '*'
    },
    '\\cdot': {
      operator: '*'
    },
    '\\times': {
      operator: '*'
    },
    '\\div': {
      operator: '/'
    }
    // TODO \\frac{}{}
  };

  function leftMatch(right) {
    var left = right;
    switch (right) {
      case ')':
        left = '(';
        break;
      case '[':
        left = '[';
        break;
      case '{':
        left = '{';
        break;
    }
    return left;
  }

  /**
   * A node class for our Latex parser
   * @constructor
   */
  var Node = global.Node = function (options) {
    options = options || {};
    this.parent = options.parent;
    this.children = options.children || [];
    this.operator = options.operator;
    this.value = options.value;
    this.depth = options.depth || 0; // depth to increment and decrement to find matching parentheses, brackets, braces, lines
    this.left = options.left || ''; // left parenthesis, bracket, brace, line
    this.right = options.right || ''; // right parenthesis, bracket, brace, line
    this._temp = options._temp || '';
  };

  Node.prototype.isOperator = function () {
    return !!this.operator && !this.value;
  };

  Node.prototype.isValue = function () {
    return !this.operator && this.children.length && !!this.value;
  };

  Node.prototype.isEmpty = function () {
    return !this.operator && !this.children.length && !this.value;
  };

  Node.prototype.push = function (node) {
    if (typeof node === 'string' && node.length) {
      node = new Node({ value: node });
    }
    if (node instanceof Node) {
      node.parent = this;
      this.children.push(node);
    }
  };

  Node.prototype.reset = function () {
    this._temp = '';
  };

  Node.prototype.commitChild = function () {
    this.push(this._temp);
    this.reset();
  };

  Node.prototype.commitLeft = function () {
    this.left += this._temp;
    this.depth++;
    this.reset();
  };

  Node.prototype.commitRight = function () {
    this.right += this._temp;
    this.depth--;
    this.reset();
  };

  Node.prototype.closest = function (test) {
    var node = this;
    do {
      if (test(node)) {
        break;
      } else {
        node = node.parent;
      }
    } while (node instanceof Node);
    return node;
  };

  Node.prototype.getChildWith = function (item) {
    var node = item;
    var child;
    do {
      for (var i = 0, total = this.children.length; i < total; i++) {
        if (node === this.children[i]) {
          child = this.children[i];
          break;
        }
      }
      if (child instanceof Node) {
        break;
      } else {
        node = node.parent;
      }
    } while (node instanceof Node);
    return child;
  };

  Node.prototype.insert = function (node) {
    var parent = this.parent;
    if (parent instanceof Node) {
      var index = parent.children.indexOf(this);
      parent.children[index] = node;
      node.parent = parent;
    }
    node.push(this);
    return node;
  };


  // TODO: Consider node prototype eval (except for = >= <= > <)

  /**
   * Append method where the parsing really occurs
   * @param str
   */
  /*
  Node.prototype.append = function (str) {

    var pos;

    str = str.replace(/\s/g, ''); // ignore whitespaces

    if (this.parsed) {

      // Already parsed, so keep anything for next node
      this._temp += str;

    } else if (this.left) {

      // Find right delimiter matching left delimiter (parenthesis, bracket, brace, line)
      this.value += str;

      // Considering left delimiter, determine right match to find
      var left = this.left.slice(-1);
      var right = left;
      switch (left) {
        case '(':
          right = ')';
          break;
        case '[':
          right = ']';
          break;
        case '{':
          right = '}';
          break;
      }

      if (new RegExp('\\\\left\\' + left + '$').test(this.value)) {

        // This is an inner left delimiter of the same type, so we are going deeper
        this.depth++;

      } else if (this.depth && new RegExp('\\\\right\\' + right + '$').test(this.value)) {

        // There is a matching inner right delimiter, so we are going shallower
        this.depth--;

      } else if (new RegExp('\\\\right\\' + right + '$').test(this.value)) {

        // This is the match of the left delimiter at the correct depth, so we have a complete Node
        this.right = '\\right' + right;
        this.value = this.value.substr(0, this.value.length - this.right.length);
        this.parsed = true;
        global.parseLatexTree(this);

      } else if (str === right) {

        // this closes a LaTeX expression like \sqrt{, \fraq{, \sum_{, ...
        this.right = right;
        this.value = this.value.substr(0, this.value.length - this.right.length);
        this.parsed = true;
        global.parseLatexTree(this);

      }

    } else if (/^[=+-]$/.test(str)) {

      // Single char operators considering * is \cdot and / is frac{}{}
      if (this.value.length === 0 && /^[=]$/.test(str)) {

        this.precedence = 10; // Equality
        this.value += str;

      } else if (this.value.length === 0 && /^[+-]$/.test(str)) {

        this.precedence = 13; // Addition and subtraction
        this.value += str;

      } else {

        this._temp = str;

      }
      this.parsed = true;

    } else if (str === '\\') { // Any LaTeX statement starts a new node

      if (this.value.length === 0) {

        this.value += str;

      } else {

        this._temp = str;
        this.parsed = true;
      }

    } else if (/^\\left[\(\[\{\|]$/.test(this.value + str)) {

      this.left = this.value + str;
      this.value = '';

    } else if (/^\\(cdot|times|ast|div)$/.test(this.value + str)) {

      this.value += str;
      this.precedence = 14; // multiplication or division
      this.parsed = true;

    } else if (/^(\\[\w]+|\^|_)?{$/.test(this.value + str)) {

      this.left = this.value + str;
      this.value = '';

    } else {

      this.value += str;

    }

  };
  */

  /**
   * Return the latex formula
   */
  /*
  Node.prototype.latex = function () {
    var latex = '';
    if (Array.isArray(this.children) && this.children.length) {
      latex += this.left;
      for (var i = 0, length = this.children.length; i < length; i++) {
        latex += this.children[i].latex();
      }
      latex += this.right;
    } else {
      return this.value;
    }
    return latex;
  };
  */

  /**
   * Parse latex into a syntax tree for permutations
   * @see https://en.wikipedia.org/wiki/Operator-precedence_parser
   * @see https://en.wikipedia.org/wiki/Recursive_descent_parser
   * @see https://en.wikipedia.org/wiki/LR_parser
   * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   * @see http://javascript.crockford.com/tdop/tdop.html
   * @see http://rhyscitlema.com/algorithms/expression-parsing-algorithm/
   * @see https://ariya.io/2011/08/math-evaluator-in-javascript-part1
   * @see http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm
   * @param latex
   */
  global.parseLatexTree = function (latex) {
    if (!(latex instanceof Node)) {
      latex = new Node(latex);
    }
    var pos = -1;
    var node = new Node();
    do {
      if (node.parsed === true) {
        latex.children.push(node);
        var next = node._temp;
        node = new Node();
        if (next) {
          node.append(next);
        }
      }
      pos += 1;
      var char = latex.value.charAt(pos);
      node.append(char);
      if ((pos === latex.value.length) && (node.value)) {
        node.parsed = true;
        latex.children.push(node);
      }
    } while (pos < latex.value.length);
    return latex;
  };

  // TODO Add implicit multiplication mode where ab is a*b

  global.parse = function (latex, implicit) {
    var length = latex.length;
    var pos = -1;
    var root = new Node();
    var current = root;
    var node;
    var str;
    var operator;
    var temp;
    var left;
    var right;

    do {
      pos += 1;
      str = latex.charAt(pos);
      operator = operators[str];
      if (operator && !current.operator) {
        // Add operator to current node and commit left leaf
        current.operator = operator;
        current.commitChild();
      } else if (operator && current.operator === operator) {
        // Add right leaf to current node
        current.commitChild();
      } else if (operator && current.left && current.right) {
        node = new Node({ operator: operator });
        current = current.insert(node);
        if (!(current.parent instanceof Node)) {
          root = current;
        }
      } else if (operator && current.operator.precedence < operator.precedence) {
        node = new Node({ operator: operator });
        node._temp = current._temp;
        node.commitChild();
        current.reset();
        current.push(node);
        current = node;
      } else if (operator && current.operator.precedence > operator.precedence) {
        current.commitChild();
        node = current.closest(function (item) {
          return item.operator.precedence <= operator.precedence;
        });
        if (node instanceof Node) {
          node = node.getChildWith(current);
          current = node.insert(new Node({ operator: operator }));
        } else {
          // node = new Node({ operator: operator });
          // node.push(root);
          // current = root = node;
          current = root = root.insert(new Node({ operator: operator }));
        }
      } else if (operator && current.operator.precedence === operator.precedence) {
        debugger;
      } else if (/^\\left[\(\[\{\|]$/.test(current._temp + str)) {
        if (current.isEmpty()) {
          // if the current node is empty, add left bracket
          current._temp += str;
          current.commitLeft();
        } else {
          // if the current node has an operator or a value, create a new child node
          node = new Node();
          node._temp = current._temp + str;
          node.commitLeft();
          current.reset();
          current.push(node);
          current = node;
        }
      } else if (/\\right[\)\]\}\|]$/.test(current._temp + str)) {
        left = leftMatch(str);
        node = current.closest(function (item) {
          return new RegExp('\\\\left\\' + left + '$').test(item.left);
        });
        temp = current._temp; // We need temp when node === current
        node._temp = temp.slice(-'\\right'.length) + str;
        node.commitRight();
        current._temp = temp.substr(0, temp.length - '\\right'.length);
        current.commitChild();
        current = node.parent || root;
      } else {
        // ignore spaces
        current._temp += str.replace(/s/, '');
      }

      if (pos === length - 1) {
        current.commitChild();
      }


    } while (pos < length);

    return root;
  }


}(this)); // this is WorkerGlobalScope

/* jshint +W074 */
/* jshint +W071 */
