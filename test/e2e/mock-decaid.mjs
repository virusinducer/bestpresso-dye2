// Minimal Decaid stand-in for the end-to-end test.
//   :3000  serves the built skin (like Decaid's WebUI server)
//   :8080  /api/v1/plugins (list), /api/v1/plugins/dye2.reaplugin/<endpoint> (runs the real built plugin.js),
//          POST /__plugin/enable|disable|remove to flip the plugin state
//
//   SKIN_DIR=out/skin PLUGIN_JS=.work/dye2/dye2.reaplugin/plugin.js node test/e2e/mock-decaid.mjs
import { readFileSync, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import vm from 'node:vm'

const SKIN_DIR = process.env.SKIN_DIR
const PLUGIN_JS = process.env.PLUGIN_JS
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }

let state = 'loaded' // loaded | disabled | removed

const context = vm.createContext({ console, setTimeout, clearTimeout })
new vm.Script(readFileSync(PLUGIN_JS, 'utf8'), { filename: 'plugin.js' }).runInContext(context)
const plugin = context.createPlugin({ log() {}, emit() {}, storage() {} })

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end() }
  const setState = /^\/__plugin\/(enable|disable|remove)$/.exec(url.pathname)
  if (setState) {
    state = { enable: 'loaded', disable: 'disabled', remove: 'removed' }[setState[1]]
    res.writeHead(200, cors); return res.end(state)
  }
  if (url.pathname === '/api/v1/plugins') {
    const list = [{ id: 'settings.reaplugin', loaded: true }]
    if (state !== 'removed') list.push({ id: 'dye2.reaplugin', name: 'DYE2 for Bestpresso', loaded: state === 'loaded', autoLoad: state === 'loaded' })
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); return res.end(JSON.stringify(list))
  }
  const endpoint = /^\/api\/v1\/plugins\/dye2\.reaplugin\/([^/]+)$/.exec(url.pathname)
  if (endpoint) {
    if (state !== 'loaded') { res.writeHead(404, cors); return res.end('plugin not loaded') }
    const out = await plugin.__httpRequestHandler({ requestId: '1', endpoint: endpoint[1], method: req.method, headers: {}, body: null, query: Object.fromEntries(url.searchParams) })
    res.writeHead(out.status, { ...cors, ...out.headers }); return res.end(out.body)
  }
  if (url.pathname.startsWith('/api/')) { res.writeHead(404, cors); return res.end('{}') }
  res.writeHead(404, cors); res.end()
}).listen(8080, '127.0.0.1', () => console.log('mock decaid api on :8080'))

createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  let file = normalize(join(SKIN_DIR, url.pathname === '/' ? 'index.html' : url.pathname))
  if (!file.startsWith(normalize(SKIN_DIR)) || !existsSync(file) || statSync(file).isDirectory()) file = join(SKIN_DIR, 'index.html')
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(3000, '127.0.0.1', () => console.log('mock skin server on :3000'))
