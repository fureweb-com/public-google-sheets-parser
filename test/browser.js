const test = require('tape')
const fs = require('fs')
const vm = require('vm')

const payload = 'google.visualization.Query.setResponse({"table":{"cols":[{"label":"a"}],"rows":[{"c":[{"v":1}]}]}});'
const response = async () => ({ ok: true, text: async () => payload })

test('browser bundlers should use window.fetch and preserve module exports', async (t) => {
  const originalWindow = global.window
  const entry = require.resolve('../src')
  const originalModule = require.cache[entry]
  try {
    global.window = { document: {}, fetch: response }
    delete require.cache[entry]
    const Parser = require('../src')
    t.equal(Parser, Parser.PublicGoogleSheetsParser)
    t.deepEqual(await new Parser('id').parse(), [{ a: 1 }])

    // Some bundlers expose a window object without a browser document.
    global.window = {}
    delete require.cache[entry]
    const NodeParser = require('../src')
    t.equal(typeof NodeParser, 'function')
  } finally {
    require.cache[entry] = originalModule
    if (originalWindow === undefined) delete global.window
    else global.window = originalWindow
  }
  t.end()
})

test('standalone browser scripts should expose the parser on window', async (t) => {
  const entry = require.resolve('../src')
  const window = { document: {}, fetch: response }
  vm.runInNewContext(fs.readFileSync(entry, 'utf8'), { window })
  const rows = await new window.PublicGoogleSheetsParser('id').parse()
  t.equal(JSON.stringify(rows), '[{"a":1}]')
  t.end()
})
