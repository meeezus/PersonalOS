#!/usr/bin/env python3
"""
Capture page HTML and screenshot
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

COURSE_URL = "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310"

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses")


async def main():
    """Capture page content."""
    print("Capturing page...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        try:
            await page.goto(COURSE_URL, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(5)

            # Save screenshot
            screenshot_path = OUTPUT_DIR / "page_screenshot.png"
            await page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"Screenshot saved: {screenshot_path}")

            # Save HTML
            html = await page.content()
            html_path = OUTPUT_DIR / "page_content.html"
            html_path.write_text(html, encoding='utf-8')
            print(f"HTML saved: {html_path}")

            # Print simple link list
            links = await page.query_selector_all('a')
            print(f"\nFound {len(links)} links total")

            print("\nBrowser will stay open for 60 seconds...")
            print("Please manually inspect the sidebar and right-click on a lesson link,")
            print("then select 'Inspect' to see the HTML structure.")
            await asyncio.sleep(60)

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
