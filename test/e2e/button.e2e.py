"""End-to-end check of the Bestpresso button, against the real built skin and plugin.

    python3 test/e2e/button.e2e.py            (expects mock-decaid.mjs already running)
"""
import sys
from urllib.request import urlopen, Request
from playwright.sync_api import sync_playwright

SKIN = "http://127.0.0.1:3000/"
API = "http://127.0.0.1:8080"
failures = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        failures.append(name)


def flip(action):
    urlopen(Request(f"{API}/__plugin/{action}", method="POST")).read()


def wait_count(page, selector, count, timeout=45000):
    try:
        page.wait_for_function(
            "([s, n]) => document.querySelectorAll(s).length === n", arg=[selector, count], timeout=timeout)
        return True
    except Exception:
        return False


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800}, locale="en-US")
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    BTN = "#plugin-slot-dye2 button.bp-dye2-btn"

    flip("enable")
    page.goto(SKIN)
    page.wait_for_selector("#plugin-slot-dye2", state="attached", timeout=30000)
    check("slot exists in the skin header", True)
    check("button appears while the plugin is loaded", wait_count(page, BTN, 1, 15000))

    box = page.locator(BTN).bounding_box()
    sleep = page.locator("nav[aria-label] > button").first.bounding_box()
    check("button sits to the right of Sleep", box is not None and sleep is not None and box["x"] > sleep["x"],
          f"{box} vs {sleep}")
    check("button is inside the viewport", box is not None and 0 <= box["x"] and box["x"] + box["width"] <= 1280, str(box))

    # Click: navigates to the DYE2 dashboard with a return URL back to the skin.
    requests = []
    page.on("request", lambda r: requests.append(r.url) if "/dashboard" in r.url else None)
    with page.expect_navigation(timeout=15000):
        page.locator(BTN).click()
    check("click opens the DYE2 dashboard", page.url.startswith(f"{API}/api/v1/plugins/dye2.reaplugin/dashboard"), page.url)
    check("return URL points back to the skin", "return=http%3A%2F%2F127.0.0.1%3A3000%2F" in page.url, page.url)

    # Disable: the button disappears without a reload once the poll or a visibility change runs.
    page.goto(SKIN)
    check("button is back after returning", wait_count(page, BTN, 1, 15000))
    flip("disable")
    page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
    check("button disappears after the plugin is disabled", wait_count(page, BTN, 0, 15000))
    flip("enable")
    page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
    check("button returns after the plugin is re-enabled", wait_count(page, BTN, 1, 15000))

    # Removed plugin: fresh load shows no button.
    flip("remove")
    page.goto(SKIN)
    page.wait_for_selector("#plugin-slot-dye2", state="attached", timeout=30000)
    page.wait_for_timeout(2500)
    check("no button when the plugin is not installed", page.locator(BTN).count() == 0)
    flip("enable")

    check("no uncaught page errors", not errors, "; ".join(errors[:3]))
    browser.close()

print("\n%d failure(s)" % len(failures))
sys.exit(1 if failures else 0)
