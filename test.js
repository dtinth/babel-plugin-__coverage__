
/* global describe, it */
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

  it('does not choke on bemuse codebase', function () {
    Babel.transformFileSync(require.resolve('./fixtures/expression'), BABEL_OPTIONS)
  })

  it('does not affect strictness of function', function () {
    console.log(require('./fixtures/strictFunction').toString())
  })
})
