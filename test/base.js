const test = require('tape')

const wrapGvizResponse = (table) => `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', sig: 'mocked', table })});`

const SHEET_FIXTURES = {
  sheet1: wrapGvizResponse({
    cols: [{ label: 'a' }, { label: 'b' }, { label: 'c' }],
    rows: [
      { c: [{ v: 1, f: '1' }, { v: 2, f: '2' }, { v: 3, f: '3' }] },
      { c: [{ v: 4, f: '4' }, { v: 5, f: '5' }, { v: 6, f: '6' }] },
      { c: [{ v: 7, f: '7' }, { v: 8, f: '8' }, { v: 9, f: '9' }] }
    ]
  }),
  sheet2: wrapGvizResponse({
    cols: [{ label: 'a' }, { label: 'b' }, { label: 'c' }],
    rows: [
      { c: [{ v: 10, f: '10' }, { v: 20, f: '20' }, { v: 30, f: '30' }] },
      { c: [{ v: 40, f: '40' }, { v: 50, f: '50' }, { v: 60, f: '60' }] },
      { c: [{ v: 70, f: '70' }, { v: 80, f: '80' }, { v: 90, f: '90' }] }
    ]
  }),
  sheet3: wrapGvizResponse({
    cols: [{ label: 'a' }, { label: 'b' }],
    rows: [
      { c: [{ v: 1, f: '1' }, { v: 'Date(2024,0,1)', f: '2024-01-01' }] },
      { c: [{ v: 2, f: '2' }, { v: 'Date(2024,11,31)', f: '2024-12-31' }] },
      { c: [{ v: 3, f: '3' }, { v: 'Date(2025,0,1)', f: '2025-01-01' }] },
      { c: [{ v: 4, f: '4' }, { v: 'Date(2025,11,31)', f: '2025-12-31' }] },
      { c: [{ v: 5, f: '5' }, { v: 'Date(2026,0,1)', f: '2026-01-01' }] }
    ]
  }),
  noLabels: wrapGvizResponse({
    cols: [{ label: '' }, { label: '' }, { label: '' }],
    rows: [
      { c: [{ v: 'field1' }, { v: 'field2' }, { v: 'field3' }] },
      { c: [{ v: 'a1' }, { v: 'a2' }, { v: 'a3' }] },
      { c: [{ v: 'b1' }, { v: 'b2' }, { v: 'b3' }] }
    ]
  }),
  withEmptyCells: wrapGvizResponse({
    cols: [{ label: 'a' }, { label: 'b' }, { label: 'c' }],
    rows: [
      { c: [{ v: 1, f: '1' }, { v: 2, f: '2' }, { v: 3, f: '3' }] },
      { c: [{ v: 4, f: '4' }, null, { v: 6, f: '6' }] },
      { c: [null, { v: 8, f: '8' }, { v: 9, f: '9' }] }
    ]
  })
}

const HOLIDAY_FIXTURES = {
  2021: wrapGvizResponse({
    cols: [{ label: 'no' }, { label: 'date' }, { label: 'name' }],
    rows: [
      { c: [{ v: 1 }, { v: '2021-01-01' }, { v: '신정' }] },
      { c: [{ v: 2 }, { v: '2021-02-11' }, { v: '구정' }] },
      { c: [{ v: 3 }, { v: '2021-02-12' }, { v: '구정' }] }
    ]
  }),
  2022: wrapGvizResponse({
    cols: [{ label: 'no' }, { label: 'date' }, { label: 'name' }],
    rows: [
      { c: [{ v: 1 }, { v: '2022-01-01' }, { v: '신정' }] },
      { c: [{ v: 2 }, { v: '2022-02-01' }, { v: '구정' }] },
      { c: [{ v: 3 }, { v: '2022-02-02' }, { v: '구정' }] }
    ]
  })
}

class Test {
  constructor (src) {
    this.PublicGoogleSheetsParser = require(src)
    this.parser = new this.PublicGoogleSheetsParser()
  }

  attachOfflineSpreadsheetMock () {
    this.parser.getSpreadsheetDataUsingFetch = async function () {
      if (!this.id || this.id === 'invalid-id' || this.id === 'id_that_does_not_exist_anywhere') return null

      if (this.id === '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps') {
        if (this.sheetId === '784337977' || this.sheetName === 'Sheet2') return SHEET_FIXTURES.sheet2
        if (this.sheetId === '621371424' || this.sheetName === 'Sheet3') return SHEET_FIXTURES.sheet3
        return SHEET_FIXTURES.sheet1
      }

      if (this.id === '1K5oodBEghRG66WCPBumRTcexp70bZprfaXovqvoxNac') {
        return HOLIDAY_FIXTURES[this.sheetName] || null
      }

      if (this.id === '15czdGBtjjA82zpp6Xh4CY9OWs4hUpO4ul7mk6VNPGEg') return SHEET_FIXTURES.noLabels
      if (this.id === '1hAT59kWFcDSNs9X0puWbylioEIhVnzUtHz6YhYQZ5cw') return SHEET_FIXTURES.withEmptyCells

      return null
    }
  }

  test () {
    this.attachOfflineSpreadsheetMock()

    test('getSpreadsheetDataUsingFetch method should return expected result', async (t) => {
      const resultWithoutSpreadsheetId = await this.parser.getSpreadsheetDataUsingFetch()
      t.equal(resultWithoutSpreadsheetId, null)

      this.parser.id = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      this.parser.sheetName = 'Sheet1'
      const result = await this.parser.getSpreadsheetDataUsingFetch()
      t.equal(typeof result, 'string')
      t.true(result.includes('google.visualization.Query.setResponse('))
      t.end()
    })

    test('normalizeRow method should return expected array', (t) => {
      const givenRows = [{ v: null }, { v: undefined }, { v: 0 }, { v: false }, { d: 2 }, null]
      const result = this.parser.normalizeRow(givenRows)
      t.deepEqual(result, [{}, {}, { v: 0 }, { v: false }, {}, {}])
      t.end()
    })

    test('applyHeaderIntoRows method should return expected array', (t) => {
      const result = this.parser.applyHeaderIntoRows(['a', 'b', 'c'], [
        { c: [{ v: 1, f: '1' }, { v: 2, f: '2' }, { v: 3, f: '3' }] },
        { c: [{ v: 4, f: '4' }, { v: 5, f: '5' }, { v: 6, f: '6' }] }
      ])
      t.deepEqual(result, [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }])
      t.end()
    })

    test('parse method should return array even spreadsheetId is invalid', async (t) => {
      const resultWithInvalidSpreadsheetId = await this.parser.parse('id_that_does_not_exist_anywhere')
      t.deepEqual(resultWithInvalidSpreadsheetId, [])

      const resultWithValidSpreadsheetId = await this.parser.parse('10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps')
      t.deepEqual(resultWithValidSpreadsheetId, [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }])
      t.end()
    })

    test('sheetName and sheetId selection should work in parse', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const byName = await this.parser.parse(spreadsheetId, 'Sheet2')
      const byId = await this.parser.parse(spreadsheetId, { sheetId: '784337977' })
      t.deepEqual(byName, [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }])
      t.deepEqual(byId, byName)
      t.end()
    })

    test('should parse yearly holiday sheet names on runtime change', async (t) => {
      this.parser.id = '1K5oodBEghRG66WCPBumRTcexp70bZprfaXovqvoxNac'
      this.parser.sheetName = '2021'
      const resultOf2021 = await this.parser.parse()
      this.parser.sheetName = '2022'
      const resultOf2022 = await this.parser.parse()

      t.deepEqual(resultOf2021, [
        { no: 1, date: '2021-01-01', name: '신정' },
        { no: 2, date: '2021-02-11', name: '구정' },
        { no: 3, date: '2021-02-12', name: '구정' }
      ])
      t.deepEqual(resultOf2022, [
        { no: 1, date: '2022-01-01', name: '신정' },
        { no: 2, date: '2022-02-01', name: '구정' },
        { no: 3, date: '2022-02-02', name: '구정' }
      ])
      t.end()
    })

    test('should throw when parse before set spreadsheetId', async (t) => {
      const localParser = new this.PublicGoogleSheetsParser()
      localParser.getSpreadsheetDataUsingFetch = async () => null
      const actualError = await localParser.parse().catch((e) => e)
      t.deepEqual(actualError, new Error('SpreadsheetId is required.'))
      t.end()
    })

    test('should return expected array if document has no labels in cols', async (t) => {
      this.parser.id = '15czdGBtjjA82zpp6Xh4CY9OWs4hUpO4ul7mk6VNPGEg'
      t.deepEqual(await this.parser.parse(), [
        { field1: 'a1', field2: 'a2', field3: 'a3' },
        { field1: 'b1', field2: 'b2', field3: 'b3' }
      ])
      t.end()
    })

    test('should return expected array even if there are empty cell', async (t) => {
      this.parser.id = '1hAT59kWFcDSNs9X0puWbylioEIhVnzUtHz6YhYQZ5cw'
      this.parser.sheetName = null
      this.parser.sheetId = null
      t.deepEqual(await this.parser.parse(), [
        { a: 1, b: 2, c: 3 },
        { a: 4, c: 6 },
        { b: 8, c: 9 }
      ])
      t.end()
    })

    test('date/format options should behave correctly', async (t) => {
      this.parser.id = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const option = { useFormattedDate: true, sheetName: 'Sheet1', sheetId: '621371424' }

      const result = await this.parser.parse(null, option)
      t.deepEqual(result, [
        { a: 1, b: '2024-01-01' },
        { a: 2, b: '2024-12-31' },
        { a: 3, b: '2025-01-01' },
        { a: 4, b: '2025-12-31' },
        { a: 5, b: '2026-01-01' }
      ])

      option.useFormattedDate = false
      const resultWithoutFormattedDate = await this.parser.parse(null, option)
      t.deepEqual(resultWithoutFormattedDate, [
        { a: 1, b: 'Date(2024,0,1)' },
        { a: 2, b: 'Date(2024,11,31)' },
        { a: 3, b: 'Date(2025,0,1)' },
        { a: 4, b: 'Date(2025,11,31)' },
        { a: 5, b: 'Date(2026,0,1)' }
      ])

      this.parser.setOption({ useFormat: true })
      const withFormat = this.parser.applyHeaderIntoRows(['a', 'b'], [{ c: [{ v: 1000, f: '$1,000' }, { v: 2000, f: '' }] }])
      t.deepEqual(withFormat, [{ a: '$1,000', b: 2000 }])
      t.end()
    })

    test('setOption and isDate should handle edge cases', (t) => {
      this.parser.setOption('test-sheet-name')
      t.equal(this.parser.sheetName, 'test-sheet-name')

      this.parser.setOption({ sheetName: 'test', sheetId: '123', useFormattedDate: true })
      t.equal(this.parser.sheetName, 'test')
      t.equal(this.parser.sheetId, '123')
      t.equal(this.parser.useFormattedDate, true)

      this.parser.setOption({ sheetId: null })
      t.equal(this.parser.sheetId, '123')

      t.true(this.parser.isDate('Date(2020,1,1)'))
      t.false(this.parser.isDate('Invalid Date String'))
      t.end()
    })

    test('getSpreadsheetDataUsingFetch method should handle errors properly with injected fetch', async (t) => {
      const parser = new this.PublicGoogleSheetsParser('10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps', {
        fetch: async () => {
          throw new Error('forced fetch error')
        }
      })

      const result = await parser.getSpreadsheetDataUsingFetch()
      t.equal(result, null)
      t.end()
    })
  }
}

module.exports = Test
module.exports.default = Test
