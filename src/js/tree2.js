/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: false */

(function(global, undefined) {

	'use strict';

	/**
	 * Array equality
	 * @see http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
	 * Use as in [1, 2, 3].equals([1, 2, 3])
	 */
	Array.prototype.equals = function(array) {
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
	Object.defineProperty(Array.prototype, 'equals', {enumerable: false});

	/**
	 * Operators
	 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
	 */
	var operators = {
		'=': {
			sign: '=',
			precedence: 10,
			commutative: true,
		},
		'+': {
			sign: '+',
			precedence: 13,
			commutative: true,
		},
		'-': {
			sign: '+',
			unary: '-',
			precedence: 13,
			commutative: true,
		},
		'*': {
			sign: '*',
			precedence: 14,
			commutative: true,
		},
		'/': {
			sign: '*',
			unary: '/', // or 1/
			precedence: 14,
			commutative: true,
		},
		'^': {
			sign: '^',
			precedence: 15,
		},
		// TODO Add ! and %
	};

	/**
	 * Latex documentation
	 * TODO latex has operations like \sin \sum and characters like \alpha \beta
	 * @type {{\\ast: {operator: string}, \\cdot: {operator: string}, \\times: {operator: string}, \\div: {operator: string}}}
	 */
	var latex = {
		'\\ast': {
			operator: '*',
		},
		'\\cdot': {
			operator: '*',
		},
		'\\times': {
			operator: '*',
		},
		'\\div': {
			operator: '/',
		},
		// TODO \\frac{}{}
	};

	/**
	 * Bracket match
	 * @param right
	 * @returns {*}
	 */
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
	var Node = global.Node = function(options) {
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

	Node.prototype.isOperator = function() {
		return !!this.operator && !this.value;
	};

	Node.prototype.isValue = function() {
		return !this.operator && this.children.length && !!this.value;
	};

	Node.prototype.isEmpty = function() {
		return !this.operator && !this.children.length && !this.value;
	};

	Node.prototype.push = function(node) {
		if (typeof node === 'string' && node.length) {
			node = new Node({value: node});
		}
		if (node instanceof Node) {
			node.parent = this;
			this.children.push(node);
		}
	};

	Node.prototype.reset = function() {
		this._temp = '';
	};

	Node.prototype.commitChild = function() {
		this.push(this._temp);
		this.reset();
	};

	Node.prototype.commitLeft = function() {
		this.left += this._temp;
		this.depth++;
		this.reset();
	};

	Node.prototype.commitRight = function() {
		this.right += this._temp;
		this.depth--;
		this.reset();
	};

	Node.prototype.closest = function(test) {
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

	Node.prototype.getChildWith = function(item) {
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

	Node.prototype.insert = function(node) {
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
	// TODO Add implicit multiplication mode where ab is a*b

	global.parse = function(latex, implicit) {
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
				node = new Node({operator: operator});
				current = current.insert(node);
				if (!(current.parent instanceof Node)) {
					root = current;
				}
			} else if (operator &&
				current.operator.precedence < operator.precedence) {
				node = new Node({operator: operator});
				node._temp = current._temp;
				node.commitChild();
				current.reset();
				current.push(node);
				current = node;
			} else if (operator &&
				current.operator.precedence > operator.precedence) {
				current.commitChild();
				node = current.closest(function(item) {
					return item.operator.precedence <= operator.precedence;
				});
				if (node instanceof Node) {
					node = node.getChildWith(current);
					current = node.insert(new Node({operator: operator}));
				} else {
					// node = new Node({ operator: operator });
					// node.push(root);
					// current = root = node;
					current = root = root.insert(
						new Node({operator: operator}));
				}
			} else if (operator &&
				current.operator.precedence === operator.precedence) {
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
				node = current.closest(function(item) {
					return new RegExp('\\\\left\\' + left + '$').test(
						item.left);
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
	};

}(this)); // this is WorkerGlobalScope
