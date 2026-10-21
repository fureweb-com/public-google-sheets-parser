const test = require('tape')
const https = require('https')
const { EventEmitter } = require('events')
const nodeFetch = require('../src/fetch')
const PublicGoogleSheetsParser = require('../src')

// Replace the network boundary, leaving the real fetch and parser code in use.
const withResponse = async (chunks, callback, error) => {
  const originalRequest = https.request
  const urls = []
  https.request = (url, onResponse) => {
    urls.push(url)
    const request = new EventEmitter()
    request.end = () => {
      if (error) {
        request.emit('error', error)
        return
      }
      const response = new EventEmitter()
      onResponse(response)
      chunks.forEach((chunk) => response.emit('data', Buffer.from(chunk)))
      response.emit('end')
    }
    return request
  }
  try {
    await callback(urls)
  } finally {
    https.request = originalRequest
  }
}

test('default Node transport should collect chunks and parse the selected sheet', async (t) => {
  const payload = '/*O_o*/\ngoogle.visualization.Query.setResponse({"table":{"cols":[{"label":"value"}],"rows":[{"c":[{"v":42}]}]}});'
  await withResponse([payload.slice(0, 12), payload.slice(12)], async (urls) => {
    const parser = new PublicGoogleSheetsParser('id', { sheetId: '123' })
    t.deepEqual(await parser.parse(), [{ value: 42 }])
    t.equal(urls[0], 'https://docs.google.com/spreadsheets/d/id/gviz/tq?gid=123')
  })
  t.end()
})

test('Node transport should reject non-spreadsheet responses', async (t) => {
  await withResponse(['<html>Not found</html>'], async () => {
    t.equal(await nodeFetch('https://example.invalid'), null)
  })
  t.end()
})

test('Node transport should handle empty responses', async (t) => {
  await withResponse([], async () => {
    const response = await nodeFetch('https://example.invalid')
    t.equal(response.text(), '')
  })
  t.end()
})

test('Node transport should propagate request errors', async (t) => {
  const expected = new Error('connection failed')
  await withResponse([], async () => {
    t.equal(await nodeFetch('https://example.invalid').catch((error) => error), expected)
  }, expected)
  t.end()
})
