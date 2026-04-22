import PublicGoogleSheetsParser from '../..'

const parser = new PublicGoogleSheetsParser('spreadsheet-id', {
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
  console.log(typedRows.length)
}

void main()
