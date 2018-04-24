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
    var r = new NamedRegExp()
    assert.ok(r instanceof Object)
  })

  it('should create a new instance using a string', function () {
    var r = new NamedRegExp('^string')
    assert.equal(r.source, '^string')
  })

  it('should create a new instance using a regex', function () {
    var r = new NamedRegExp(/^regex$/)
    assert.equal(r.toString(), '/^regex$/')
  })

  describe('exec', function () {
    it('should exec string foobar', function () {
      var r = new NamedRegExp('(foo)')
      var res = r.exec('foo')
      assert.equal(res[1], 'foo')
    })

    describe('should not consider clusters', function () {
      var r
      before(() => {
        r = new NamedRegExp('(?:foo)')
      })
      it('should construct', function () {
        assert.equal(r.source, '(?:foo)')
        assert.deepEqual(r.groups, {})
      })
      it('should exec', function () {
        // var res = r.exec('foo')
        // console.log(res, r)
        assert.deepEqual(r.exec('foo').groups, {})
        assert.deepEqual(r.exec('bar'), null)
      })
    })

    describe('should identify group', function () {
      var r
      before(() => { r = new NamedRegExp('(foo)') })
      it('should construct', function () {
        assert.equal(r.source, '(foo)')
        assert.deepEqual(r.groups, {'0': 1})
      })
      it('exec foo', function () {
        var res = r.exec('foo')
        assert.equal(JSON.stringify(res), '["foo","foo"]')
        assert.deepEqual(res.groups, {0: 'foo'})
      })
      it('exec foobar', function () {
        var res = r.exec('foobar')
        assert.equal(JSON.stringify(res), '["foo","foo"]')
        assert.deepEqual(res.groups, {0: 'foo'})
      })
      it('exec bar', function () {
        assert.deepEqual(r.exec('bar'), null)
      })
    })

    describe('should identify named group', function () {
      var r
      before(() => {
        r = new NamedRegExp('(?<foo>foo)')
      })
      it('should construct', function () {
        assert.equal(r.source, '(foo)')
        assert.deepEqual(r.groups, {foo: 1})
      })
      it('exec foo', function () {
        // console.log(r.exec('foo'))
        // => [ 'foo', 'foo', index: 0, input: 'foo', groups: { foo: 'foo' } ]
        assert.equal(r.exec('foo')[1], 'foo')
        assert.deepEqual(r.exec('foo').groups, {foo: 'foo'})
      })
      it('exec bar', function () {
        assert.deepEqual(r.exec('bar'), null)
      })
    })

    describe('should identify both named and unnamed group', function () {
      var r
      before(() => {
        r = new NamedRegExp('(foo)(?<bar>bar)')
      })
      it('should construct', function () {
        assert.equal(r.source, '(foo)(bar)')
        assert.deepEqual(r.groups, {'0': 1, bar: 2})
      })
      it('exec foobar', function () {
        var res = r.exec('foobar')
        // => [ 'foo', 'foo', index: 0, input: 'foo', groups: { foo: 'foo' } ]
        assert.equal(res[1], 'foo')
        assert.deepEqual(res.groups, {0: 'foo', bar: 'bar'})
      })
      it('exec foofoobar', function () {
        var res = r.exec('foofoobar')
        assert.equal(res[1], 'foo')
        assert.equal(res.index, 3)
        assert.deepEqual(res.groups, {0: 'foo', bar: 'bar'})
      })
      it('exec bar', function () {
        assert.deepEqual(r.exec('bar'), null)
      })
    })

    describe('should identify both named and unnamed group mixed with cluster', function () {
      var r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<bar>bar)(bar)?')
      })
      it('should construct', function () {
        assert.equal(r.source, '((?:foo)+)(bar)(bar)?')
        assert.deepEqual(r.groups, { '0': 3, foo: 1, bar: 2 })
      })
      it('exec foofoobarbar', function () {
        var res = r.exec('foofoobarbar')
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], 'bar')
        assert.deepEqual(res.groups, { '0': 'bar', foo: 'foofoo', bar: 'bar' })
      })
      it('exec foofoobar', function () {
        var res = r.exec('foofoobar')
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], undefined)
        assert.deepEqual(res.groups, {'0': undefined, foo: 'foofoo', bar: 'bar'})
      })
      it('exec bar', function () {
        assert.deepEqual(r.exec('bar'), null)
      })
    })

    describe('should only use leftmost named group', function () {
      var r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<foo>bar)(bar)?')
      })
      it('should construct', function () {
        assert.equal(r.source, '((?:foo)+)(bar)(bar)?')
        assert.deepEqual(r.groups, { foo: 1, '0': 2, '1': 3 })
      })
      it('exec foofoobarbar', function () {
        var res = r.exec('foofoobarbar')
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], 'bar')
        assert.deepEqual(res.groups, { foo: 'foofoo', 0: 'bar', 1: 'bar' })
      })
      it('exec foofoobar', function () {
        var res = r.exec('foofoobar')
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], undefined)
        assert.deepEqual(res.groups, { foo: 'foofoo', 0: 'bar', 1: undefined })
      })
      it('exec bar', function () {
        assert.deepEqual(r.exec('bar'), null)
      })
    })
  })

  describe('test', function () {
    it('should test foo', function () {
      var r = new NamedRegExp('(foo)')
      assert.equal(r.test('foobar'), true)
      assert.equal(r.test('bar'), false)
    })

    it('should test for (?<foo>foo)', function () {
      var r = new NamedRegExp('(?<foo>foo)')
      assert.equal(r.test('foobar'), true)
      assert.equal(r.test('bar'), false)
    })

    it('should test for (?<foo>foo)(?<bar>bar)', function () {
      var r = new NamedRegExp('(?<foo>foo)(?<bar>bar)')
      assert.equal(r.test('foobar'), true)
      assert.equal(r.test('bar'), false)
    })

    it('should test for (?<foo>foo|bar)', function () {
      var r = new NamedRegExp(/(:<foo>foo|bar)/)
      assert.equal(r.test('foobar'), true)
      assert.equal(r.test('bar'), true)
    })
  })

  describe('replace', function () {
    it('should replace string foobar', function () {
      var r = new NamedRegExp('(foo)')
      var res = 'foo'.replace(r, 'bar')
      assert.equal(res, 'bar')
    })

    it('should replace string foobar', function () {
      var r = new NamedRegExp('(?<foo>(?:foo){3})')
      var res = 'foofoofoofoo'.replace(r, 'bar')
      assert.equal(res, 'barfoo')
    })

    it('should replace string 2017-01-02 with string replacement', function () {
      var r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      var res = '2017-01-02'.replace(r, 'day: $+{d}, month: $+{m}, year: $+{y}')
      assert.equal(res, 'day: 02, month: 01, year: 2017')
    })

    it('should replace string 2017-01-02 with function replacement', function () {
      var r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      var res = '2016-11-22'.replace(r, function () {
        var args = [].slice.call(arguments)
        var g = this.groups
        return `day: ${args[g.d]}, month: ${args[g.m]}, year: ${args[g.y]}`
      })
      assert.equal(res, 'day: 22, month: 11, year: 2016')
    })

    it('should replace string with undefined capture group name', function () {
      var r = new NamedRegExp(/(:<y>\d+)-(:<m>\d+)-(:<d>\d+)/)
      var res = 'date 2017-01-02'.replace(r, '$+{date} day:$+{d} month:$+{m} year:$+{y}')
      assert.equal(res, 'date  day:02 month:01 year:2017')
    })

    it('should replace string with object', function () {
      var r = new NamedRegExp(/regex/)
      var res = 'string'.replace(r, {})
      assert.equal(res, '[object Object]')
    })
  })

  describe('match', function () {
    it('should match string foobar', function () {
      var r = new NamedRegExp('(foo)')
      var res = 'foo'.match(r)
      assert.equal(res[1], 'foo')
    })

    describe('should identify both named and unnamed group mixed with cluser', function () {
      var r
      before(() => {
        r = new NamedRegExp('(:<foo>(?:foo)+)(?<bar>bar)(bar)?')
      })
      it('exec foofoobarbar', function () {
        var res = 'foofoobarbar'.match(r)
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], 'bar')
        assert.deepEqual(res.groups, { '0': 'bar', foo: 'foofoo', bar: 'bar' })
      })
      it('exec foofoobar', function () {
        var res = 'foofoobar'.match(r)
        assert.equal(res[1], 'foofoo')
        assert.equal(res[2], 'bar')
        assert.equal(res[3], undefined)
        assert.deepEqual(res.groups, {'0': undefined, foo: 'foofoo', bar: 'bar'})
      })
      it('exec bar', function () {
        assert.deepEqual('bar'.match(r), null)
      })
    })
  })

  describe('split', function () {
    it('should split a string', function () {
      var r = new NamedRegExp(/(:<foo>foo)+/)
      assert.deepEqual('afoofoofooz'.split(r), ['a', 'foo', 'z'])
    })
  })

  describe('search', function () {
    it('should search position within a string', function () {
      var r = new NamedRegExp(/(:<foo>foo)+/)
      assert.equal('afoofoofooz'.search(r), 1)
      assert.equal('az'.search(r), -1)
    })
  })
})
