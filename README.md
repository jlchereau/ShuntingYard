# Shunting-Yard

> DISCLAIMER: This project is entitled Shunting-Yard because it started there but this is not another implementation of the Shunting-Yard algorithm.

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

```c*b*a``` translates into an RPN of ```cb*a*``` or a binary tree of:
           
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

The division would be handled as follows so as ```(a*b)/c``` and ```a*b/c``` to produce

```
* --- a
   |
   -- b
   |
   -- 1/c
```

The minus would be handled as follows so as ```a-b+c``` and ```(a-b)+c``` to produce

```
+ --- a
   |
   -- -b
   |
   -- c
```


Then these trees become very easy to compare while still allowing easy calculations.

In other words, the algorithm would only create subnodes for different operators based on precedence and association.

### Calculating

The other option consists in providing values for ```a```, ```b``` and ```c``` in order to execute calculations
on the expected and actual formulas and deem the actual answer correct if the results match.

Note: What should we do with ```=```, and possibly comparison operators like ```>```?
How do we make sure that ```E=E``` is not a valid answer for ```E=mc^2``` if we check for a result of ```true```?

We might prevent that by checking the number of occurences of E, m and c,
but then ```(a+b)*(a-b)``` would not be a valid answer for ```a^2-b^2```, which might be acceptable.

## Sources

   - https://en.wikipedia.org/wiki/Operator-precedence_parser
   - https://en.wikipedia.org/wiki/Recursive_descent_parser
   - https://en.wikipedia.org/wiki/LR_parser
   - https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   - http://javascript.crockford.com/tdop/tdop.html
   - http://rhyscitlema.com/algorithms/expression-parsing-algorithm/
   - https://ariya.io/2011/08/math-evaluator-in-javascript-part1
   - http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm
   - https://github.com/droptable/javascript-shunting-yard
   - https://rosettacode.org/wiki/Parsing/Shunting-yard_algorithm#JavaScript
   - http://lisperator.net/blog/find-all-expressions-that-evaluate-to-some-value/
   - https://gist.github.com/shalvah