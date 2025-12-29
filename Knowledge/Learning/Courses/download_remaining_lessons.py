#!/usr/bin/env python3
"""
Download remaining Digital Economics lessons starting from Minimum Viable Offer
"""

import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright

# Course base URL components
COURSE_ID = "d3724f78-f12c-4f80-8512-dd6aa2223cac"
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48"
STORE = "thedankoe_store"

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/Digital_Economics")

# Remaining lessons from Module 6 onwards (starting at lesson 34)
# I'll start by sequentially trying lesson IDs to find all remaining lessons
# Based on the pattern, lesson IDs seem to increment

START_LESSON_NUM = 34
STARTING_LESSON_ID = 783551  # Estimate - we'll discover the actual IDs


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


def build_lesson_url(lesson_id: int) -> str:
    """Build the full URL for a lesson."""
    return f"https://stan.store/course/{COURSE_ID}?token={TOKEN}&store={STORE}&lesson_id={lesson_id}"


async def get_lesson_title(page) -> str:
    """Try to get the lesson title from the page."""
    try:
        await asyncio.sleep(3)

        # Try multiple selectors
        title = await page.evaluate("""
            () => {
                // Try to find title in various places
                const h1 = document.querySelector('h1');
                if (h1 && h1.textContent.trim() && h1.textContent.trim() !== '@thedankoe') {
                    return h1.textContent.trim();
                }

                const h2 = document.querySelector('h2');
                if (h2 && h2.textContent.trim()) {
                    return h2.textContent.trim();
                }

                // Try data attributes
                const titleEl = document.querySelector('[data-lesson-title], [class*="lesson-title"]');
                if (titleEl) {
                    return titleEl.textContent.trim();
                }

                return null;
            }
        """)

        return title if title else None

    except:
        return None


async def save_lesson_pdf(page, lesson_title: str, lesson_num: int, output_dir: Path):
    """Save the current lesson as a PDF."""
    await page.wait_for_load_state('networkidle', timeout=20000)
    await asyncio.sleep(4)

    filename = f"{str(lesson_num).zfill(2)}_{sanitize_filename(lesson_title)}.pdf"
    output_path = output_dir / filename

    await page.pdf(
        path=str(output_path),
        format='A4',
        print_background=True,
        margin={'top': '20px', 'bottom': '20px', 'left': '20px', 'right': '20px'}
    )

    size_kb = output_path.stat().st_size / 1024
    print(f"  ✓ Saved: {filename} ({size_kb:.1f} KB)")
    return True


async def discover_and_download():
    """Discover remaining lessons by trying sequential IDs."""
    print("\nDigital Economics - Remaining Lessons Downloader")
    print("=" * 70)
    print("Discovering and downloading remaining lessons...")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        page = await context.new_page()

        try:
            downloaded = 0
            lesson_num = START_LESSON_NUM
            consecutive_failures = 0
            max_failures = 10

            # Start from the next lesson ID after our last one (783550)
            current_id = 783551
            max_id = 784000  # Safety limit

            print(f"\nSearching for lessons starting from ID {current_id}...\n")

            while current_id < max_id and consecutive_failures < max_failures:
                try:
                    url = build_lesson_url(current_id)

                    # Try to load the lesson
                    response = await page.goto(url, wait_until='networkidle', timeout=30000)

                    # Check if page loaded successfully
                    if response.status != 200:
                        consecutive_failures += 1
                        current_id += 1
                        continue

                    # Try to get lesson title
                    lesson_title = await get_lesson_title(page)

                    if lesson_title and len(lesson_title) > 2:
                        # Valid lesson found!
                        consecutive_failures = 0
                        print(f"\nLesson {lesson_num}: {lesson_title} (ID: {current_id})")

                        # Save as PDF
                        await save_lesson_pdf(page, lesson_title, lesson_num, OUTPUT_DIR)
                        downloaded += 1
                        lesson_num += 1
                    else:
                        consecutive_failures += 1

                    current_id += 1

                except Exception as e:
                    print(f"  × Error with ID {current_id}: {str(e)[:50]}")
                    consecutive_failures += 1
                    current_id += 1
                    continue

            print(f"\n{'='*70}")
            print(f"✓ DISCOVERY COMPLETE!")
            print(f"{'='*70}")
            print(f"Downloaded: {downloaded} additional lessons")
            print(f"Total lessons in course: {lesson_num - 1}")
            print(f"Location: {OUTPUT_DIR}")
            print(f"{'='*70}\n")

            print("Browser closing in 5 seconds...")
            await asyncio.sleep(5)

        except Exception as e:
            print(f"\n✗ Fatal error: {e}")
            import traceback
            traceback.print_exc()
            await asyncio.sleep(10)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(discover_and_download())
