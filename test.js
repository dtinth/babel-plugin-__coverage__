'use strict'

/* global describe, it */
/* eslint no-eval: 0 */
const assert = require('assert')

describe('test', function () {
  const __coverage__Plugin = require('./lib-cov')
  const BABEL_OPTIONS = {
    presets: [ 'es2015', 'react' ],
    plugins: [ __coverage__Plugin ],
    babelrc: false
  }
  const Babel = require('babel-core')

  process.env.BABEL_DISABLE_CACHE = true
  require('babel-register')(BABEL_OPTIONS)

  it('can run basic fixture', function () {
    require('./fixtures/basic')
  })

  it('can run jsx fixture', function () {
    require('./fixtures/react')
  })

  it('can haz arrow funktions', function () {
    require('./fixtures/arrows')
  })

  it('can haz defualt paramitrz', function () {
    const lib = require('./fixtures/default')
    lib.add(10, 20)
    lib.multiply(10, 20)
  })

  it('can DESTRUCTUR', function () {
    require('./fixtures/destruct')
  })

  describe('statement coverage', function () {
    describe('variable declartions', function () {
      testStatementCoverage('const x = 0', 1)
      testStatementCoverage('let x = 0', 1)
      testStatementCoverage('var x = 1, y = 2', 2)
      testStatementCoverage('var x', 0)
    })

    describe('import declarations', function () {
      testStatementCoverage('import lodash from \'lodash\'', 0)
    })

    describe('export declarations', function () {
      testStatementCoverage('export { keys } from \'lodash\'', 0)
      testStatementCoverage('export const x = 10 * 10', 1)
      testStatementCoverage('export default 10 * 10', 1)
    })

    describe('arrow functions', function () {
      testStatementCoverage('const x = a => b => c => a + b + c', 4)
      testStatementCoverage('const x = a => a + a', 2)
      testStatementCoverage('const x = (a = 99) => a + a', 3)
    })

    describe('destructuring', function () {
      testStatementCoverage('const [ a, b, c ] = [ 1, 2, 3 ]', 1)
      testStatementCoverage('const [ a = 1, b = 2, c = 3 ] = [ ]', 4)
    })

    function testStatementCoverage (code, expected) {
      it('`' + code + '` -> ' + expected, function () {
        const coverageData = extractCoverageData(code).s
        assert.equal(Object.keys(coverageData).length, expected)
      })
    }
  })

  it('does not choke on bemuse codebase', function () {
    Babel.transformFileSync(require.resolve('./fixtures/expression'), BABEL_OPTIONS)
  })

  it('does not affect strictness of function', function () {
    console.log(require('./fixtures/strictFunction').toString())
  })

  // ---------------------------------------------------------------------------
  // Helper functions.
  // ---------------------------------------------------------------------------

  // Very crude hack to parse coverage data from the source map!!
  function extractCoverageData (code) {
    const instrumentedCode = instrument(code)
    {
      const match = instrumentedCode.match(/'(\{"path[^']+)/)
      if (match) return JSON.parse(match[1])
    }
    {
      const match = instrumentedCode.match(/"(\{\\"path(?:\\.|[^"])+)"/)
      if (match) return JSON.parse(JSON.parse(match[0]))
    }
  }

  function instrument (code) {
    return Babel.transform(code, {
      babelrc: false,
      plugins: [ __coverage__Plugin ]
    }).code
  }
})
