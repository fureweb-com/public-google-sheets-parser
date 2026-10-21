import PublicGoogleSheetsParser, { PublicGoogleSheetsParser as NamedParser } from 'public-google-sheets-parser'
import CommonJSParser = require('public-google-sheets-parser')

if (NamedParser !== PublicGoogleSheetsParser) throw new Error('Named and default exports must match')
if (CommonJSParser !== PublicGoogleSheetsParser) throw new Error('CommonJS export must be the constructor')

const typedParser: NamedParser = new CommonJSParser()
typedParser.setOption({ sheetName: 'Sheet1' })

const parser = new NamedParser('spreadsheet-id', {
  sheetName: 'Sheet1',
  useFormat: true,
  fetch: async (_url: string) => ({
    ok: true,
    text: async () => '/*O_o*/\ngoogle.visualization.Query.setResponse({"table":{"cols":[{"label":"a"}],"rows":[{"c":[{"v":1,"f":"1"}]}]}});'
  })
})

async function main (): Promise<void> {
  const rows = await parser.parse()
  const typedRows: Array<Record<string, unknown>> = rows
  if (typedRows.length !== 1 || typedRows[0].a !== '1') throw new Error('TypeScript consumer returned incorrect rows')
  const defaultParser = new PublicGoogleSheetsParser('spreadsheet-id', {
    fetch: async () => ({ ok: false, text: async () => '' })
  })
  if ((await defaultParser.parse()).length !== 0) throw new Error('Default export must be constructible')
}

void main()
