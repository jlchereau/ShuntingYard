/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, mocha: true, expr: true */

;(function (window, undefined) {

	'use strict';

	var expect = window.chai.expect;
	var sinon = window.sinon;

	describe('tree1.test', function () {

		it('Array.equals', function () {
			var ARRAYS = [
				{ a: [1, 2, 3], b: [1, 2, 3] },
				{ a: ['a', 'b', 'c'], b: ['a', 'b', 'c'] }
			];
			for (var i = 0, length = ARRAYS.length; i < length; i++) {
				expect(ARRAYS[i].a.equals(ARRAYS[i].b)).to.be.true;
			}
		});

		it ('Latex Parsing', function () {
			var SAMPLE = [
				{ latex: 'a^2+b^2=c^2', length: 5 },
				{ latex: '\\left(a-b\\right)\\times\\left(a+b\\right)=a^2-b^2', length: 7 },
				{ latex: '\\sin\\left(x\\right)^2+\\cos\\left(x\\right)^2=1', length: 9 },
				{ latex: '2\\cdot\\sum_{n=0}^{\\infty}\\frac{1}{n+1}', length: 6 }
			];

			for (var i = 0, length = SAMPLE.length; i < length; i++) {
				var tree = window.parseLatexTree(SAMPLE[i].latex);
				expect(tree.children.length).to.equal(SAMPLE[i].length);
				var latex = tree.latex();
				expect(latex).to.equal(SAMPLE[i].latex);
			}
		});

	});

}(this));
