#!/usr/bin/env node
/**
 * scripts/pack-crx.js
 *
 * Packs chrome-extension/ into a signed CRX3 file using the crx3 npm library API.
 * Called by GitHub Actions (.github/workflows/pack-extension.yml).
 *
 * Usage:
 *   node scripts/pack-crx.js
 *
 * Environment variables:
 *   CRX_KEY_PATH   Path to PEM private key (default: /tmp/extension.pem)
 *   CRX_OUT_PATH   Output .crx file path (default: public/extension/genspark-kb-extractor.crx)
 *   EXT_DIR        Extension source directory (default: chrome-extension)
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

// crx3 may not have ESM exports, so use createRequire as fallback
const require = createRequire(import.meta.url)

const KEY_PATH = process.env.CRX_KEY_PATH || '/tmp/extension.pem'
const OUT_PATH = process.env.CRX_OUT_PATH || 'public/extension/genspark-kb-extractor.crx'
const EXT_DIR  = process.env.EXT_DIR      || 'chrome-extension'

// Validate inputs before attempting to pack
if (!fs.existsSync(KEY_PATH)) {
  console.error('Signing key not found at:', KEY_PATH)
  process.exit(1)
}
if (!fs.existsSync(EXT_DIR)) {
  console.error('Extension directory not found:', EXT_DIR)
  process.exit(1)
}

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })

console.log('Packing extension...')
console.log('   Source:', path.resolve(EXT_DIR))
console.log('   Key:   ', KEY_PATH)
console.log('   Output:', path.resolve(OUT_PATH))

// crx3 library API: crx3(dirs, options) -> Promise<void>
const crx3 = require('crx3')

crx3([EXT_DIR], { crx: OUT_PATH, key: KEY_PATH })
  .then(() => {
    const size = fs.statSync(OUT_PATH).size
    console.log('CRX3 packed successfully')
    console.log('   Size:', (size / 1024).toFixed(1) + ' KB')
    console.log('   Path:', path.resolve(OUT_PATH))
  })
  .catch(err => {
    console.error('Pack failed:', err.message || err)
    process.exit(1)
  })
