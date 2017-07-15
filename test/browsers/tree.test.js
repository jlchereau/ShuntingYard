/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, mocha: true, expr: true */

;(function (window, undefined) {

  'use strict';

  var expect = window.chai.expect;
  var sinon = window.sinon;

  describe('tree.test', function () {

    it ('Latex Parsing', function () {
      var SAMPLE = [
        { latex: 'a*\\left(b*c\\right)*d', length: 5 },
        { latex: 'a*b+c*d', length: 5 },
        { latex: 'a*\\left(b+c\\right)*d', length: 5 },
        { latex: 'a^2+b^2=c^2', length: 5 },
        { latex: '\\left(a+b*c\\right)*e', length: 5 },
        { latex: '\\left(a-b\\right)*\\left(a+b\\right)=a^2-b^2', length: 7 },
        { latex: '\\left(a-b\\right)\\times\\left(a+b\\right)=a^2-b^2', length: 7 },
        { latex: '\\sin\\left(x\\right)^2+\\cos\\left(x\\right)^2=1', length: 9 },
        { latex: '2\\cdot\\sum_{n=0}^{\\infty}\\frac{1}{n+1}', length: 6 }
      ];

      var tree = window.parse(SAMPLE[0].latex);
      debugger;
      /*
       for (var i = 0, length = SAMPLE.length; i < length; i++) {
       var tree = window.parseLatexTree(SAMPLE[i].latex);
       expect(tree.children.length).to.equal(SAMPLE[i].length);
       var latex = tree.latex();
       expect(latex).to.equal(SAMPLE[i].latex);
       }
       */
    });

  });

}(this));
