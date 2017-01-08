# named-regexp-groups

> Regular expressions with named capture groups and named back-references

[![NPM version](https://badge.fury.io/js/named-regexp-groups.svg)](https://www.npmjs.com/package/named-regexp-groups)

Create a named capture group with `(?<name>.*)` or `(:<name>.*)` when using
a RegExp. The methods of RegExp are supported excluding compile and toString.
Use named back-references using `(?&name)` to include already defined named pattern.

* [Installation](#installation)
* [Usage](#usage)
  * [exec](#exec)
  * [test](#test)
  * [String.replace](#string-replace)
  * [String.match](#string-match)
  * [String.split](#string-split)
* [License](#license)

## Installation

    npm install --save named-regexp-groups

## Usage

```js
import NamedRegExp from 'named-regexp-groups'
//or
const NamedRegExp = require('named-regexp-groups')

// as string
var r = new NamedRegExp('(?<foo>foo)(?<bar>)(-)(?:wat)(?<na>(?:na)+)(?&na)')
// or as regex
var r = new NamedRegExp(/(:<foo>foo)(:<bar>)(-)(?:wat)(:<na>(?:na)+)(:&na)/)

r.source
// => r.source === '(foo)([^]+)(-)(?:wat)((?:na)+)((?:na)+)'
```

For nodejs <= 4.0 `core-js` polyfills are required.
Use `npm i -S core-js` in your project and add:

```js
// for node <= 0.10
require('core-js/es6/object')
// for node <= 4.0
require('core-js/es6/string')
require('core-js/es6/symbol')
```

### exec

```js
var r = new NamedRegExp('(?<foo>foo)(?<bar>)(-)(?:wat)(?<na>(?:na)+)(?&na)')
r.exec('nanafoobar-watnana')
// => [ 'foobar-watnana', 'foo', 'bar', '-', 'na', 'na',
//  index: 4,
//  input: 'nanafoobar-watnana',
//  groups: { foo: 'foo', bar: 'bar', '0': '-', na: 'na', '1': 'na' } ]
```

### test

```js
r = new NamedRegExp('(?<foo>foo)(bar)(?:waah)')
r.source
// => '(foo)(bar)(?:waah)'
r.test('nanafoobarwaah')
// => true
```

### String.replace

If using a string as replacement use `$+{name}` to define the placeholder for the capture group.  
This follows the Syntax of [PCRE Named backreferences](http://perldoc.perl.org/perlretut.html#Named-backreferences).

```js
var r = new NamedRegExp(/(:<year>\d+)-(:<month>\d+)-(:<day>\d+)/)

// ---- using strings
'2017-01-02'.replace(r, 'day: $+{day}, month: $+{month}, year: $+{year}')
// => 'day: 02, month: 01, year: 2017')

// ---- using function
'2016-11-22'.replace(r, function () { // take care of NOT using an arrow function here!
  var args = [].slice.call(arguments)
  var g = this.groups
  return `day: ${args[g.day]}, month: ${args[g.month]}, year: ${args[g.year]}`
})
// => 'day: 22, month: 11, year: 2017')
```

### String.match

```js
r = new NamedRegExp('(?<foo>foo)(bar)(?:waah)')
'nanafoobarwaah'.match(r)
// => [ 'foobarwaah', 'foo', 'bar',
//      index: 4, input: 'nanafoobarwaah',
//      groups: { '0': 'bar', foo: 'foo' } ]
```

### String.split

```js
r = new NamedRegExp('(?<foo>foo)')
'nanafoobarwaah'.split(r)
// => [ 'nana', 'foo', 'barwaah' ]
```

## License

Software is released under [MIT][license].

[license]: ./LICENSE
