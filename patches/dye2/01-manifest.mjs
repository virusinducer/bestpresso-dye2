import { join } from 'node:path'
import { editJson } from '../../scripts/lib/patch.mjs'

// Same plugin id as upstream, so enabling this build replaces stock DYE2. The version is our own
// release number (1.0.N) because Decaid refuses downgrades and upstream versions are lower.
export function apply({ root, upstreamTag, pluginVersion }) {
  editJson(join(root, 'dye2-plugin', 'manifest.src.json'), (manifest) => {
    manifest.name = 'Streamline/DYE2 (Bestpresso edition)'
    manifest.version = pluginVersion
    manifest.description = `${manifest.description} Built from decentespresso/dye2 ${upstreamTag} with a Bestpresso button endpoint.`
    manifest.api.push({ id: 'bestpresso-button', type: 'http', data: {} })
  })
  editJson(join(root, 'dye2-plugin', 'package.json'), (pkg) => { pkg.version = pluginVersion })
}
