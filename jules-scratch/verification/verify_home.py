from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5000")
    page.wait_for_selector('"Persahabatan itu adalah tempat saling berbagi rasa sakit."')
    page.screenshot(path="jules-scratch/verification/home_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
