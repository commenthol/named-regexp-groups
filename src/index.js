/*!
 * @copyright 2017- Commenthol
 * @license
 */
/**
 * @module named-regexp-groups
 */

import {generate, R_NAME_REPLACE} from './generate'

/**
 * Creates a regular expression with named capture groups
 * @class NamedRegExp
 * @note Would have loved to extend class from RegExp but that's not possible.
 */
export default class NamedRegExp {
  /**
   * Creates a regular expression with named capture groups
   *
   * Create a named capture group with `(?<name>.*)` or `(:<name>.*)` when using
   * a RegExp.
   * Named backreferences using `(?&name)` can be used either.
   *
   * For nodejs < v5.0 core-js polyfills are required.
   * Use `npm i -S core-js` in your project and add:
   *
   * ```js
   * // for node < v0.11
   * require('core-js/es6/object')
   * // for node < v5.0
   * require('core-js/es6/string')
   * require('core-js/es6/symbol')
   * ```
   *
   * @param {String|RegExp} pattern - string or regex with named groups
   * @param {String} [flags] - regex flags 'igm' if `regex` is a String
   * @example
   * import NamedRegExp from 'named-regexp-groups'
   * //or
   * const NamedRegExp = require('named-regexp-groups')
   *
   * // as string
   * var r = new NamedRegExp('(?<foo>foo)(?<bar>)(-)(?:wat)(?<na>(?:na)+)(?&na)')
   * // or as regex
   * var r = new NamedRegExp(/(:<foo>foo)(:<bar>)(-)(?:wat)(:<na>(?:na)+)(:&na)/)
   *
   * r.source
   * // => r.source === '(foo)([^]+)(-)(?:wat)((?:na)+)((?:na)+)'
   */
  constructor (pattern, flags) {
    var g = generate(pattern, flags)
    this.regex = new RegExp(g.source, g.flags)
    this.source = this.regex.source
    this.groups = g.groups
  }

  /**
   * Execute a search with `str`
   * @param {String} str
   * @return {Array} matching array with additional property `groups`
   * @example
   * var r = new NamedRegExp('(?<foo>foo)(bar)(?:waah)')
   * r.exec('nanafoobarwaah')
   * // => [ 'foobarwaah', 'foo', 'bar',
   * //      index: 4, input: 'nanafoobarwaah',
   * //      groups: { '0': 'bar', foo: 'foo' } ]
   */
  exec (str) {
    var res = this.regex.exec(str)
    if (res) {
      res.groups = {}
      Object.keys(this.groups).forEach((name) => {
        res.groups[name] = res[this.groups[name]]
      })
    }
    return res
  }

  /**
   * test for `str`
   * @param {String} str
   * @return {Boolean} matching array with additional property `groups`
   * @example
   * var r = new NamedRegExp('(?<foo>foo)(bar)(?:waah)')
   * r.test('nanafoobarwaah')
   * // => true
   */
  test (str) {
    return this.regex.test(str)
  }

  /**
   * outputs regex as String
   */
  toString () {
    return this.regex.toString()
  }

  /**
   * Replace `str` by `replacement` using named capture groups
   *
   * If using a string use `$+{name}` to define the placeholder for the capture group.
   * This follows the Syntax of {@link http://perldoc.perl.org/perlretut.html#Named-backreferences|PCRE Named backreferences}.
   *
   * @name replace
   * @param {String} str
   * @param {String|Function} replacement
   * @return {String} matching array with additional property `groups`
   * @example
   * var r = new NamedRegExp(/(:<year>\d+)-(:<month>\d+)-(:<day>\d+)/)
   *
   * // ---- using strings
   * '2017-01-02'.replace(r, 'day: $+{day}, month: $+{month}, year: $+{year}')
   * // => 'day: 02, month: 01, year: 2017')
   *
   * // ---- using function
   * '2016-11-22'.replace(r, function () { // take care of NOT using an arrow function here!
   *   var args = [].slice.call(arguments)
   *   var g = this.groups
   *   return `day: ${args[g.day]}, month: ${args[g.month]}, year: ${args[g.year]}`
   * })
   * // => 'day: 22, month: 11, year: 2017')
   */
  [Symbol.replace] (str, replacement) {
    var repl = replacement
    /* istanbul ignore next */
    switch (typeof repl) {
      case 'string':
        repl = repl.replace(R_NAME_REPLACE, (m, name) => {
          var idx = this.groups[name]
          if (idx === undefined || idx === null) {
            return ''
          }
          return '$' + this.groups[name]
        })
        break
      case 'function':
        repl = replacement.bind(this)
        break
      default:
        return String(repl)
    }
    return str.replace(this.regex, repl)
  }

  /**
   * Search for a match in `str`
   * @name match
   * @param {String} str
   * @return {Array} matching array with additional property `groups`
   * @example
   * var r = new NamedRegExp('(?<foo>foo)(bar)(?:waah)')
   * 'nanafoobarwaah'.match(r)
   * // => [ 'foobarwaah', 'foo', 'bar',
   * //      index: 4, input: 'nanafoobarwaah',
   * //      groups: { '0': 'bar', foo: 'foo' } ]
   */
  [Symbol.match] (str) {
    return this.exec(str)
  }

  /**
   * split `str`
   * @name split
   * @param {String} str
   * @return {Array} matching array with additional property `groups`
   * @example
   * var r = new NamedRegExp('(?<foo>foo)')
   * 'nanafoobarwaah'.split(r)
   * // => [ 'nana', 'foo', 'barwaah' ]
   */
  [Symbol.split] (str) {
    return str.split(this.regex)
  }

  /**
   * search `str`
   * @name search
   * @param {String} str
   * @return {Number} position of index or -1
   * @example
   * var r = new NamedRegExp('(?<foo>foo)')
   * 'nanafoobarwaah'.search(r)
   * // => 4
   */
  [Symbol.search] (str) {
    return str.search(this.regex)
  }
}
