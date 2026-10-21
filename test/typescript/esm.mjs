import assert from 'node:assert/strict'
import Parser, { PublicGoogleSheetsParser } from '../../src/index.js'
import DistParser, { PublicGoogleSheetsParser as DistNamedParser } from '../../dist/index.js'

for (const [DefaultParser, NamedParser] of [[Parser, PublicGoogleSheetsParser], [DistParser, DistNamedParser]]) {
  assert.equal(DefaultParser, NamedParser)
  const parser = new NamedParser('id', {
    fetch: async () => ({ ok: true, text: async () => '/*O_o*/\ngoogle.visualization.Query.setResponse({"table":{"cols":[{"label":"a"}],"rows":[{"c":[{"v":1}]}]}});' })
  })
  assert.deepEqual(await parser.parse(), [{ a: 1 }])
}
