import { join } from 'node:path'
import { editJson } from '../../scripts/lib/patch.mjs'

// Same plugin id and version as upstream DYE2, so enabling this build replaces stock DYE2 (same
// settings and data) and the version always matches the DYE2 release it was built from.
export function apply({ root, upstreamTag }) {
  editJson(join(root, 'dye2-plugin', 'manifest.src.json'), (manifest) => {
    manifest.name = 'DYE2 for Bestpresso'
    manifest.author = 'Decent Espresso (decentespresso/dye2), adapted by virusinducer'
    manifest.description = `${manifest.description} Based on DYE2 ${upstreamTag} by Decent Espresso, restyled for the Bestpresso skin by Hendri, with a button endpoint for the Bestpresso + DYE2 skin.`
    manifest.api.push({ id: 'bestpresso-button', type: 'http', data: {} })
  })
}
