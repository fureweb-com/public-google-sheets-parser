# Public Google sheets parser for browser
---

It is a simple parser for browser that helps you use public Google sheets document as if they were a database.

The document to be used must be a Google Sheets document in the 'public' state and have a header in the first row. (e.g. [Google sheets for example](https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703))

It does not work in browsers where the [fetch API](https://caniuse.com/fetch) is not available.

**Currently, it is only available in the browser through the distribution file.**

### Usage example
---

```html
<!-- http://fureweb.com/public-google-sheets-parser.html  -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Public google sheets parser for browser</title>
</head>
<body>
  <div class="for-input">
    <input id="sheet-id" type="text" style="width: 300px" placeholder="insert your spreadsheet ID here">
    <button class="get-items">GET ITEMS</button>
  </div>

  <div>
    <p>Sample ID: 10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps</p>
    <p><a target="_blank" href="https://docs.google.com/spreadsheets/d/10WDbAPAY7Xl5DT36VuMheTPTTpqx9x0C5sDCnh4BGps/edit#gid=1839148703">SpreadSheet URL</a></p>
  </div>

  <div class="result" style="padding: 16px; border: 1px solid #dedede; background-color: #eee"></div>
  <script src="http://fureweb.com/public-google-sheets-parser.min.js"></script>

  <script>
    (() => {
      const showResult = (string) => {
        document.querySelector('.result').innerHTML = JSON.stringify(string)
      }

      const getItems = () => {
        const spreadsheetIdElement = document.querySelector('#sheet-id')
        if (!spreadsheetIdElement.value) {
          window.alert('Please insert your public spreadsheet ID')
          return spreadsheetIdElement.focus()
        }

        const parser = new PublicGoogleSheetsParser(spreadsheetIdElement.value.trim())
        parser.parse().then((items) => {
          // items should be [{ a :1, b :2, c :3 },{ a :4, b :5, c :6 },{ a :7, b :8, c :9 }]
          showResult(items)
        })
      }
      document.querySelector('.get-items').onclick = getItems
    })()
  </script>
</body>
```

**That's it!**
