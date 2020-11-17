# Public Google sheets parser

It is a simple parser that helps you use public Google sheets document as if they were a database.

The document to be used must be a Google Sheets document in the 'public' state and have a header in the first row. (e.g. [Google sheets for example](https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703))

There is a limitation that only the data of the first sheet can be imported, but it seems that it can be fully utilized for simple purposes, so I made it.

It does not work in browsers where the [fetch API](https://caniuse.com/fetch) is not available.

**No API key required.** This means that the server does not need to use the private key to use the SDK.

**Currently, it is only available in the browser through the distribution file. I will update the content in the example when I check when it was uploaded to the CDN.**

### Demo page
[Click here](http://fureweb.com/public-google-sheets-parser.html)

### Usage example
- Node.js
```js
const PublicGoogleSheetsParser = require('public-google-sheets-parser')
const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
const parser = new PublicGoogleSheetsParser(spreadsheetId)
parser.parse().then((items) => {
  // items should be [{ a: 1, b: 2, c: 3}, { a: 4, b: 5, c: 6 }, ...]
  console.log(items)
})
```

- browser
```html
<!-- see http://fureweb.com/public-google-sheets-parser.html -->
<script>
const spreadsheetId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
const parser = new PublicGoogleSheetsParser(spreadsheetId)
parser.parse().then((items) => {
  // items should be [{ a: 1, b: 2, c: 3}, { a: 4, b: 5, c: 6 }, ...]
  console.log(items)
})
</script>
```

**That's it!**

