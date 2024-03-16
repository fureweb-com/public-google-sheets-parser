const https = require('https')

const nodeFetch = async (url) => {
  return new Promise((resolve, reject) => {
    const canUseHttpsRequest = typeof e !== 'undefined' && typeof e.request === 'function';
    if (canUseHttpsRequest) {
      const req = https.request(url, (res) => {
        const body = []
        let isStarted = false

        res.on('data', (chunk) => {
          if (!isStarted && !String(chunk).startsWith('/*O_o*/')) return resolve(null)
          isStarted = true

          body.push(chunk)
        })

        res.on('end', () => {
          const response = { ok: true, text: () => Buffer.concat(body).toString() }
          resolve(response)
        })
      })

      req.on('error', reject)
      req.end()
    }
    else if (typeof window.fetch !== 'undefined') {
      window.fetch(url)
        .then(response => response.text())
        .then(text => {
          const response = { ok: true, text: () => text };
          resolve(response);
        })
        .catch(error => reject(error));
    }
    else {
      console.error("Fetch fail");
    }
  })
}

module.exports = nodeFetch
module.exports.default = nodeFetch
