import { join } from 'node:path'
import { appendOnce, replaceOnce } from '../../scripts/lib/patch.mjs'

// An empty React-owned span right after the Sleep button. The plugin draws the button into it.
export function apply({ root }) {
  replaceOnce(
    join(root, 'src', 'app', 'AppShell.tsx'),
    'onClick={onSleep}><img src={sleep} alt="" /></button>',
    'onClick={onSleep}><img src={sleep} alt="" /></button><span id="plugin-slot-dye2" className="plugin-slot" />',
    'Sleep button',
  )
  appendOnce(join(root, 'src', 'styles', 'index.css'), '.plugin-slot{', '.plugin-slot{display:contents}\n')
}
