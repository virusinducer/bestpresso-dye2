# bestpresso-dye2

A DYE2 button for the [Bestpresso](https://github.com/xinghendri/bestpresso) Decaid skin, delivered as
a Decaid plugin plus a patched skin, rebuilt automatically whenever either upstream moves.

- **Enable the plugin and a DYE2 button appears next to Sleep.** Disable or remove it and the button
  goes away (within 30 seconds, or at once when the app returns to the foreground).
- **Tapping it opens DYE2** with a return link, so you land back in Bestpresso.
- **Bestpresso look for DYE2.** Dark theme, green accents and the Bestpresso-style value slider are applied
  to DYE2 at build time (`patches/dye2/03-restyle.mjs`, rules in `assets/dye2/`).
- **Updates itself.** A daily workflow checks `xinghendri/bestpresso` and `decentespresso/dye2` for new
  tags (betas and patches included), rebuilds both, tests them and publishes.

## Install

Replace `<decaid-host>` with the machine Decaid runs on (`localhost` on the same device).

**1. Plugin** (Decaid tracks this repo's releases and updates it for you):

```
curl -X POST http://<decaid-host>:8080/api/v1/plugins/install/github-release \
  -H 'content-type: application/json' \
  -d '{"repo": "virusinducer/bestpresso-dye2"}'
```

**2. Skin** (installs from its own repo, `virusinducer/bestpresso-dye-skin`, which republishes each build as a release):

```
curl -X POST http://<decaid-host>:8080/api/v1/webui/skins/install/github-release \
  -H 'content-type: application/json' \
  -d '{"repo": "virusinducer/bestpresso-dye-skin"}'
curl -X PUT http://<decaid-host>:8080/api/v1/webui/skins/default \
  -H 'content-type: application/json' -d '{"skinId": "bestpresso-dye"}'
curl -X POST http://<decaid-host>:8080/api/v1/webui/server/stop
curl -X POST http://<decaid-host>:8080/api/v1/webui/server/start
```

In Decaid's screens: plugin screen `virusinducer/bestpresso-dye2`, skin screen `virusinducer/bestpresso-dye-skin`.

The skin installs as `bestpresso-dye` ("Bestpresso + DYE2"), next to stock Bestpresso. The plugin
("DYE2 for Bestpresso") keeps the id `dye2.reaplugin`, so it replaces stock DYE2 (same settings and data).

## How it works

- The skin patch adds an empty `<span id="plugin-slot-dye2">` after the Sleep button and a small
  loader. The loader asks Decaid `GET /api/v1/plugins` whether `dye2.reaplugin` is loaded.
- Only then does it load `/api/v1/plugins/dye2.reaplugin/bestpresso-button`, a script served by the
  plugin, which draws the button. Button changes ship through plugin updates, not skin rebuilds.
- Patches live in `patches/` and fail the build if an upstream change moves their anchor, so a
  broken update is never published silently. The last good release stays in place and an issue is opened.

## Versions

- Plugin releases are `v1.0.N`. The version is our own because Decaid refuses downgrades and upstream
  DYE2 numbers are lower. The upstream DYE2 tag is in the release notes.
- A release carries exactly one zip, as Decaid requires. The skin lives on the `dist` branch.
- `upstream.json` records the upstream tags the last release was built from.

## Development

```
npm test                                   # unit tests
node scripts/build.mjs --bestpresso v0.1.32-patch005 --dye2 v0.1.19 --build 1 --out out
SKIN_DIR=$PWD/out/skin PLUGIN_JS=$PWD/.work/dye2/dye2.reaplugin/plugin.js node test/e2e/mock-decaid.mjs &
python3 test/e2e/button.e2e.py             # needs playwright + chromium
```

## Credits and licensing

Bestpresso is by Hendri (xinghendri), who has said it is open source; the repository does not yet carry
a LICENSE file. DYE2 and Decaid are by Decent Espresso. This repository contains only patches,
the button and the build tooling, and fetches upstream sources at build time.
