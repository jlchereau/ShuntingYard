# Shunting-Yard

> DISCLAIMER: This project is entitled Shunting-Yard becuase it started there but this is not another implementation of the Shunting-Yard algorithm.

## Objective

Kidoju is a quiz platform with many activities including mathematic expressions.
The math input control packages mathquill which implements LaTeX.
Therefore, how do we validate a correct answer when such an answer is LaTeX?

## Difficulty

We need to compare the actual answer given by a user to a problem with an expected solution, so as to mark the user anwser as correct or incorrect:

|Expected|Actual|
|---|---|
|a^2+b^2=c^2|b^2+a^2=c^2|
|E=mc^2|\left(c^2\right)*m=E|

## Shunting Yard

The Shunting Yard algorithm can be used to convert an infix formula into a postfix (RPN) formula or a binary tree.

The algorithm offers no easy solution to compare ```a*b*c``` and ```c*b*a```.

```a*b*c``` translates into an RPN of ```ab*c*``` or a binary tree of:

```
* --- * --- a
   |     |
   |     -- b
   -- c
```

```c*b*a```translates into an RPN of ```cb*a*``` or a binary tree of:
           
```
* --- * --- c
   |     |
   |     -- b
   -- a
```
 
## Explorations

We are therefore exploring two options: comparing and calculating

### Comparing

The idea is to produce an algorithm where ```a*b*c```, ```(a*b)*c``` and ```(a*(b*c))``` would produce:

```
* --- a
   |
   -- b
   |
   -- c
```

and ```c*b*a```, ```(c*b)*a``` and ```(c*(b*a))``` would produce:

```
* --- c
   |
   -- b
   |
   -- a
```

Then the two trees become very easy to compare while still allowing easy calculations.

### Calculation

The other option consists in providing values for ```a```, ```b``` and ```c``` in order to execute calculations
on the expected and actual formulas deem the actual answer correct if the results match.

## Sources

   - https://en.wikipedia.org/wiki/Operator-precedence_parser
   - https://en.wikipedia.org/wiki/Recursive_descent_parser
   - https://en.wikipedia.org/wiki/LR_parser
   - https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   - http://javascript.crockford.com/tdop/tdop.html
   - http://rhyscitlema.com/algorithms/expression-parsing-algorithm/
   - https://ariya.io/2011/08/math-evaluator-in-javascript-part1
   - http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm