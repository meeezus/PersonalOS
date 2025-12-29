#!/usr/bin/env python3
"""
Debug script to understand the page structure
"""

import asyncio
from playwright.async_api import async_playwright

COURSE_URL = "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310"


async def main():
    """Debug the page structure."""
    print("Debugging page structure...")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        try:
            print("Loading page...")
            await page.goto(COURSE_URL, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(5)  # Extra wait

            print("\nPage Analysis:")
            print("-" * 70)

            # Get comprehensive page info
            info = await page.evaluate("""
                () => {
                    const result = {
                        title: document.title,
                        allLinks: [],
                        buttons: [],
                        clickableElements: [],
                        lessonElements: []
                    };

                    // Get ALL links
                    document.querySelectorAll('a').forEach(link => {
                        result.allLinks.push({
                            href: link.href,
                            text: link.textContent.trim().substring(0, 60),
                            classes: link.className
                        });
                    });

                    // Get all buttons
                    document.querySelectorAll('button').forEach(btn => {
                        result.buttons.push({
                            text: btn.textContent.trim().substring(0, 60),
                            classes: btn.className
                        });
                    });

                    // Get all clickable elements (with onclick or cursor:pointer)
                    document.querySelectorAll('[onclick], [class*="clickable"], [class*="lesson"], [class*="module"]').forEach(el => {
                        result.clickableElements.push({
                            tag: el.tagName,
                            text: el.textContent.trim().substring(0, 60),
                            classes: el.className
                        });
                    });

                    // Look for anything with "lesson" in the class or id
                    document.querySelectorAll('[class*="lesson"], [id*="lesson"], [data-lesson]').forEach(el => {
                        result.lessonElements.push({
                            tag: el.tagName,
                            text: el.textContent.trim().substring(0, 80),
                            classes: el.className,
                            id: el.id
                        });
                    });

                    return result;
                }
            """)

            print(f"Title: {info['title']}\n")

            print(f"ALL LINKS ({len(info['allLinks'])}):")
            for i, link in enumerate(info['allLinks'][:30], 1):
                print(f"  {i}. [{link['text']}]")
                print(f"      URL: {link['href'][:100]}")
                if link['classes']:
                    print(f"      Classes: {link['classes'][:60]}")
                print()

            print(f"\nBUTTONS ({len(info['buttons'])}):")
            for i, btn in enumerate(info['buttons'][:20], 1):
                print(f"  {i}. {btn['text']}")
                if btn['classes']:
                    print(f"      Classes: {btn['classes'][:60]}")

            print(f"\nCLICKABLE/LESSON ELEMENTS ({len(info['clickableElements'])}):")
            for i, el in enumerate(info['clickableElements'][:20], 1):
                print(f"  {i}. <{el['tag']}> {el['text']}")
                if el['classes']:
                    print(f"      Classes: {el['classes'][:60]}")

            print(f"\nELEMENTS WITH 'LESSON' ({len(info['lessonElements'])}):")
            for i, el in enumerate(info['lessonElements'][:20], 1):
                print(f"  {i}. <{el['tag']}> {el['text']}")
                if el['classes']:
                    print(f"      Classes: {el['classes'][:60]}")
                if el['id']:
                    print(f"      ID: {el['id']}")

            print("\n" + "=" * 70)
            print("Browser will stay open for 60 seconds for manual inspection...")
            print("Look at the sidebar on the right and use DevTools to inspect the lesson links")
            print("=" * 70)

            await asyncio.sleep(60)

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
