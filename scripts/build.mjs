#!/usr/bin/env node
// Build the patched Bestpresso skin and the patched DYE2 plugin from upstream tags.
//
//   node scripts/build.mjs --bestpresso v0.1.32-patch005 --dye2 v0.1.19 --build 1 [--out out] [--skip-tests]
//
// Output (in --out):
//   skin/                                the built skin (index.html, assets, skin-manifest.json)
//   dye2.reaplugin-v<version>.zip        the plugin zip (the only zip a plugin release may carry)
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({
  options: {
    bestpresso: { type: 'string' },
    dye2: { type: 'string' },
    build: { type: 'string' },
    out: { type: 'string', default: 'out' },
    work: { type: 'string', default: '.work' },
    'skip-tests': { type: 'boolean', default: false },
  },
})
for (const key of ['bestpresso', 'dye2', 'build']) {
  if (!values[key]) throw new Error(`missing --${key}`)
}

const buildNumber = Number(values.build)
const pluginVersion = `1.0.${buildNumber}`
const out = resolve(values.out)
const work = resolve(values.work)

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })

function clone(repo, tag, dir) {
  rmSync(dir, { recursive: true, force: true })
  run('git', ['clone', '--depth', '1', '--branch', tag, `https://github.com/${repo}`, dir])
}

async function applyPatches(group, context) {
  const dir = join(repoRoot, 'patches', group)
  const files = readdirSync(dir).filter((name) => name.endsWith('.mjs')).sort()
  for (const file of files) {
    console.log(`patch ${group}/${file}`)
    const mod = await import(pathToFileURL(join(dir, file)).href)
    await mod.apply(context)
  }
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
mkdirSync(work, { recursive: true })

// Skin
const skinRoot = join(work, 'bestpresso')
clone('xinghendri/bestpresso', values.bestpresso, skinRoot)
await applyPatches('bestpresso', { root: skinRoot, repoRoot, upstreamTag: values.bestpresso, buildNumber })
run('npm', ['ci', '--silent'], skinRoot)
if (!values['skip-tests']) run('npm', ['test', '--silent'], skinRoot)
run('npm', ['run', '-s', 'build'], skinRoot)
cpSync(join(skinRoot, 'dist'), join(out, 'skin'), { recursive: true })

// Plugin
const dye2Root = join(work, 'dye2')
clone('decentespresso/dye2', values.dye2, dye2Root)
await applyPatches('dye2', { root: dye2Root, repoRoot, upstreamTag: values.dye2, pluginVersion })
const pluginDir = join(dye2Root, 'dye2-plugin')
run('npm', ['ci', '--silent'], pluginDir)
if (!values['skip-tests']) run('npm', ['test', '--silent'], pluginDir)
run('npm', ['run', '-s', 'build'], pluginDir)

const pluginOut = join(dye2Root, 'dye2.reaplugin')
const zipName = `dye2.reaplugin-v${pluginVersion}.zip`
run('zip', ['-qr', '-X', join(out, zipName), 'dye2.reaplugin'], dye2Root)

// Sanity checks before anything is published.
const manifest = JSON.parse(readFileSync(join(pluginOut, 'manifest.json'), 'utf8'))
if (manifest.id !== 'dye2.reaplugin') throw new Error(`unexpected plugin id ${manifest.id}`)
if (manifest.version !== pluginVersion) throw new Error(`manifest version ${manifest.version} != ${pluginVersion}`)
if (!manifest.api.some((entry) => entry.id === 'bestpresso-button')) throw new Error('button endpoint missing from manifest')
if (!readFileSync(join(pluginOut, 'plugin.js'), 'utf8').includes('__bestpressoDye2')) throw new Error('button script missing from plugin.js')
const skinManifest = JSON.parse(readFileSync(join(out, 'skin', 'skin-manifest.json'), 'utf8'))
if (skinManifest.id !== 'bestpresso-dye') throw new Error(`unexpected skin id ${skinManifest.id}`)
if (!existsSync(join(out, 'skin', 'index.html'))) throw new Error('skin index.html missing')
if (!readFileSync(join(out, 'skin', 'index.html'), 'utf8').length) throw new Error('empty index.html')
const skinJs = readdirSync(join(out, 'skin', 'assets')).filter((name) => name.endsWith('.js'))
const hasSlot = skinJs.some((name) => readFileSync(join(out, 'skin', 'assets', name), 'utf8').includes('plugin-slot-dye2'))
if (!hasSlot) throw new Error('plugin slot missing from the built skin')

console.log(`built plugin ${pluginVersion} (${zipName}) and skin ${skinManifest.version}`)
