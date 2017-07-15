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

	var ASSOCIATIVITY = {
		LEFT: 'Left',
		RIGHT: 'Right'
	};

	/**
	 * Operators
	 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
	 */
	var operators = {
		'=': {
			sign: '=',
			precedence: 10,
			associativity: ASSOCIATIVITY.LEFT,
			exec: function (a, b) {

			}
		},
		'+': {
			sign: '+',
			precedence: 13,
			associativity: ASSOCIATIVITY.LEFT,
			exec: function (a, b) {

			}
		},
		'-': {
			sign: '-',
			precedence: 13,
			associativity: ASSOCIATIVITY.LEFT,
			exec: function (a, b) {

			}
		},
		'*': {
			sign: '*',
			precedence: 14,
			associativity: ASSOCIATIVITY.LEFT,
			exec: function (a, b) {

			}
		},
		'/': {
			sign: '/',
			precedence: 14,
			associativity: ASSOCIATIVITY.LEFT,
			exec: function (a, b) {

			}
		},
		'^': {
			sign: '^',
			precedence: 15,
			associativity: ASSOCIATIVITY.RIGHT,
			exec: function (a, b) {

			}
		}
		// TODO Add ! and %
	};

	/**
	 * Latex documentation
	 * TODO latex has operations like \sin \sum and characters like \alpha \beta
	 * @type {{\\ast: {operator: string}, \\cdot: {operator: string}, \\times: {operator: string}, \\div: {operator: string}}}
	 */
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
		},
		// TODO \\frac{}{}
		'\\sin': {
			exec: function (a) {

			}
		}
	};

	/**
	 * Latex parser based on Shunting-Yard algorithm
	 * @param latex
	 * @param implicit multiplications
	 */
	global.parseLatex = function (latex, implicit) {
		var output = [];
		var stack = [];
		var token = '';
		var str;

		// This commits the token to the output or stack
		function commit() {
			if(token.isNumeric()) {
				output += token + " ";
			} else if("^*/+-".indexOf(token) !== -1) {
				var o1 = token;
				var o2 = stack[stack.length - 1];
				while("^*/+-".indexOf(o2) !== -1 && ((operators[o1].associativity === "Left" && operators[o1].precedence <= operators[o2].precedence) || (operators[o1].associativity === "Right" && operators[o1].precedence < operators[o2].precedence))) {
					output += stack.pop() + " ";
					o2 = stack[stack.length - 1];
				}
				stack.push(o1);
			} else if (token === '\\left(') {
				stack.push('(');
			} else if (token === '\\right)') {
				while(stack[stack.length - 1] !== '(') {
					output.push(stack.pop());
				}
				stack.pop();
			}
			token = '';
		}

		// This is the tokenizer
		for (var pos = 0, length = latex.length; pos < length; pos++) {
			str = latex.charAt(pos).trim();
			token += str;
			commit();
		}

		return output;
	}

}(this)); // this is WorkerGlobalScope
