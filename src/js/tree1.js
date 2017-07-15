/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: false */

/* This function has too many statements. */
/* jshint -W071 */

/* This function's cyclomatic complexity is too high. */
/* jshint -W074 */

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
	 * A node class for our Latex parser
	 * @constructor
	 */
	var Node = global.Node = function (expr) {
		// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
		this.precedence = 20; // 20 is any group, 14 is multiplication or division, 13 is addition or subtraction, and 10 is equality
		this.value = '';
		this.children = [];
		this.parsed = false;
		this.depth = 0; // depth to increment and decrement to find matching parentheses, brackets, braces, lines
		this.left = ''; // left parenthesis, bracket, brace, line
		this.right = ''; // right parenthesis, bracket, brace, line
		this.next = ''; // Add to next node
		this.append(expr || '');
	};

	/**
	 * Append method where the parsing really occurs
	 * @param str
	 */
	Node.prototype.append = function (str) {

		var pos;

		str = str.replace(/\s/g, ''); // ignore whitespaces

		if (this.parsed) {

			// Already parsed, so keep anything for next node
			this.next += str;

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

				this.next = str;

			}
			this.parsed = true;

		} else if (str === '\\') { // Any LaTeX statement starts a new node

			if (this.value.length === 0) {

				this.value += str;

			} else {

				this.next = str;
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

	/**
	 * Return the latex formula
	 */
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
				var next = node.next;
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

	/**
	 * Returns an array of permutated LaTeX expressions, e.g. a + b and b + a or a * b and b * a
	 * @param latex
	 */
	global.latexPermutations = function (tree) {

		/*
		 function permutate (node) {
		 for (var precedence = 0; precedence <= 20; precedence++) {
		 var groups = []
		 for ()
		 }
		 }
		 */

		var permutations = [];
		// permutate(tree);
		return permutations;
	};

}(this)); // this is WorkerGlobalScope

/* jshint +W074 */
/* jshint +W071 */
