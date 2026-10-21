import PublicGoogleSheetsParser, { PublicGoogleSheetsParser as NamedParser } from 'public-google-sheets-parser'

// Regression for #57: default imports must be constructible in a TS ESM project.
if (PublicGoogleSheetsParser !== NamedParser) throw new Error('ESM exports must match')
const parser: PublicGoogleSheetsParser = new PublicGoogleSheetsParser('id', {
  fetch: async () => ({
    ok: true,
    text: async () => 'google.visualization.Query.setResponse({"table":{"cols":[{"label":"value"}],"rows":[{"c":[{"v":42}]}]}});'
  })
})
const rows: Array<Record<string, unknown>> = await parser.parse()
if (rows.length !== 1 || rows[0].value !== 42) throw new Error('ESM parser returned incorrect rows')
const namedParser = new NamedParser('id', { fetch: async () => ({ ok: false, text: async () => '' }) })
if ((await namedParser.parse()).length !== 0) throw new Error('ESM named export must be constructible')
