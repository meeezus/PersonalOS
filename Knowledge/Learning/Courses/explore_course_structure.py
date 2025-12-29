#!/usr/bin/env python3
"""
Explore Stan Store course structure to understand the layout
"""

import asyncio
from playwright.async_api import async_playwright

TEST_URL = "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310"


async def main():
    """Explore the course page structure."""
    print("Exploring Stan Store course structure...")
    print("=" * 60)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        try:
            print(f"Loading: {TEST_URL}\n")
            await page.goto(TEST_URL, wait_until='networkidle', timeout=30000)

            # Wait for dynamic content
            await asyncio.sleep(5)

            print("Page Structure Analysis:")
            print("-" * 60)

            # Get page title
            title = await page.title()
            print(f"Page Title: {title}\n")

            # Look for various common selectors
            selectors_to_try = [
                ("Links with 'lesson'", "a[href*='lesson']"),
                ("All links", "a"),
                ("Buttons", "button"),
                ("Navigation", "nav a"),
                ("List items with links", "li a"),
                ("Divs with 'lesson' class", "div[class*='lesson']"),
                ("Divs with 'course' class", "div[class*='course']"),
                ("Video elements", "video"),
                ("iframes", "iframe"),
            ]

            for name, selector in selectors_to_try:
                try:
                    elements = await page.locator(selector).all()
                    if elements:
                        print(f"\n{name} ({selector}): Found {len(elements)}")

                        # Show first few
                        for i, elem in enumerate(elements[:5]):
                            try:
                                text = await elem.text_content(timeout=1000)
                                href = await elem.get_attribute('href')
                                if text and text.strip():
                                    display_text = text.strip()[:60]
                                    if href:
                                        print(f"  {i+1}. {display_text} -> {href[:80]}")
                                    else:
                                        print(f"  {i+1}. {display_text}")
                            except:
                                pass
                except Exception as e:
                    print(f"\n{name}: Not found or error")

            # Get all links
            print("\n" + "=" * 60)
            print("All hrefs on page:")
            print("-" * 60)
            all_links = await page.evaluate("""
                () => {
                    const links = Array.from(document.querySelectorAll('a'));
                    return links.map(a => ({
                        href: a.href,
                        text: a.textContent.trim().substring(0, 50)
                    })).filter(l => l.href);
                }
            """)

            for i, link in enumerate(all_links[:20], 1):
                print(f"{i}. {link['text'][:40]} -> {link['href'][:80]}")

            print("\n" + "=" * 60)
            print("\nBrowser will stay open for 30 seconds so you can inspect...")
            print("Look for lesson navigation, course curriculum, or lesson list")
            await asyncio.sleep(30)

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
