#!/usr/bin/env python3
"""
Stan Store Course Downloader - Simple Direct Access
Uses the authenticated URLs directly
"""

import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, Page

# Your authenticated course URLs
COURSE_URLS = [
    "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310",
    "https://stan.store/course/521f8a82-0edf-4b05-92e6-c6bf3020707c?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzI3LCJleHAiOjE3NTk4NTUxMjd9.p3liXD124CIeoITgxT0IJUVf_FwhM1kaOqTK3uiJ2rM&store=thedankoe_store&lesson_id=782254",
    "https://stan.store/course/a5aba88c-c250-4a37-813d-c9a4b7ac83ac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzIyLCJleHAiOjE3NTk4NTUxMjJ9.WA9-yqjCyJA22sEMVKbN9tPHK_eDvWQqb6RZOlWmL28&store=thedankoe_store&lesson_id=779752",
    "https://stan.store/course/6f597cbe-ff13-4018-8597-db466f96818f?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTgxLCJleHAiOjE3NjQ5NTkzODF9.Z-dHhDq9RhqserN4ozDPBwZr9eTEccpmvneKLSXOfm8&store=thedankoe_store&lesson_id=8563196"
]

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/stan_store_downloads")


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


async def save_pdf(page: Page, output_path: Path):
    """Save current page as PDF."""
    await page.wait_for_load_state('networkidle', timeout=20000)
    await asyncio.sleep(3)  # Extra wait for dynamic content

    await page.pdf(
        path=str(output_path),
        format='A4',
        print_background=True,
        margin={'top': '20px', 'bottom': '20px', 'left': '20px', 'right': '20px'}
    )

    size_kb = output_path.stat().st_size / 1024
    print(f"    ✓ Saved: {output_path.name} ({size_kb:.1f} KB)")
    return size_kb


async def find_all_lessons(page: Page) -> list:
    """Find all lesson links on the course page."""
    await asyncio.sleep(4)  # Wait for page to fully load

    # Try to find lesson links using JavaScript
    lessons = await page.evaluate("""
        () => {
            const lessons = [];

            // Look for all clickable elements that might be lessons
            const selectors = [
                'a[href*="lesson_id"]',
                'button[data-lesson]',
                '[class*="lesson"]',
                '[class*="module"]',
                '[data-testid*="lesson"]'
            ];

            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const link = el.closest('a') || el;
                    const href = link.href || link.getAttribute('href') || '';
                    const text = (el.textContent || '').trim();

                    if (href && href.includes('lesson') && !lessons.find(l => l.href === href)) {
                        lessons.push({
                            href: href,
                            text: text.substring(0, 80)
                        });
                    }
                });
            }

            return lessons;
        }
    """)

    return lessons


async def download_course(page: Page, course_url: str, course_num: int):
    """Download a course and all its lessons."""
    print(f"\n{'='*70}")
    print(f"COURSE {course_num}")
    print(f"{'='*70}")

    try:
        # Go to the course URL
        print(f"  Loading course...")
        await page.goto(course_url, wait_until='networkidle', timeout=30000)

        # Get page info
        title = await page.title()
        print(f"  Page title: {title}")

        # Create course directory
        course_name = sanitize_filename(f"Course_{course_num}_{title[:30]}")
        course_dir = OUTPUT_DIR / course_name
        course_dir.mkdir(parents=True, exist_ok=True)
        print(f"  Output: {course_dir.name}/")

        # Find all lessons
        print(f"  Searching for lessons...")
        lessons = await find_all_lessons(page)

        if lessons and len(lessons) > 0:
            print(f"  Found {len(lessons)} lesson(s)")

            downloaded = 0
            for idx, lesson in enumerate(lessons, 1):
                try:
                    print(f"\n  Lesson {idx}/{len(lessons)}: {lesson['text'][:50]}")
                    await page.goto(lesson['href'], wait_until='networkidle', timeout=30000)

                    filename = f"{str(idx).zfill(3)}_{sanitize_filename(lesson['text'][:40])}.pdf"
                    output_path = course_dir / filename

                    await save_pdf(page, output_path)
                    downloaded += 1

                except Exception as e:
                    print(f"    ✗ Error: {e}")
                    continue

            print(f"\n  ✓ Downloaded {downloaded}/{len(lessons)} lessons")
            return downloaded

        else:
            # No lessons found - save the main page
            print(f"  No lessons detected - saving main page...")
            output_path = course_dir / "001_course_page.pdf"
            await save_pdf(page, output_path)
            return 1

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return 0


async def main():
    """Main function."""
    print("\nStan Store Course Downloader")
    print("=" * 70)
    print(f"Downloading {len(COURSE_URLS)} courses...")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        # Launch browser (headless=False so you can see progress)
        print("\nLaunching browser...")
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        page = await context.new_page()

        try:
            total = 0
            for idx, url in enumerate(COURSE_URLS, 1):
                count = await download_course(page, url, idx)
                total += count
                await asyncio.sleep(2)  # Pause between courses

            print(f"\n{'='*70}")
            print(f"✓ DOWNLOAD COMPLETE!")
            print(f"{'='*70}")
            print(f"Total files downloaded: {total}")
            print(f"Location: {OUTPUT_DIR}")
            print(f"{'='*70}\n")

            # Keep browser open briefly
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
    asyncio.run(main())
