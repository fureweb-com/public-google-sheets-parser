const https = require('https')

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

module.exports = nodeFetch
module.exports.default = nodeFetch
