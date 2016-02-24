
process.once('exit', () => {
  const istanbul = require('istanbul')
  const collector = new istanbul.Collector()
  const reporter = new istanbul.Reporter()
  /* global __coverage__ */
  collector.add(__coverage__)
  reporter.addAll([ 'text', 'lcov' ])
  reporter.write(collector, true, () => { })
})

/* global describe, it */
describe('test', function () {
  const __coverage__Plugin = require('./lib-cov')

  process.env.BABEL_DISABLE_CACHE = true
  require('babel-register')({
    presets: [ 'es2015', 'react' ],
    plugins: [ __coverage__Plugin ],
    babelrc: false
  })

  it('can run basic fixture', function () {
    require('./fixtures/basic')
  })

  it('can run jsx fixture', function () {
    require('./fixtures/react')
  })
})
