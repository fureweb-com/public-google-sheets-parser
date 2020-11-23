# Public Google sheets parser

![Introduction](introduction.png)

It is a simple parser that helps you use public Google sheets document as if they were a database.

The document to be used must be a Google Sheets document in the 'public' state and have a header in the first row. (e.g. [Google sheets for example](https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703))

There is a limitation that only the data of the first sheet can be imported, but it seems that it can be fully utilized for simple purposes, so I made it.

It does not work in browsers where the [fetch API](https://caniuse.com/fetch) is not available.

**No API key required.** This means that the server does not need to use the private key to use the SDK.

You can also use it via free API. Please see [this documentation](https://api.fureweb.com).
If you have a public spreadsheet document, and the first row is a header and you have more than one row of data, you can call it free of charge through this API and use the result as a JSON response.

### Demo page
[Click here](http://fureweb.com/public-google-sheets-parser.html)

### Usage example
- Node.js
```js
const PublicGoogleSheetsParser = require('public-google-sheets-parser')

const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'

// 1. You can pass spreadsheetId when parser instantiation
const parser = new PublicGoogleSheetsParser(spreadsheetId)
parser.parse().then((items) => {
  // items should be [{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]
})

// 2. You can change spreadsheetId on runtime
const anotherSpreadsheetId = '1oCgY0UHHRQ95snw7URFpOOL_DQcVG_wydlOoGiTof5E'
parser.id = anotherSpreadsheetId
parser.parse().then((items) => {
  /* items should be
  [
    {"id":1,"title":"This is a title of 1","description":"This is a description of 1","createdAt":"2020-11-12","modifiedAt":"2020-11-18"},
    {"id":2,"title":"This is a title of 2","description":"This is a description of 2","createdAt":"2020-11-12","modifiedAt":"2020-11-18"},
    ...
  ]
  */
})

// 3. You can pass the spreadsheet ID when call parse method.
parser.parse(spreadsheetId).then((items) => {
  // items should be [{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]
})
```
You can use any of the three methods you want!

- browser
```html
<script src="https://cdn.jsdelivr.net/npm/public-google-sheets-parser@1.0.17/src/index.min.js"></script>

<script>
const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
const parser = new PublicGoogleSheetsParser()
parser.parse(spreadsheetId).then((items) => {
  // items should be [{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]
})
</script>
```

- free API ([documentation](https://api.fureweb.com))

```sh
curl -X GET "https://api.fureweb.com/spreadsheets/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps" -H "accept: */*"

# response (application/json)
{"data":[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]}
```
**That's it!**

