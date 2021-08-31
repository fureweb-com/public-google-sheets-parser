const TestBase = require('./base')

const Source = new TestBase('../src/index.js')
Source.test()

const Dist = new TestBase('../dist/index.js')
Dist.test()
