const test = require('tape')

const PublicGoogleSheetsParser = require('../src/index.js')
const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
const parser = new PublicGoogleSheetsParser(spreadsheetId)

test('getSpreadsheetDataUsingFetch method should returns expected string', async (t) => {
  t.plan(1)

  const result = await parser.getSpreadsheetDataUsingFetch()
  const expected = '/*O_o*/\ngoogle.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"779687672","table":{"cols":[{"id":"A","label":"a","type":"number","pattern":"General"},{"id":"B","label":"b","type":"number","pattern":"General"},{"id":"C","label":"c","type":"number","pattern":"General"}],"rows":[{"c":[{"v":1.0,"f":"1"},{"v":2.0,"f":"2"},{"v":3.0,"f":"3"}]},{"c":[{"v":4.0,"f":"4"},{"v":5.0,"f":"5"},{"v":6.0,"f":"6"}]},{"c":[{"v":7.0,"f":"7"},{"v":8.0,"f":"8"},{"v":9.0,"f":"9"}]}],"parsedNumHeaders":1}});'
  t.equal(result, expected)

  t.end()
})

test('filterUselessRows method should return expected array', (t) => {
  t.plan(1)

  const givenRows = [{ v: null }, { v: undefined }, { v: 0 }, { v: false }, { d: 2 }, null]

  const result = parser.filterUselessRows(givenRows)
  const expected = [{ v: 0 }, { v: false }]
  t.deepEqual(result, expected)

  t.end()
})

test('applyHeaderIntoRows method should return expected array', (t) => {
  t.plan(1)

  const givenHeader = ['a', 'b', 'c']
  const givenRows = [
    { c: [{ v: 1, f: '1' }, { v: 2, f: '2' }, { v: 3, f: '3' }] },
    { c: [{ v: 4, f: '4' }, { v: 5, f: '5' }, { v: 6, f: '6' }] },
    { c: [{ v: 7, f: '7' }, { v: 8, f: '8' }, { v: 9, f: '9' }] }
  ]

  const result = parser.applyHeaderIntoRows(givenHeader, givenRows)
  const expected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
  t.deepEqual(result, expected)

  t.end()
})

test('parse method should return array even spreadsheetId is invalid', async (t) => {
  t.plan(2)

  const invalidSpreadsheetId = 'id_that_does_not_exist_anywhere'
  const shouldEmptyArray = await parser.parse(invalidSpreadsheetId)
  t.deepEqual(shouldEmptyArray, [])

  const result = await parser.parse(spreadsheetId)
  const expected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
  t.deepEqual(result, expected)

  t.end()
})
