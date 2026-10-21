const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const rimraf = require('rimraf')

const project = path.resolve(__dirname, '../..')
const temporaryRoot = path.resolve(os.tmpdir())
const consumer = fs.mkdtempSync(path.join(temporaryRoot, 'pgsp-types-'))
if (path.dirname(consumer) !== temporaryRoot || !path.basename(consumer).startsWith('pgsp-types-')) {
  throw new Error('Unexpected TypeScript test directory')
}

const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: consumer, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`TypeScript consumer check failed: ${args[0]}`)
}

try {
  // Test actual package resolution from CommonJS and ESM consumers, without
  // path aliases, global installs, or fetching a different compiler via npx.
  const installedPackage = path.join(consumer, 'node_modules/public-google-sheets-parser')
  for (const file of ['package.json', '@types/index.d.ts', 'src/index.js', 'src/fetch.js', 'dist/index.js']) {
    const destination = path.join(installedPackage, file)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(path.join(project, file), destination)
  }
  for (const file of ['tsconfig.json', 'usage.ts', 'usage.mts']) {
    fs.copyFileSync(path.join(__dirname, file), path.join(consumer, file))
  }
  run([require.resolve('typescript/bin/tsc'), '-p', consumer])
  run([path.join(consumer, 'out/usage.js')])
  run([path.join(consumer, 'out/usage.mjs')])
} finally {
  rimraf.sync(consumer)
}
