from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the home page and take a screenshot
    page.goto("http://localhost:5000")
    page.screenshot(path="jules-scratch/verification/home.png")

    # Navigate to the login page and take a screenshot
    page.goto("http://localhost:5000/auth")
    page.screenshot(path="jules-scratch/verification/login.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
