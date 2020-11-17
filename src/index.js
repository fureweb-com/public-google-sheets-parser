const isBrowser = !!globalThis.window
const fetch = isBrowser ? window.fetch : require('node-fetch')

class PublicGoogleSheetsParser {
  constructor(sheetsId) {
    if (!sheetsId) throw new Error('SheetId is required.')
    this.id = sheetsId
  }

  getSheetsData() {
    // Read data from the first sheet of the target document.
    // It cannot be used unless everyone has been given read permission.
    // It must be a spreadsheet document with a header, as in the example document below.
    // spreadsheet document for example: https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1719755213
    return fetch(`https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`)
      .then((r) => r.ok ? r.text() : null)
      .catch((_) => null)
  }

  filterUselessRows(rows) {
    return rows.filter((row) => row && (row.v !== null && row.v !== undefined))
  }

  applyHeaderIntoRows(header, rows) {
    return rows
      .map(({ c: row }) => this.filterUselessRows(row))
      .map((row) => row.reduce((p, c, i) => Object.assign(p, { [header[i]]: c.v }), {}))
  }

  getItems(spreadsheetResponse) {
    let rows = []

    try {
      const parsedJSON = JSON.parse(spreadsheetResponse.split('\n')[1].replace(/google.visualization.Query.setResponse\(|\)\;/g, ''))
      const hasLabelPropertyInCols = parsedJSON.table.cols.every(({ label }) => !!label)
      if (hasLabelPropertyInCols) {
        const header = parsedJSON.table.cols.map(({ label }) => label)

        rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows)
      } else {
        const [headerRow, ...originalRows] = parsedJSON.table.rows
        const header = this.filterUselessRows(headerRow.c).map((row) => row.v)

        rows = this.applyHeaderIntoRows(header, originalRows)
      }
    } catch (e) {}

    return rows
  }

  async parse() {
    const response = await this.getSheetsData()

    if (response === null) {
      return new Error(`Invalid sheets ID: ${this.id}`)
    }

    return this.getItems(response)
  }
}

if (isBrowser) {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser
} else {
  module.exports = PublicGoogleSheetsParser
  module.exports.default = PublicGoogleSheetsParser
}
