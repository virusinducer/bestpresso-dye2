import { join } from 'node:path'
import { editJson } from '../../scripts/lib/patch.mjs'

// Give the fork its own skin id so it installs next to stock Bestpresso instead of replacing it.
export const SKIN_ID = 'bestpresso-dye'

export function apply({ root, upstreamTag, buildNumber }) {
  editJson(join(root, 'public', 'skin-manifest.json'), (manifest) => {
    manifest.id = SKIN_ID
    manifest.name = 'Bestpresso + DYE2'
    manifest.description = `${manifest.description}. Adds a DYE2 button next to Sleep while the DYE2 plugin is loaded.`
    manifest.version = `${upstreamTag.replace(/^v/, '')}-dye.${buildNumber}`
    manifest.repository = 'https://github.com/virusinducer/bestpresso-dye2'
    manifest.upstream = 'https://github.com/xinghendri/bestpresso'
  })
}
