/* global describe, it */

const assert = require('assert')
const safe = require('safe-regex')
const {generate} = require('../src/generate')

describe('#generate', function () {
  it('should generate a valid regex', function () {
    var str = 'aaa(?<bb>\\(?cc\\)(?:a+)bb(dd(?<ee>ee))(?<ff>))zzz'
    var {source, groups, named, flags} = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.equal(safe(regex), true) // is a safe regex
    assert.equal(source, 'aaa(\\(?cc\\)(?:a+)bb(dd(ee))([^]+))zzz')
    assert.equal(flags, undefined)
    assert.deepEqual(groups, {bb: 1, 0: 2, ee: 3, ff: 4})
    assert.deepEqual(named, {bb: '\\(?cc\\)(?:a+)bb(dd(ee))([^]+)', ee: 'ee', ff: '[^]+'})
  })

  it('should generate a valid regex using a named pattern', function () {
    var str = 'aaa(?<bb>\\(cc\\)bb(dd(?<ee>ee))(?<ff>)(?&ee))zzz'
    var {source, groups, named, flags} = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.equal(safe(regex), true) // is a safe regex
    assert.equal(source, 'aaa(\\(cc\\)bb(dd(ee))([^]+)(ee))zzz')
    assert.equal(flags, undefined)
    assert.deepEqual(groups, {bb: 1, 0: 2, ee: 3, ff: 4, 1: 5})
    assert.deepEqual(named, {bb: '\\(cc\\)bb(dd(ee))([^]+)(ee)', ee: 'ee', ff: '[^]+'})

    var res = (regex.exec('000aaa(cc)bbddeehahahaeezzz111'))
    var exp = Object.assign(
      ['aaa(cc)bbddeehahahaeezzz',
        '(cc)bbddeehahahaee',
        'ddee',
        'ee',
        'hahaha',
        'ee'
      ], {
        index: 3,
        input: '000aaa(cc)bbddeehahahaeezzz111'
      }
    )
    assert.deepEqual(res, exp)
  })

  it('should generate a valid regex using an unknown named pattern', function () {
    var str = 'aaa(?<bb>\\(cc\\)bb(dd(?<ee>ee))(?<ff>)(?&eee))zzz'
    var {source, groups, named, flags} = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.equal(safe(regex), true) // is a safe regex
    assert.equal(source, 'aaa(\\(cc\\)bb(dd(ee))([^]+))zzz')
    assert.equal(flags, undefined)
    assert.deepEqual(groups, {bb: 1, 0: 2, ee: 3, ff: 4, 1: 5})
    assert.deepEqual(named, {bb: '\\(cc\\)bb(dd(ee))([^]+)()', ee: 'ee', ff: '[^]+'})
  })

  it('should only choose leftmost named group', function () {
    var str = /(:<foo>aaa)(:<foo>bbb)/
    var {source, groups, named, flags} = generate(str)
    var regex = new RegExp(source, flags)
    assert.ok(regex instanceof RegExp)
    assert.equal(source, '(aaa)(bbb)')
    assert.equal(flags, undefined)
    assert.deepEqual(groups, {foo: 1, 0: 2})
    assert.deepEqual(named, {foo: 'aaa'})
  })
})
