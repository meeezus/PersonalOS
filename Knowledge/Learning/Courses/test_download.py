#!/usr/bin/env python3
"""
Test script to download one course first
"""

import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, Page

# Test with just one course
TEST_URL = "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310"

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/test_downloads")


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


async def main():
    """Test download function."""
    print("Stan Store Course Downloader - TEST MODE")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()

        try:
            print(f"Navigating to: {TEST_URL}")
            await page.goto(TEST_URL, wait_until='networkidle', timeout=30000)

            # Wait a bit for dynamic content
            await asyncio.sleep(3)

            # Try to get page title
            try:
                title = await page.title()
                print(f"Page title: {title}")
            except:
                print("Could not get page title")

            # Save as PDF
            output_file = OUTPUT_DIR / "test_lesson.pdf"
            print(f"Saving PDF to: {output_file}")

            await page.pdf(
                path=str(output_file),
                format='A4',
                print_background=True,
                margin={'top': '20px', 'bottom': '20px', 'left': '20px', 'right': '20px'}
            )

            print(f"\n✓ Success! PDF saved to: {output_file}")
            print(f"File size: {output_file.stat().st_size / 1024:.1f} KB")

        except Exception as e:
            print(f"\n✗ Error: {e}")
            raise
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
