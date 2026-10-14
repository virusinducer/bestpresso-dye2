import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { replaceOnce } from '../../scripts/lib/patch.mjs'

export function apply({ root, repoRoot }) {
  copyFileSync(join(repoRoot, 'assets', 'skin', 'pluginSlot.ts'), join(root, 'src', 'pluginSlot.ts'))
  const main = join(root, 'src', 'main.tsx')
  replaceOnce(
    main,
    "import App from './App.tsx'",
    "import App from './App.tsx'\nimport { getDecaidEndpoints } from './api/decaid/config.ts'\nimport { initPluginSlots } from './pluginSlot.ts'",
    'App import',
  )
  replaceOnce(
    main,
    "createRoot(document.getElementById('root')!)",
    "initPluginSlots(getDecaidEndpoints().apiBase)\n\ncreateRoot(document.getElementById('root')!)",
    'createRoot call',
  )
}
