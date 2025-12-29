#!/usr/bin/env python3
"""
Stan Store Course Downloader - Auto Mode
Opens browser, waits 60 seconds for login, then downloads
"""

import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, Page

COURSE_URLS = [
    "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310",
    "https://stan.store/course/521f8a82-0edf-4b05-92e6-c6bf3020707c?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzI3LCJleHAiOjE3NTk4NTUxMjd9.p3liXD124CIeoITgxT0IJUVf_FwhM1kaOqTK3uiJ2rM&store=thedankoe_store&lesson_id=782254",
    "https://stan.store/course/a5aba88c-c250-4a37-813d-c9a4b7ac83ac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzIyLCJleHAiOjE3NTk4NTUxMjJ9.WA9-yqjCyJA22sEMVKbN9tPHK_eDvWQqb6RZOlWmL28&store=thedankoe_store&lesson_id=779752",
    "https://stan.store/course/6f597cbe-ff13-4018-8597-db466f96818f?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTgxLCJleHAiOjE3NjQ5NTkzODF9.Z-dHhDq9RhqserN4ozDPBwZr9eTEccpmvneKLSXOfm8&store=thedankoe_store&lesson_id=8563196"
]

OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/stan_store_downloads")
LOGIN_WAIT_TIME = 60  # seconds to wait for manual login


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


async def save_pdf(page: Page, output_path: Path, lesson_name: str = ""):
    """Save current page as PDF."""
    print(f"  Saving: {lesson_name if lesson_name else output_path.name}")

    await page.wait_for_load_state('networkidle', timeout=15000)
    await asyncio.sleep(2)

    await page.pdf(
        path=str(output_path),
        format='A4',
        print_background=True,
        margin={'top': '20px', 'bottom': '20px', 'left': '20px', 'right': '20px'}
    )
    print(f"  ✓ Saved: {output_path.name} ({output_path.stat().st_size / 1024:.1f} KB)")


async def get_lesson_links(page: Page) -> list:
    """Extract all lesson links from the current page."""
    try:
        await asyncio.sleep(3)

        lesson_links = await page.evaluate("""
            () => {
                const links = [];
                const allLinks = Array.from(document.querySelectorAll('a'));

                for (const link of allLinks) {
                    const href = link.href;
                    const text = link.textContent.trim();

                    if (href && (
                        href.includes('lesson_id') ||
                        href.includes('/lesson/') ||
                        text.toLowerCase().includes('lesson') ||
                        text.toLowerCase().includes('module') ||
                        text.toLowerCase().includes('chapter')
                    )) {
                        links.push({
                            href: href,
                            text: text
                        });
                    }
                }

                return links;
            }
        """)

        return lesson_links
    except Exception as e:
        print(f"  Warning: Could not extract lesson links: {e}")
        return []


async def download_course(page: Page, course_url: str, course_num: int):
    """Download all lessons from a single course."""
    print(f"\n{'='*70}")
    print(f"COURSE {course_num}: Processing...")
    print(f"{'='*70}")

    try:
        await page.goto(course_url, wait_until='networkidle', timeout=30000)
        await asyncio.sleep(3)

        title = await page.title()
        print(f"Page title: {title}")

        lesson_links = await get_lesson_links(page)

        if lesson_links:
            print(f"Found {len(lesson_links)} lesson link(s)")

            course_name = sanitize_filename(f"Course_{course_num}")
            course_dir = OUTPUT_DIR / course_name
            course_dir.mkdir(parents=True, exist_ok=True)

            downloaded = 0
            for idx, lesson in enumerate(lesson_links, 1):
                try:
                    print(f"\n  Lesson {idx}/{len(lesson_links)}: {lesson['text'][:50]}")
                    await page.goto(lesson['href'], wait_until='networkidle', timeout=30000)

                    lesson_filename = f"{str(idx).zfill(3)}_{sanitize_filename(lesson['text'][:50])}.pdf"
                    output_path = course_dir / lesson_filename

                    await save_pdf(page, output_path, lesson['text'])
                    downloaded += 1
                except Exception as e:
                    print(f"  ✗ Error downloading lesson: {e}")
                    continue

            print(f"\n✓ Course complete: {downloaded}/{len(lesson_links)} lessons downloaded")
            return downloaded
        else:
            print("No lesson navigation found - saving current page only")

            course_name = sanitize_filename(f"Course_{course_num}")
            course_dir = OUTPUT_DIR / course_name
            course_dir.mkdir(parents=True, exist_ok=True)

            output_path = course_dir / "001_main_page.pdf"
            await save_pdf(page, output_path)
            return 1

    except Exception as e:
        print(f"✗ Error processing course: {e}")
        return 0


async def main():
    """Main function."""
    print("Stan Store Course Downloader - Auto Mode")
    print("=" * 70)
    print(f"\nThe browser will open and wait {LOGIN_WAIT_TIME} seconds for you to:")
    print("1. Log in to Stan Store")
    print("2. Accept any cookie prompts")
    print("3. Navigate to your course dashboard if needed")
    print("\nAfter the wait, download will start automatically.")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()

        try:
            print("\nOpening Stan Store...")
            await page.goto("https://stan.store", wait_until='networkidle')

            print(f"\n{'='*70}")
            print(f"WAITING {LOGIN_WAIT_TIME} SECONDS FOR MANUAL LOGIN")
            print(f"{'='*70}")
            print("Please log in NOW in the browser window that opened...")

            # Countdown
            for i in range(LOGIN_WAIT_TIME, 0, -10):
                print(f"  {i} seconds remaining...")
                await asyncio.sleep(10)

            print("\n✓ Starting download process...\n")

            total_downloaded = 0
            for idx, course_url in enumerate(COURSE_URLS, 1):
                count = await download_course(page, course_url, idx)
                total_downloaded += count
                await asyncio.sleep(2)

            print(f"\n{'='*70}")
            print(f"✓ ALL DOWNLOADS COMPLETE!")
            print(f"{'='*70}")
            print(f"Total lessons downloaded: {total_downloaded}")
            print(f"Output directory: {OUTPUT_DIR}")
            print(f"{'='*70}\n")

            print("Browser will close in 10 seconds...")
            await asyncio.sleep(10)

        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()
            await asyncio.sleep(5)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
