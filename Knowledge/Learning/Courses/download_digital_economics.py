#!/usr/bin/env python3
"""
Download Digital Economics course with proper lesson names
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
    # Wait for content to load
    await page.wait_for_load_state('networkidle', timeout=20000)
    await asyncio.sleep(3)  # Extra wait for dynamic content

    # Create filename
    filename = f"{str(lesson_num).zfill(2)}_{sanitize_filename(lesson_title)}.pdf"
    output_path = output_dir / filename

    # Save as PDF
    await page.pdf(
        path=str(output_path),
        format='A4',
        print_background=True,
        margin={'top': '20px', 'bottom': '20px', 'left': '20px', 'right': '20px'}
    )

    size_kb = output_path.stat().st_size / 1024
    print(f"  ✓ Saved: {filename} ({size_kb:.1f} KB)")


async def get_all_lesson_links(page: Page):
    """Extract all lesson links from the sidebar."""
    await asyncio.sleep(3)  # Wait for page to load

    # Find all lesson links using JavaScript
    lessons = await page.evaluate("""
        () => {
            const lessons = [];

            // Try multiple strategies to find lesson links

            // Strategy 1: Look for lesson links with specific patterns
            const lessonLinks = document.querySelectorAll('a[href*="lesson_id"]');

            lessonLinks.forEach((link, index) => {
                const href = link.href;
                const text = link.textContent.trim();

                // Skip if no meaningful text or duplicate
                if (text && text.length > 2 && !lessons.find(l => l.href === href)) {
                    lessons.push({
                        href: href,
                        title: text,
                        index: index
                    });
                }
            });

            // Strategy 2: Look for lesson containers in sidebar
            const sidebar = document.querySelector('[class*="sidebar"], [class*="menu"], aside, nav');
            if (sidebar) {
                const links = sidebar.querySelectorAll('a');
                links.forEach((link, index) => {
                    const href = link.href;
                    const text = link.textContent.trim();

                    if (href && text && text.length > 2 && !lessons.find(l => l.href === href)) {
                        lessons.push({
                            href: href,
                            title: text,
                            index: index + 1000  // Lower priority than direct lesson links
                        });
                    }
                });
            }

            // Remove duplicates and sort by index
            const unique = [];
            const seen = new Set();

            lessons.sort((a, b) => a.index - b.index);

            for (const lesson of lessons) {
                if (!seen.has(lesson.href) && lesson.href.includes('lesson')) {
                    seen.add(lesson.href);
                    unique.push({
                        href: lesson.href,
                        title: lesson.title
                    });
                }
            }

            return unique;
        }
    """)

    return lessons


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
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )

        page = await context.new_page()

        try:
            print(f"\nLoading course page...")
            await page.goto(COURSE_URL, wait_until='networkidle', timeout=30000)

            # Get course title
            title = await page.title()
            print(f"Course: {title}")

            # Find all lessons
            print(f"\nScanning for lessons...")
            lessons = await get_all_lesson_links(page)

            if not lessons or len(lessons) == 0:
                print("✗ No lessons found! The page structure might be different.")
                print("\nKeeping browser open for 30 seconds so you can inspect...")
                await asyncio.sleep(30)
                return

            print(f"Found {len(lessons)} lesson(s):\n")
            for i, lesson in enumerate(lessons, 1):
                print(f"  {i}. {lesson['title']}")

            print(f"\n{'='*70}")
            print("Starting download...")
            print(f"{'='*70}\n")

            # Download each lesson
            downloaded = 0
            for idx, lesson in enumerate(lessons, 1):
                try:
                    print(f"Lesson {idx}/{len(lessons)}: {lesson['title']}")

                    # Navigate to lesson
                    await page.goto(lesson['href'], wait_until='networkidle', timeout=30000)

                    # Save as PDF
                    await save_lesson_pdf(page, lesson['title'], idx, OUTPUT_DIR)

                    downloaded += 1

                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    continue

            print(f"\n{'='*70}")
            print(f"✓ DOWNLOAD COMPLETE!")
            print(f"{'='*70}")
            print(f"Downloaded: {downloaded}/{len(lessons)} lessons")
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
