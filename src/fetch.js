const https = require('https')
const isBrowser = typeof require === 'undefined'

const nodeFetch = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      res.on('data', (data) => {
        if (!String(data).startsWith('/*O_o*/')) return resolve(null)

        const response = { ok: true, text: () => String(data) }
        resolve(response)
      })
    })

    req.on('error', reject)
    req.end()
  })
}

const fetch = isBrowser ? /* istanbul ignore next */ window.fetch : nodeFetch

module.exports = fetch
module.exports.default = fetch
