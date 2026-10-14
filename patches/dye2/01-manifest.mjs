import { join } from 'node:path'
import { editJson } from '../../scripts/lib/patch.mjs'

// Same plugin id and release version as upstream DYE2, so enabling this build replaces stock DYE2 (same
// settings and data) and the version always matches the DYE2 release it was built from.
export function apply({ root, upstreamTag, pluginVersion }) {
  editJson(join(root, 'dye2-plugin', 'manifest.src.json'), (manifest) => {
    manifest.name = 'DYE2 for Bestpresso'
    manifest.version = pluginVersion // the DYE2 tag, as DYE2's own release workflow does
    manifest.author = 'Mark Chau (decentespresso/dye2), adapted by virusinducer'
    manifest.description = `${manifest.description} Based on DYE2 ${upstreamTag} by Mark Chau, restyled for the Bestpresso skin by Hendri, with a button endpoint for the Bestpresso + DYE2 skin.`
    manifest.api.push({ id: 'bestpresso-button', type: 'http', data: {} })
  })
  editJson(join(root, 'dye2-plugin', 'package.json'), (pkg) => { pkg.version = pluginVersion })
}
