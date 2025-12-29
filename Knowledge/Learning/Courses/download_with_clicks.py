#!/usr/bin/env python3
"""
Download Digital Economics by clicking through lessons
"""

import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, Page

COURSE_URL = "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310"

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/Digital_Economics")


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


async def save_lesson_pdf(page: Page, lesson_title: str, lesson_num: int, output_dir: Path):
    """Save the current lesson as a PDF."""
    await page.wait_for_load_state('networkidle', timeout=20000)
    await asyncio.sleep(4)  # Wait for dynamic content

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


async def click_next_lesson(page: Page):
    """Try to click the next lesson button/link."""
    try:
        # Wait a bit for UI to settle
        await asyncio.sleep(2)

        # Try multiple strategies to find and click next lesson
        selectors = [
            'button:has-text("Next")',
            'a:has-text("Next")',
            '[aria-label*="next" i]',
            '[class*="next" i]',
            'button[class*="next"]',
            # Try to find the next lesson in a list
            '.lesson-item.active ~ .lesson-item',
            '[class*="lesson"][class*="active"] ~ [class*="lesson"]'
        ]

        for selector in selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    await element.click(timeout=3000)
                    print("    → Clicked next lesson")
                    await asyncio.sleep(3)
                    return True
            except:
                continue

        return False

    except Exception as e:
        print(f"    Warning: Could not find next button: {e}")
        return False


async def get_current_lesson_title(page: Page) -> str:
    """Get the current lesson title from the page."""
    try:
        await asyncio.sleep(2)

        # Try multiple selectors to find the lesson title
        selectors = [
            'h1',
            'h2',
            '[class*="lesson"][class*="title"]',
            '[class*="title"]',
            '[data-lesson-title]'
        ]

        for selector in selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    title = await element.text_content(timeout=2000)
                    if title and len(title.strip()) > 2:
                        return title.strip()
            except:
                continue

        return "Unknown Lesson"

    except Exception as e:
        print(f"    Warning: Could not get lesson title: {e}")
        return "Unknown Lesson"


async def main():
    """Main function."""
    print("\nDigital Economics Course Downloader")
    print("=" * 70)
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        print("\nLaunching browser...")
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        page = await context.new_page()

        try:
            print(f"\nLoading first lesson...")
            await page.goto(COURSE_URL, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(5)  # Extra wait for React app

            print(f"\n{'='*70}")
            print("Starting download process...")
            print("The script will click through each lesson automatically")
            print(f"{'='*70}\n")

            lesson_num = 1
            downloaded = 0
            max_lessons = 50  # Safety limit

            while lesson_num <= max_lessons:
                try:
                    # Get current lesson title
                    lesson_title = await get_current_lesson_title(page)
                    print(f"\nLesson {lesson_num}: {lesson_title}")

                    # Save current lesson
                    success = await save_lesson_pdf(page, lesson_title, lesson_num, OUTPUT_DIR)

                    if success:
                        downloaded += 1

                    # Try to go to next lesson
                    has_next = await click_next_lesson(page)

                    if not has_next:
                        print("\n  → No more lessons found!")
                        break

                    lesson_num += 1

                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    break

            print(f"\n{'='*70}")
            print(f"✓ DOWNLOAD COMPLETE!")
            print(f"{'='*70}")
            print(f"Downloaded: {downloaded} lessons")
            print(f"Location: {OUTPUT_DIR}")
            print(f"{'='*70}\n")

            print("Browser closing in 5 seconds...")
            await asyncio.sleep(5)

        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()

            print("\nKeeping browser open for 30 seconds for debugging...")
            await asyncio.sleep(30)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
