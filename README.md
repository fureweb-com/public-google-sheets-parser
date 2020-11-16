# Public Google sheets parser for browser
---

It is a simple parser for browser that helps you use public Google sheets document as if they were a database.

The document to be used must be a Google Sheets document in the 'public' state and have a header in the first row. (e.g. [Google sheets for example](https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703))

It does not work in browsers where the [fetch API](https://caniuse.com/fetch) is not available.

**Currently, it is only available in the browser through the distribution file.**

### Usage example
---

```js
// import distribution file before make PublicGoogleSheetsParser instance. (see /dist/index.js)

const sheetsId = '10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps'
const parser = new PublicGoogleSheetsParser(sheetsId)
parser.parse().then((items) => {
  console.log(items) // [{ a: 1, b: 2, c: 3}, { a: 4, b: 5, c: 6 }, ...]
})
```

**That's it!**
