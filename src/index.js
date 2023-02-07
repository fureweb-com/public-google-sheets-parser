const isBrowser = typeof require === 'undefined'
const fetch = isBrowser ? /* istanbul ignore next */window.fetch : require('../src/fetch')

class PublicGoogleSheetsParser {
  constructor (spreadsheetId, sheetInfo) {
    this.id = spreadsheetId
    this.parseSheetInfo(sheetInfo)
  }

  /**
   * Parses the given object or string into sheetName and/or sheetId.
   * If a string is given, sheetName is set.
   * If an object is given, its sheetId and sheetName properties are set.
    * @param sheetInfo
   */
  parseSheetInfo (sheetInfo) {
    if (sheetInfo) {
      if (typeof sheetInfo === 'string') {
        this.sheetName = sheetInfo
        this.sheetId = null
      } else if (typeof sheetInfo === 'object') {
        this.sheetName = sheetInfo.sheetName
        this.sheetId = sheetInfo.sheetId
      }
    }
  }

  getSpreadsheetDataUsingFetch () {
    // Read data from the first sheet of the target document.
    // It cannot be used unless everyone has been given read permission.
    // It must be a spreadsheet document with a header, as in the example document below.
    // spreadsheet document for example: https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1719755213
    if (!this.id) return null
    let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`
    if (this.sheetId) {
      url = url.concat(`gid=${this.sheetId}`)
    } else if (this.sheetName) {
      url = url.concat(`sheet=${this.sheetName}`)
    }

    return fetch(url)
      .then((r) => r && r.ok && r.text ? r.text() : null)
      .catch(/* istanbul ignore next */(_) => null)
  }

  normalizeRow (rows) {
    return rows.map((row) => (row && (row.v !== null && row.v !== undefined)) ? row : {})
  }

  applyHeaderIntoRows (header, rows) {
    return rows
      .map(({ c: row }) => this.normalizeRow(row))
      .map((row) => row.reduce((p, c, i) => c.v ? Object.assign(p, { [header[i]]: c.v }) : p, {}))
  }

  getItems (spreadsheetResponse) {
    let rows = []

    try {
      const parsedJSON = JSON.parse(spreadsheetResponse.split('\n')[1].replace(/google.visualization.Query.setResponse\(|\);/g, ''))
      const hasSomeLabelPropertyInCols = parsedJSON.table.cols.some(({ label }) => !!label)
      if (hasSomeLabelPropertyInCols) {
        const header = parsedJSON.table.cols.map(({ label }) => label)

        rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows)
      } else {
        const [headerRow, ...originalRows] = parsedJSON.table.rows
        const header = this.normalizeRow(headerRow.c).map((row) => row.v)

        rows = this.applyHeaderIntoRows(header, originalRows)
      }
    } catch (e) {}

    return rows
  }

  async parse (spreadsheetId, sheetInfo) {
    if (spreadsheetId) this.id = spreadsheetId
    if (sheetInfo) this.parseSheetInfo(sheetInfo)

    if (!this.id) throw new Error('SpreadsheetId is required.')

    const spreadsheetResponse = await this.getSpreadsheetDataUsingFetch()

    if (spreadsheetResponse === null) return []

    return this.getItems(spreadsheetResponse)
  }
}

/* istanbul ignore next */
if (isBrowser) {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser
} else {
  module.exports = PublicGoogleSheetsParser
  module.exports.default = PublicGoogleSheetsParser
}
