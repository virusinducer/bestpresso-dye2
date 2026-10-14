import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { appendOnce, replaceOnce } from '../scripts/lib/patch.mjs'

const tmp = () => mkdtempSync(join(tmpdir(), 'patch-'))

test('replaceOnce replaces a single match and keeps $ patterns literal', () => {
  const file = join(tmp(), 'a.txt')
  writeFileSync(file, 'one TARGET two')
  replaceOnce(file, 'TARGET', 'x$&y')
  assert.equal(readFileSync(file, 'utf8'), 'one x$&y two')
})

test('replaceOnce refuses a missing or duplicated anchor', () => {
  const file = join(tmp(), 'a.txt')
  writeFileSync(file, 'A A')
  assert.throws(() => replaceOnce(file, 'A', 'B'), /matched 2 times/)
  assert.throws(() => replaceOnce(file, 'Z', 'B'), /matched 0 times/)
})

test('appendOnce refuses to append twice', () => {
  const file = join(tmp(), 'a.css')
  writeFileSync(file, 'body{}')
  appendOnce(file, '.plugin-slot{', '.plugin-slot{display:contents}\n')
  assert.throws(() => appendOnce(file, '.plugin-slot{', 'again'), /already contains/)
})
