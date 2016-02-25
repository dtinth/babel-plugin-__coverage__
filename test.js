
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

  it('handles native defualts', function () {
    const step1 = Babel.transformFileSync(require.resolve('./fixtures/default'), {
      babelrc: false, plugins: [ __coverage__Plugin ]
    })
    const step2 = Babel.transform(step1.code, {
      babelrc: false, presets: [ 'es2015' ]
    })
    eval(step2.code)
  })

  it('does not choke on bemuse codebase', function () {
    Babel.transformFileSync(require.resolve('./fixtures/expression'), BABEL_OPTIONS)
  })

  it('does not affect strictness of function', function () {
    console.log(require('./fixtures/strictFunction').toString())
  })
})
