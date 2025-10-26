
from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5000")
    try:
        # Wait for the manhwa cards to appear, which indicates the page is loaded
        page.wait_for_selector(".grid.grid-cols-3", timeout=60000)
    except TimeoutError:
        print("Timeout waiting for manhwa grid to appear. Taking a screenshot anyway.")

    page.screenshot(path="jules-scratch/verification/screenshot.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
