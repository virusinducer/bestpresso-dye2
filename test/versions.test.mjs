import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareTags, latestTag } from '../scripts/lib/versions.mjs'

test('patch tags sort after the release, betas before it', () => {
  assert.equal(latestTag(['v0.1.32', 'v0.1.32-patch001', 'v0.1.32-patch005', 'v0.1.31']), 'v0.1.32-patch005')
  assert.equal(latestTag(['v0.1.33-beta2', 'v0.1.33-beta1', 'v0.1.32-patch005']), 'v0.1.33-beta2')
  assert.equal(latestTag(['v0.1.33-rc1', 'v0.1.33-beta9', 'v0.1.33']), 'v0.1.33')
})

test('numeric segments compare as numbers, not strings', () => {
  assert.ok(compareTags('v0.1.9', 'v0.1.19') < 0)
  assert.ok(compareTags('v0.1.32-patch010', 'v0.1.32-patch009') > 0)
})

test('unparseable tags are ignored', () => {
  assert.equal(latestTag(['nightly', 'v0.1.2']), 'v0.1.2')
  assert.equal(latestTag(['nightly']), null)
})
