const TestBase = require('./base')

const Source = new TestBase('../src/index.js')
Source.test()

if (process.env.RUN_DIST_TESTS === 'true') {
  const Dist = new TestBase('../dist/index.js')
  Dist.test()
}
