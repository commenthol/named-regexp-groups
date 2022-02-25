/* global describe, it, before */

const major = process.versions.node.split('.')[0]
if (major < 5) {
  // for node <= 0.10
  require('core-js/es6/object')
  // for node <= 4.0
  require('core-js/es6/string')
  require('core-js/es6/symbol')
}

const assert = require('assert')
const NamedRegExp = process.env.NYC_INSTRUMENTER
  ? require('../src').default // for coverage tests
  : require('..')

describe('#NamedRegExp', function () {
  it('should create a new instance', function () {
    const r = new NamedRegExp()
    assert.ok(r instanceof Object)
  })

  it('should create a new instance using a string', function () {
    const r = new NamedRegExp('^string')
    assert.strictEqual(r.source, '^string')
  })

  it('should create a new instance using a regex', function () {
    const r = new NamedRegExp(/^regex$/)
    assert.strictEqual(r.toString(), '/^regex$/')
  })

  describe('exec', function () {
    it('should exec string foobar', function () {
      const r = new NamedRegExp('(foo)')
      const res = r.exec('foo')
      assert.strictEqual(res[1], 'foo')
    })

    describe('should not consider clusters', function () {
      let r
      before(() => {
        r = new NamedRegExp('(?:foo)')
      })
      it('should construct', function () {
        assert.strictEqual(r.source, '(?:foo)')
        assert.deepStrictEqual(r.groups, {})
      })
      it('should exec', function () {
        // var res = r.exec('foo')
        // console.log(res, r)
        assert.deepStrictEqual(r.exec('foo').groups, {})
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })

    describe('should identify group', function () {
      let r
      before(() => { r = new NamedRegExp('(foo)') })
      it('should construct', function () {
        assert.strictEqual(r.source, '(foo)')
        assert.deepStrictEqual(r.groups, { 0: 1 })
      })
      it('exec foo', function () {
        const res = r.exec('foo')
        assert.strictEqual(JSON.stringify(res), '["foo","foo"]')
        assert.deepStrictEqual(res.groups, { 0: 'foo' })
      })
      it('exec foobar', function () {
        const res = r.exec('foobar')
        assert.strictEqual(JSON.stringify(res), '["foo","foo"]')
        assert.deepStrictEqual(res.groups, { 0: 'foo' })
      })
      it('exec bar', function () {
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })

    describe('should identify named group', function () {
      let r
      before(() => {
        r = new NamedRegExp('(?<foo>foo)')
      })
      it('should construct', function () {
        assert.strictEqual(r.source, '(foo)')
        assert.deepStrictEqual(r.groups, { foo: 1 })
      })
      it('exec foo', function () {
        // console.log(r.exec('foo'))
        // => [ 'foo', 'foo', index: 0, input: 'foo', groups: { foo: 'foo' } ]
        assert.strictEqual(r.exec('foo')[1], 'foo')
        assert.deepStrictEqual(r.exec('foo').groups, { foo: 'foo' })
      })
      it('exec bar', function () {
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })

    describe('should identify both named and unnamed group', function () {
      let r
      before(() => {
        r = new NamedRegExp('(foo)(?<bar>bar)')
      })
      it('should construct', function () {
        assert.strictEqual(r.source, '(foo)(bar)')
        assert.deepStrictEqual(r.groups, { 0: 1, bar: 2 })
      })
      it('exec foobar', function () {
        const res = r.exec('foobar')
        // => [ 'foo', 'foo', index: 0, input: 'foo', groups: { foo: 'foo' } ]
        assert.strictEqual(res[1], 'foo')
        assert.deepStrictEqual(res.groups, { 0: 'foo', bar: 'bar' })
      })
      it('exec foofoobar', function () {
        const res = r.exec('foofoobar')
        assert.strictEqual(res[1], 'foo')
        assert.strictEqual(res.index, 3)
        assert.deepStrictEqual(res.groups, { 0: 'foo', bar: 'bar' })
      })
      it('exec bar', function () {
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })

    describe('should identify both named and unnamed group mixed with cluster', function () {
      let r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<bar>bar)(bar)?')
      })
      it('should construct', function () {
        assert.strictEqual(r.source, '((?:foo)+)(bar)(bar)?')
        assert.deepStrictEqual(r.groups, { 0: 3, foo: 1, bar: 2 })
      })
      it('exec foofoobarbar', function () {
        const res = r.exec('foofoobarbar')
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], 'bar')
        assert.deepStrictEqual(res.groups, { 0: 'bar', foo: 'foofoo', bar: 'bar' })
      })
      it('exec foofoobar', function () {
        const res = r.exec('foofoobar')
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], undefined)
        assert.deepStrictEqual(res.groups, { 0: undefined, foo: 'foofoo', bar: 'bar' })
      })
      it('exec bar', function () {
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })

    describe('should only use leftmost named group', function () {
      let r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<foo>bar)(bar)?')
      })
      it('should construct', function () {
        assert.strictEqual(r.source, '((?:foo)+)(bar)(bar)?')
        assert.deepStrictEqual(r.groups, { foo: 1, 0: 2, 1: 3 })
      })
      it('exec foofoobarbar', function () {
        const res = r.exec('foofoobarbar')
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], 'bar')
        assert.deepStrictEqual(res.groups, { foo: 'foofoo', 0: 'bar', 1: 'bar' })
      })
      it('exec foofoobar', function () {
        const res = r.exec('foofoobar')
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], undefined)
        assert.deepStrictEqual(res.groups, { foo: 'foofoo', 0: 'bar', 1: undefined })
      })
      it('exec bar', function () {
        assert.deepStrictEqual(r.exec('bar'), null)
      })
    })
  })

  describe('test', function () {
    it('should test foo', function () {
      const r = new NamedRegExp('(foo)')
      assert.strictEqual(r.test('foobar'), true)
      assert.strictEqual(r.test('bar'), false)
    })

    it('should test for (?<foo>foo)', function () {
      const r = new NamedRegExp('(?<foo>foo)')
      assert.strictEqual(r.test('foobar'), true)
      assert.strictEqual(r.test('bar'), false)
    })

    it('should test for (?<foo>foo)(?<bar>bar)', function () {
      const r = new NamedRegExp('(?<foo>foo)(?<bar>bar)')
      assert.strictEqual(r.test('foobar'), true)
      assert.strictEqual(r.test('bar'), false)
    })

    it('should test for (?<foo>foo|bar)', function () {
      const r = new NamedRegExp(/(:<foo>foo|bar)/)
      assert.strictEqual(r.test('foobar'), true)
      assert.strictEqual(r.test('bar'), true)
    })
  })

  describe('replace', function () {
    it('should replace string foobar', function () {
      const r = new NamedRegExp('(foo)')
      const res = 'foo'.replace(r, 'bar')
      assert.strictEqual(res, 'bar')
    })

    it('should replace string foobar', function () {
      const r = new NamedRegExp('(?<foo>(?:foo){3})')
      const res = 'foofoofoofoo'.replace(r, 'bar')
      assert.strictEqual(res, 'barfoo')
    })

    it('should replace string 2017-01-02 with string replacement', function () {
      const r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      const res = '2017-01-02'.replace(r, 'day: $+{d}, month: $+{m}, year: $+{y}')
      assert.strictEqual(res, 'day: 02, month: 01, year: 2017')
    })

    it('should replace string 2017-01-02 with function replacement', function () {
      const r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      const res = '2016-11-22'.replace(r, function () {
        const args = [].slice.call(arguments)
        const g = this.groups
        return `day: ${args[g.d]}, month: ${args[g.m]}, year: ${args[g.y]}`
      })
      assert.strictEqual(res, 'day: 22, month: 11, year: 2016')
    })

    it('should replace string with undefined capture group name', function () {
      const r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      const res = 'date 2017-01-02'.replace(r, '$+{date} day:$+{d} month:$+{m} year:$+{y}')
      assert.strictEqual(res, 'date  day:02 month:01 year:2017')
    })

    it('should replace string with object', function () {
      const r = new NamedRegExp(/regex/)
      const res = 'string'.replace(r, {})
      assert.strictEqual(res, '[object Object]')
    })
  })

  describe('match', function () {
    it('should match string foobar', function () {
      const r = new NamedRegExp('(foo)')
      const res = 'foo'.match(r)
      assert.strictEqual(res[1], 'foo')
    })

    describe('should identify both named and unnamed group mixed with cluser', function () {
      let r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<bar>bar)(bar)?')
      })
      it('exec foofoobarbar', function () {
        const res = 'foofoobarbar'.match(r)
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], 'bar')
        assert.deepStrictEqual(res.groups, { 0: 'bar', foo: 'foofoo', bar: 'bar' })
      })
      it('exec foofoobar', function () {
        const res = 'foofoobar'.match(r)
        assert.strictEqual(res[1], 'foofoo')
        assert.strictEqual(res[2], 'bar')
        assert.strictEqual(res[3], undefined)
        assert.deepStrictEqual(res.groups, { 0: undefined, foo: 'foofoo', bar: 'bar' })
      })
      it('exec bar', function () {
        assert.deepStrictEqual('bar'.match(r), null)
      })
    })
  })

  describe('split', function () {
    it('should split a string', function () {
      const r = new NamedRegExp(/(:<foo>foo)+/)
      assert.deepStrictEqual('afoofoofooz'.split(r), ['a', 'foo', 'z'])
    })
  })

  describe('search', function () {
    it('should search position within a string', function () {
      const r = new NamedRegExp(/(:<foo>foo)+/)
      assert.strictEqual('afoofoofooz'.search(r), 1)
      assert.strictEqual('az'.search(r), -1)
    })
  })
})
