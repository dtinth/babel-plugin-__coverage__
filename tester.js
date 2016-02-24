
// THIS IS A WIP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const code = require('fs').readFileSync(process.argv[2], 'utf-8')

const out = require('babel-core').transform(code, {
  plugins: [ require('./src') ],
  filename: require('fs').realpathSync(process.argv[2])
})

eval(out.code) // eslint-disable-line
require('fs').writeFileSync('/tmp/coverage.json', JSON.stringify(global.__coverage__))
