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
  function PublicGoogleSheetsParser(spreadsheetId, option) {
    _classCallCheck(this, PublicGoogleSheetsParser);

    this.id = spreadsheetId;
    this.setOption(option);
  }

  _createClass(PublicGoogleSheetsParser, [{
    key: "setOption",
    value: function setOption(option) {
      if (!option) {
        this.sheetName = this.sheetName || null;
        this.sheetId = this.sheetId || null;
        this.useFormattedDate = this.useFormattedDate || false;
        this.useFormat = this.useFormat || false;
      } else if (typeof option === 'string') {
        this.sheetName = option;
        this.sheetId = this.sheetId || null;
      } else if (typeof option === 'object') {
        this.sheetName = option.sheetName || this.sheetName;
        this.sheetId = option.sheetId || this.sheetId;
        this.useFormattedDate = option.hasOwnProperty('useFormattedDate') ? option.useFormattedDate : this.useFormattedDate;
        this.useFormat = option.hasOwnProperty('useFormat') ? option.useFormat : this.useFormat;
      }
    }
  }, {
    key: "isDate",
    value: function isDate(date) {
      return date && typeof date === 'string' && /Date\((\d+),(\d+),(\d+)\)/.test(date);
    }
  }, {
    key: "getSpreadsheetDataUsingFetch",
    value: function () {
      var _getSpreadsheetDataUsingFetch = _asyncToGenerator(function* () {
        if (!this.id) return null;
        let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`;
        url += this.sheetId ? `gid=${this.sheetId}` : `sheet=${this.sheetName}`;

        try {
          const response = yield fetch(url);
          return response && response.ok ? response.text() : null;
        } catch (e) {
          /* istanbul ignore next */
          console.error('Error fetching spreadsheet data:', e);
          /* istanbul ignore next */

          return null;
        }
      });

      function getSpreadsheetDataUsingFetch() {
        return _getSpreadsheetDataUsingFetch.apply(this, arguments);
      }

      return getSpreadsheetDataUsingFetch;
    }()
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
      }) => this.normalizeRow(row)).map(row => row.reduce((p, c, i) => c.v !== null && c.v !== undefined ? Object.assign(p, {
        [header[i]]: this.useFormat ? c.f || c.v : this.useFormattedDate && this.isDate(c.v) ? c.f || c.v : c.v
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
      } catch (e) {
        /* istanbul ignore next */
        console.error('Error parsing spreadsheet data:', e);
      }

      return rows;
    }
  }, {
    key: "parse",
    value: function () {
      var _parse = _asyncToGenerator(function* (spreadsheetId, option) {
        if (spreadsheetId) this.id = spreadsheetId;
        if (option) this.setOption(option);
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
