import { join } from 'node:path'
import { editJson } from '../../scripts/lib/patch.mjs'

// Give the fork its own skin id so it installs next to stock Bestpresso instead of replacing it.
// The version is left exactly as upstream Bestpresso has it.
export const SKIN_ID = 'bestpresso-dye'

export function apply({ root }) {
  editJson(join(root, 'public', 'skin-manifest.json'), (manifest) => {
    manifest.id = SKIN_ID
    manifest.name = 'Bestpresso + DYE2'
    manifest.author = 'Hendri (xinghendri/bestpresso), DYE2 button by virusinducer'
    manifest.description = `${manifest.description}. Adds a DYE2 button next to Sleep while the DYE2 plugin is loaded.`
    manifest.repository = 'https://github.com/virusinducer/bestpresso-dye2-skin'
    manifest.upstream = 'https://github.com/xinghendri/bestpresso'
  })
}
