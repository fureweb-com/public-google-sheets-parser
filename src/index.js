const isBrowser = typeof require === 'undefined'
const fetch = isBrowser ? window.fetch : require('node-fetch')

class PublicGoogleSheetsParser {
  constructor (spreadsheetId, tabName) {
    this.id = spreadsheetId
    this.tab = tabName
  }

  getSpreadsheetDataUsingFetch () {
    // Read data from the first sheet of the target document.
    // It cannot be used unless everyone has been given read permission.
    // It must be a spreadsheet document with a header, as in the example document below.
    // spreadsheet document for example: https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1719755213
    // Sheet/Tab selection from: https://stackoverflow.com/a/44592363/1649917

    if (!this.id) return null
    let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`
    if (this.tab) {
      url = url.concat(`sheet=${this.tab}`)
    }

    return fetch(url)
      .then((r) => r.ok ? r.text() : null)
      .catch((_) => null)
  }

  filterUselessRows (rows) {
    return rows.filter((row) => row && (row.v !== null && row.v !== undefined))
  }

  applyHeaderIntoRows (header, rows) {
    return rows
      .map(({ c: row }) => this.filterUselessRows(row))
      .map((row) => row.reduce((p, c, i) => Object.assign(p, { [header[i]]: c.v }), {}))
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
        const header = this.filterUselessRows(headerRow.c).map((row) => row.v)

        rows = this.applyHeaderIntoRows(header, originalRows)
      }
    } catch (e) {}

    return rows
  }

  async parse (spreadsheetId, tabName) {
    if (spreadsheetId) this.id = spreadsheetId
    if (tabName) this.tab = tabName

    if (!this.id) throw new Error('SpreadsheetId is required.')

    const spreadsheetResponse = await this.getSpreadsheetDataUsingFetch()

    if (spreadsheetResponse === null) return []

    return this.getItems(spreadsheetResponse)
  }
}

if (isBrowser) {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser
} else {
  module.exports = PublicGoogleSheetsParser
  module.exports.default = PublicGoogleSheetsParser
}
