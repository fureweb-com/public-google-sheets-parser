const TestBase = require('./base')
const PublicGoogleSheetsParser = require('../src/index.js')
const test = require('tape')

const Source = new TestBase('../src/index.js')
Source.test()

if (process.env.RUN_DIST_TESTS === 'true') {
  const Dist = new TestBase('../dist/index.js')
  Dist.test()
}

if (process.env.RUN_INTEGRATION_TESTS === 'true') {
  test('integration: fetches live public spreadsheet data', async (t) => {
    const parser = new PublicGoogleSheetsParser('10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps')
    const rows = await parser.parse()

    t.ok(Array.isArray(rows), 'parse should return an array')
    t.deepEqual(rows[0], { a: 1, b: 2, c: 3 }, 'first row should match the known public sheet')
    t.end()
  })
}
