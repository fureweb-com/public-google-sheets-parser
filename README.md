# Public Google sheets parser for browser

It is a simple parser for browser that helps you use public Google sheets document as if they were a database.

The document to be used must be a Google Sheets document in the 'public' state and have a header in the first row. (e.g. [Google sheets for example](https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703))

It does not work in browsers where the [fetch API](https://caniuse.com/fetch) is not available.

**Currently, it is only available in the browser through the distribution file.**

### Demo page
[Click here](http://fureweb.com/public-google-sheets-parser.html)

### Usage example

```html
<!-- see http://fureweb.com/public-google-sheets-parser.html source code -->
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

