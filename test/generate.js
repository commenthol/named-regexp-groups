/* global describe, it */

const assert = require('assert')
const safe = require('safe-regex')
const { generate } = require('../src/generate')

describe('#generate', function () {
  it('should generate a valid regex', function () {
    var str = 'aaa(?<bb>\\(?cc\\)(?:a+)bb(dd(?<ee>ee))(?<ff>))zzz'
    var { source, groups, named, flags } = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.strictEqual(safe(regex), true) // is a safe regex
    assert.strictEqual(source, 'aaa(\\(?cc\\)(?:a+)bb(dd(ee))([^]+))zzz')
    assert.strictEqual(flags, undefined)
    assert.deepStrictEqual(groups, { bb: 1, 0: 2, ee: 3, ff: 4 })
    assert.deepStrictEqual(named, { bb: '\\(?cc\\)(?:a+)bb(dd(ee))([^]+)', ee: 'ee', ff: '[^]+' })
  })

  it('should generate a valid regex using a named pattern', function () {
    var str = 'aaa(?<bb>\\(cc\\)bb(dd(?<ee>ee))(?<ff>)(?&ee))zzz'
    var { source, groups, named, flags } = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.strictEqual(safe(regex), true) // is a safe regex
    assert.strictEqual(source, 'aaa(\\(cc\\)bb(dd(ee))([^]+)(ee))zzz')
    assert.strictEqual(flags, undefined)
    assert.deepStrictEqual(groups, { bb: 1, 0: 2, ee: 3, ff: 4, 1: 5 })
    assert.deepStrictEqual(named, { bb: '\\(cc\\)bb(dd(ee))([^]+)(ee)', ee: 'ee', ff: '[^]+' })

    var res = (regex.exec('000aaa(cc)bbddeehahahaeezzz111'))
    var exp = Object.assign(
      ['aaa(cc)bbddeehahahaeezzz',
        '(cc)bbddeehahahaee',
        'ddee',
        'ee',
        'hahaha',
        'ee'
      ], {
        groups: undefined,
        index: 3,
        input: '000aaa(cc)bbddeehahahaeezzz111'
      }
    )
    assert.deepStrictEqual(res, exp)
  })

  it('should generate a valid regex using an unknown named pattern', function () {
    var str = 'aaa(?<bb>\\(cc\\)bb(dd(?<ee>ee))(?<ff>)(?&eee))zzz'
    var { source, groups, named, flags } = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.strictEqual(safe(regex), true) // is a safe regex
    assert.strictEqual(source, 'aaa(\\(cc\\)bb(dd(ee))([^]+))zzz')
    assert.strictEqual(flags, undefined)
    assert.deepStrictEqual(groups, { bb: 1, 0: 2, ee: 3, ff: 4, 1: 5 })
    assert.deepStrictEqual(named, { bb: '\\(cc\\)bb(dd(ee))([^]+)()', ee: 'ee', ff: '[^]+' })
  })

  it('should only choose leftmost named group', function () {
    var str = /(:<foo>aaa)(:<foo>bbb)/i
    var { source, groups, named, flags } = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.strictEqual(source, '(aaa)(bbb)')
    assert.strictEqual(flags, 'i')
    assert.deepStrictEqual(groups, { foo: 1, 0: 2 })
    assert.deepStrictEqual(named, { foo: 'aaa' })
  })

  it('should choose complete inner group', function () {
    var str = /(:<foo>[/](?:\d+))/
    var { source, groups, named, flags } = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.strictEqual(source, /([/](?:\d+))/.source)
    assert.strictEqual(flags, '')
    assert.deepStrictEqual(groups, { foo: 1 })
    assert.deepStrictEqual(named, { foo: /[/](?:\d+)/.source })
  })
})
