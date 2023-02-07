function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

const isBrowser = typeof require === 'undefined';
const fetch = isBrowser ?
/* istanbul ignore next */
window.fetch : require('../src/fetch');

let PublicGoogleSheetsParser = /*#__PURE__*/function () {
  function PublicGoogleSheetsParser(spreadsheetId, sheetInfo) {
    _classCallCheck(this, PublicGoogleSheetsParser);

    this.id = spreadsheetId;
    this.parseSheetInfo(sheetInfo);
  }
  /**
   * Parses the given object or string into sheetName and/or sheetId.
   * If a string is given, sheetName is set.
   * If an object is given, its sheetId and sheetName properties are set.
    * @param sheetInfo
   */


  _createClass(PublicGoogleSheetsParser, [{
    key: "parseSheetInfo",
    value: function parseSheetInfo(sheetInfo) {
      if (sheetInfo) {
        if (typeof sheetInfo === 'string') {
          this.sheetName = sheetInfo;
          this.sheetId = null;
        } else if (typeof sheetInfo === 'object') {
          this.sheetName = sheetInfo.sheetName;
          this.sheetId = sheetInfo.sheetId;
        }
      }
    }
  }, {
    key: "getSpreadsheetDataUsingFetch",
    value: function getSpreadsheetDataUsingFetch() {
      // Read data from the first sheet of the target document.
      // It cannot be used unless everyone has been given read permission.
      // It must be a spreadsheet document with a header, as in the example document below.
      // spreadsheet document for example: https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1719755213
      if (!this.id) return null;
      let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`;

      if (this.sheetId) {
        url = url.concat(`gid=${this.sheetId}`);
      } else if (this.sheetName) {
        url = url.concat(`sheet=${this.sheetName}`);
      }

      return fetch(url).then(r => r && r.ok && r.text ? r.text() : null).catch(
      /* istanbul ignore next */
      _ => null);
    }
  }, {
    key: "normalizeRow",
    value: function normalizeRow(rows) {
      return rows.map(row => row && row.v !== null && row.v !== undefined ? row : {});
    }
  }, {
    key: "applyHeaderIntoRows",
    value: function applyHeaderIntoRows(header, rows) {
      return rows.map(({
        c: row
      }) => this.normalizeRow(row)).map(row => row.reduce((p, c, i) => c.v ? Object.assign(p, {
        [header[i]]: c.v
      }) : p, {}));
    }
  }, {
    key: "getItems",
    value: function getItems(spreadsheetResponse) {
      let rows = [];

      try {
        const parsedJSON = JSON.parse(spreadsheetResponse.split('\n')[1].replace(/google.visualization.Query.setResponse\(|\);/g, ''));
        const hasSomeLabelPropertyInCols = parsedJSON.table.cols.some(({
          label
        }) => !!label);

        if (hasSomeLabelPropertyInCols) {
          const header = parsedJSON.table.cols.map(({
            label
          }) => label);
          rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows);
        } else {
          const [headerRow, ...originalRows] = parsedJSON.table.rows;
          const header = this.normalizeRow(headerRow.c).map(row => row.v);
          rows = this.applyHeaderIntoRows(header, originalRows);
        }
      } catch (e) {}

      return rows;
    }
  }, {
    key: "parse",
    value: function () {
      var _parse = _asyncToGenerator(function* (spreadsheetId, sheetInfo) {
        if (spreadsheetId) this.id = spreadsheetId;
        if (sheetInfo) this.parseSheetInfo(sheetInfo);
        if (!this.id) throw new Error('SpreadsheetId is required.');
        const spreadsheetResponse = yield this.getSpreadsheetDataUsingFetch();
        if (spreadsheetResponse === null) return [];
        return this.getItems(spreadsheetResponse);
      });

      function parse(_x, _x2) {
        return _parse.apply(this, arguments);
      }

      return parse;
    }()
  }]);

  return PublicGoogleSheetsParser;
}();
/* istanbul ignore next */


if (isBrowser) {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser;
} else {
  module.exports = PublicGoogleSheetsParser;
  module.exports.default = PublicGoogleSheetsParser;
}
