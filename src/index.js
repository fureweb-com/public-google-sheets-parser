const isBrowser = !!globalThis.window
const fetch = isBrowser ? window.fetch : require('node-fetch')


const Data = class {
  async getSheetsData() {
      const json = await this._getSheetsData();
      return new GetItem(json)
  }
  async _getSheetsData() {throw '__getSheetsData must override'}
}

const SheetData = class extends Data {
  constructor(sheetId) {
      super();
      this.id = sheetId
  }
  async _getSheetsData() {
      return fetch(`https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`)
      .then((r) => r.ok ? r.text() : null)
      .catch((_) => null)
  }
}


const GetItem = class {
  constructor(spreadsheetResponse) {
      if(typeof spreadsheetResponse !== 'string') throw 'invalid type';
      this.spreadsheetResponse = spreadsheetResponse;
  }
  get sheetItemString() {
      return this.spreadsheetResponse
  }
}


const Parser = class {
  async parse(data) {
      if (!(data instanceof Data)) throw 'invalid data type';
      this._item = await data.getSheetsData();        
      return this._parse()
  }
  _parse() {
      throw '_parse must override'
  }
}


const PublicGoogleSheetsParser = (() => {

  const filterUselessRows = (rows) => {
      return rows.filter((row) => row && (row.v !== null && row.v !== undefined))
  }
  const applyHeaderIntoRows = (header, rows) => {
      return rows
      .map(({ c: row }) => filterUselessRows(row))
      .map((row) => row.reduce((p, c, i) => Object.assign(p, { [header[i]]: c.v }), {}))
  } 
  return class extends Parser {
      constructor() {
          super();
      }
      async _parse() {
          const {spreadsheetResponse} =  this._item;
          if (spreadsheetResponse === null) return [];

          let rows = []
          try {
              const parsedJSON = JSON.parse(spreadsheetResponse.split('\n')[1].replace(/google.visualization.Query.setResponse\(|\)\;/g, ''))
              
              const hasLabelPropertyInCols = parsedJSON.table.cols.every(({ label }) => !!label)
              
              if (hasLabelPropertyInCols) {
                  const header = parsedJSON.table.cols.map(({ label }) => label)
                  rows = applyHeaderIntoRows(header, parsedJSON.table.rows)
              } else {
                  const [headerRow, ...originalRows] = parsedJSON.table.rows
                  const header = filterUselessRows(headerRow.c).map((row) => row.v)
                  rows = applyHeaderIntoRows(header, originalRows)
              }
          } catch (e) {
              throw e
          }
          return rows
      }
  }
})()


if (isBrowser) {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser
} else {
  module.exports = PublicGoogleSheetsParser
  module.exports.default = PublicGoogleSheetsParser
}
