// Plugin slot loader, copied into the Bestpresso fork by patches/bestpresso/03-loader.mjs.
//
// Shows a button next to Sleep only while the DYE2 plugin is installed and loaded in Decaid.
// The skin owns an empty <span id="plugin-slot-dye2">; the button itself is drawn by a small
// script served from the plugin, so changing the button never needs a skin rebuild.

const PLUGIN_ID = 'dye2.reaplugin'
const SCRIPT_ENDPOINT = 'bestpresso-button'
const SLOT_ID = 'plugin-slot-dye2'
const POLL_MS = 30_000

interface PluginInfo { id: string; loaded?: boolean }
interface SlotApi { mount: (slot: HTMLElement, options: { apiBase: string }) => void }
type SlotWindow = Window & { __bestpressoDye2?: SlotApi }

export async function isPluginLoaded(apiBase: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(`${apiBase}/plugins`, { cache: 'no-store' })
    if (!response.ok) return false
    const plugins = (await response.json()) as PluginInfo[]
    const plugin = Array.isArray(plugins) ? plugins.find((item) => item.id === PLUGIN_ID) : undefined
    return Boolean(plugin) && plugin?.loaded !== false
  } catch {
    return false
  }
}

export function initPluginSlots(apiBase: string): () => void {
  let enabled = false
  let scriptState: 'idle' | 'loading' | 'ready' = 'idle'
  let stopped = false

  const render = () => {
    const slot = document.getElementById(SLOT_ID)
    if (!slot) return
    if (!enabled) {
      if (slot.firstChild) slot.replaceChildren()
      return
    }
    if (scriptState !== 'ready' || slot.firstChild) return
    const api = (window as SlotWindow).__bestpressoDye2
    if (api) api.mount(slot, { apiBase })
  }

  const loadScript = () => {
    if (scriptState !== 'idle') return
    scriptState = 'loading'
    const script = document.createElement('script')
    script.src = `${apiBase}/plugins/${PLUGIN_ID}/${SCRIPT_ENDPOINT}?t=${Date.now()}`
    script.async = true
    script.onload = () => { scriptState = 'ready'; render() }
    script.onerror = () => { scriptState = 'idle'; script.remove() }
    document.head.appendChild(script)
  }

  const refresh = async () => {
    const next = await isPluginLoaded(apiBase)
    if (stopped) return
    enabled = next
    if (enabled) loadScript()
    render()
  }

  // The slot lives inside React-owned markup and can be re-created (for example after the
  // sleep screen), so re-render whenever the DOM changes.
  const observer = new MutationObserver(render)
  observer.observe(document.body, { childList: true, subtree: true })
  const timer = window.setInterval(refresh, POLL_MS)
  const onVisible = () => { if (document.visibilityState === 'visible') void refresh() }
  document.addEventListener('visibilitychange', onVisible)
  void refresh()

  return () => {
    stopped = true
    observer.disconnect()
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
