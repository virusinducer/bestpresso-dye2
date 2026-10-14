// Ordering for upstream tags such as v0.1.19, v0.1.32, v0.1.32-patch005, v0.1.33-beta2.
// Beta/rc sort before the release, patches after it.
export function tagKey(tag) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-.]?(alpha|beta|rc|patch)\.?(\d+)?)?/i.exec(tag)
  if (!match) return null
  const stage = { alpha: -3, beta: -2, rc: -1, patch: 1 }[(match[4] || '').toLowerCase()] ?? 0
  return [Number(match[1]), Number(match[2]), Number(match[3]), stage, Number(match[5] || 0)]
}

export function compareTags(a, b) {
  const ka = tagKey(a)
  const kb = tagKey(b)
  if (!ka || !kb) return (ka ? 1 : 0) - (kb ? 1 : 0)
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i]
  return 0
}

export function latestTag(tags) {
  const valid = tags.filter((tag) => tagKey(tag))
  return valid.sort(compareTags).at(-1) ?? null
}
