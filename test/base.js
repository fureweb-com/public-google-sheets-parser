const test = require('tape')

class Test {
  constructor (src) {
    this.PublicGoogleSheetsParser = require(src)
    this.parser = new this.PublicGoogleSheetsParser()
  }

  test () {
    test('getSpreadsheetDataUsingFetch method should return expected result', async (t) => {
      const resultWithoutSpreadsheetId = await this.parser.getSpreadsheetDataUsingFetch()
      t.equal(resultWithoutSpreadsheetId, null)

      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      this.parser.id = spreadsheetId

      const resultWithSpreadsheetId = await this.parser.getSpreadsheetDataUsingFetch()
      const expected = '/*O_o*/\ngoogle.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"779687672","table":{"cols":[{"id":"A","label":"a","type":"number","pattern":"General"},{"id":"B","label":"b","type":"number","pattern":"General"},{"id":"C","label":"c","type":"number","pattern":"General"}],"rows":[{"c":[{"v":1.0,"f":"1"},{"v":2.0,"f":"2"},{"v":3.0,"f":"3"}]},{"c":[{"v":4.0,"f":"4"},{"v":5.0,"f":"5"},{"v":6.0,"f":"6"}]},{"c":[{"v":7.0,"f":"7"},{"v":8.0,"f":"8"},{"v":9.0,"f":"9"}]}],"parsedNumHeaders":1}});'
      t.equal(resultWithSpreadsheetId, expected)

      t.end()
    })

    test('normalizeRow method should return expected array', (t) => {
      const givenRows = [{ v: null }, { v: undefined }, { v: 0 }, { v: false }, { d: 2 }, null]

      const result = this.parser.normalizeRow(givenRows)
      const expected = [{}, {}, { v: 0 }, { v: false }, {}, {}]
      t.deepEqual(result, expected)

      t.end()
    })

    test('applyHeaderIntoRows method should return expected array', (t) => {
      const givenHeader = ['a', 'b', 'c']
      const givenRows = [
        { c: [{ v: 1, f: '1' }, { v: 2, f: '2' }, { v: 3, f: '3' }] },
        { c: [{ v: 4, f: '4' }, { v: 5, f: '5' }, { v: 6, f: '6' }] },
        { c: [{ v: 7, f: '7' }, { v: 8, f: '8' }, { v: 9, f: '9' }] }
      ]

      const result = this.parser.applyHeaderIntoRows(givenHeader, givenRows)
      const expected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
      t.deepEqual(result, expected)

      t.end()
    })

    test('parse method should return array even spreadsheetId is invalid', async (t) => {
      const invalidSpreadsheetId = 'id_that_does_not_exist_anywhere'
      const resultWithInvalidSpreadsheetId = await this.parser.parse(invalidSpreadsheetId)
      t.deepEqual(resultWithInvalidSpreadsheetId, [])

      const validSpreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const resultWithValidSpreadsheetId = await this.parser.parse(validSpreadsheetId)
      const expected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
      t.deepEqual(resultWithValidSpreadsheetId, expected)

      t.end()
    })

    test('should get first sheet by default if none is specified', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const result = await this.parser.parse(spreadsheetId)
      const expected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
      t.deepEqual(result, expected)
      t.end()
    })

    test('should get 2nd sheet if name is specified', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const sheetName = 'Sheet2'
      const result = await this.parser.parse(spreadsheetId, sheetName)
      const expected = [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }]
      t.deepEqual(result, expected)
      t.end()
    })

    test('should parse properly after change sheetName on runtime', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const firstSheetName = 'Sheet1'
      const secondSheetName = 'Sheet2'

      const firstResult = await this.parser.parse(spreadsheetId, firstSheetName)
      const firstExpected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
      t.deepEqual(firstResult, firstExpected)

      const secondResult = await this.parser.parse(spreadsheetId, secondSheetName)
      const secondExpected = [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }]
      t.deepEqual(secondResult, secondExpected)
      t.end()
    })

    test('should get public holiday information in a spreadsheet using a specific year as the sheet name', async (t) => {
      const spreadsheetId = '1K5oodBEghRG66WCPBumRTcexp70bZprfaXovqvoxNac'
      this.parser.id = spreadsheetId
      this.parser.sheetName = '2021'
      const resultOf2021 = await this.parser.parse()
      const expectedOf2021 = [
        { no: 1, date: '2021-01-01', name: '신정' },
        { no: 2, date: '2021-02-11', name: '구정' },
        { no: 3, date: '2021-02-12', name: '구정' },
        { no: 4, date: '2021-02-13', name: '구정' },
        { no: 5, date: '2021-03-01', name: '삼일절' },
        { no: 6, date: '2021-05-05', name: '어린이날' },
        { no: 7, date: '2021-05-19', name: '부처님오신날' },
        { no: 8, date: '2021-06-06', name: '현충일' },
        { no: 9, date: '2021-08-15', name: '광복절' },
        { no: 10, date: '2021-09-20', name: '추석' },
        { no: 11, date: '2021-09-21', name: '추석' },
        { no: 12, date: '2021-09-22', name: '추석' },
        { no: 13, date: '2021-10-03', name: '개천절' },
        { no: 14, date: '2021-10-09', name: '한글날' },
        { no: 15, date: '2021-12-25', name: '크리스마스' }
      ]
      t.deepEqual(resultOf2021, expectedOf2021)

      // change sheetName
      this.parser.sheetName = '2022'
      const resultOf2022 = await this.parser.parse()
      const expectedOf2022 = [
        { no: 1, date: '2022-01-01', name: '신정' },
        { no: 2, date: '2022-02-01', name: '구정' },
        { no: 3, date: '2022-02-02', name: '구정' },
        { no: 4, date: '2022-02-03', name: '구정' },
        { no: 5, date: '2022-03-01', name: '삼일절' },
        { no: 6, date: '2022-05-05', name: '어린이날' },
        { no: 7, date: '2022-05-08', name: '부처님오신날' },
        { no: 8, date: '2022-06-06', name: '현충일' },
        { no: 9, date: '2022-08-15', name: '광복절' },
        { no: 10, date: '2022-09-09', name: '추석' },
        { no: 11, date: '2022-09-10', name: '추석' },
        { no: 12, date: '2022-09-11', name: '추석' },
        { no: 13, date: '2022-10-03', name: '개천절' },
        { no: 14, date: '2022-10-09', name: '한글날' },
        { no: 15, date: '2022-12-25', name: '크리스마스' }
      ]
      t.deepEqual(resultOf2022, expectedOf2022)
      t.end()
    })

    test('should get 2nd sheet if sheet ID specified', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const sheetInfo = { sheetId: '784337977' }
      const result = await this.parser.parse(spreadsheetId, sheetInfo)
      const expected = [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }]
      t.deepEqual(result, expected)
      t.end()
    })

    test('should parse properly after changing sheetId at runtime', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const firstSheetId = '0'
      const secondSheetId = '784337977'

      const firstResult = await this.parser.parse(spreadsheetId, { sheetId: firstSheetId })
      const firstExpected = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }]
      t.deepEqual(firstResult, firstExpected)

      const secondResult = await this.parser.parse(spreadsheetId, { sheetId: secondSheetId })
      const secondExpected = [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }]
      t.deepEqual(secondResult, secondExpected)
      t.end()
    })

    test('should parse properly if both sheetName and sheetId are given', async (t) => {
      const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
      const sheetName = 'Sheet2'
      const sheetId = '784337977'

      const result = await this.parser.parse(spreadsheetId, { sheetId, sheetName })
      const expected = [{ a: 10, b: 20, c: 30 }, { a: 40, b: 50, c: 60 }, { a: 70, b: 80, c: 90 }]
      t.deepEqual(result, expected)
      t.end()
    })

    test('should throw when parse before set spreadsheetId', async (t) => {
      const localParser = new this.PublicGoogleSheetsParser()

      const actualError = await localParser.parse().catch((e) => e)
      const expectedError = new Error('SpreadsheetId is required.')

      t.deepEqual(actualError, expectedError)
    })

    test('should return expected array if document has no labels in cols', async (t) => {
      this.parser.id = '15czdGBtjjA82zpp6Xh4CY9OWs4hUpO4ul7mk6VNPGEg'
      const actualArray = await this.parser.parse()
      const expectedArray = [
        { field1: 'a1', field2: 'a2', field3: 'a3' },
        { field1: 'b1', field2: 'b2', field3: 'b3' }
      ]

      t.deepEqual(actualArray, expectedArray)
    })

    test('should return expected array even if there are empty cell', async (t) => {
      this.parser.id = '1hAT59kWFcDSNs9X0puWbylioEIhVnzUtHz6YhYQZ5cw'
      this.parser.sheetName = null
      this.parser.sheetId = null
      const actualArray = await this.parser.parse()
      const expectedArray = [
        { a: 1, b: 2, c: 3 },
        { a: 4, c: 6 },
        { b: 8, c: 9 }
      ]

      t.deepEqual(actualArray, expectedArray)
    })
  }
}

module.exports = Test
module.exports.default = Test
