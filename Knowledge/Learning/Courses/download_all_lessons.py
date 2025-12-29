#!/usr/bin/env python3
"""
Download all Digital Economics lessons
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

# All 33 lessons extracted from the course data
LESSONS = [
    (782308, "Important Course Updates & Information"),
    (782309, "The Kortex Workflow & Templates"),
    (782318, "The Notion Templates"),
    (782310, "Creating Clarity"),
    (783005, "Self-Management"),
    (782311, "Pieces Of A Personal Brand"),
    (782312, "Your Domain Of Mastery"),
    (782326, "The Start Of Your Life's Work"),
    (782321, "Optimizing Your Profile"),
    (782323, "Non-Needy Networking"),
    (782324, "Growing As A Beginner"),
    (782325, "Action Steps + My Journey"),
    (783486, "The Experience Model"),
    (783488, "The 3 Point Content Ecosystem"),
    (783489, "The Evergreen Content Style"),
    (783490, "Attention & Engagement Psychology"),
    (783492, "The APAG Writing Framework"),
    (783495, "How To Leverage Threads"),
    (783507, "Unlimited High-Performing Posts"),
    (783512, "Developing Your Ideas & Unique Voice"),
    (782313, "Intelligent Imitation"),
    (782314, "The Content Synthesis System"),
    (782315, "The Epistemic Method"),
    (783517, "Your Digital Reality"),
    (783525, "Creating Fusion Content"),
    (783537, "Expanding Your Distribution Ecosystem"),
    (783539, "The Principles Of Social Growth"),
    (783542, "Instagram"),
    (783544, "LinkedIn"),
    (783545, "Podcast"),
    (783547, "YouTube"),
    (783548, "Creating A Systemized Marketing Strategy"),
    (783550, "Who Can You Help The Most?"),
]


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


def build_lesson_url(lesson_id: int) -> str:
    """Build the full URL for a lesson."""
    return f"https://stan.store/course/{COURSE_ID}?token={TOKEN}&store={STORE}&lesson_id={lesson_id}"


async def save_lesson_pdf(page, lesson_title: str, lesson_num: int, output_dir: Path):
    """Save the current lesson as a PDF."""
    await page.wait_for_load_state('networkidle', timeout=20000)
    await asyncio.sleep(4)  # Wait for dynamic content to load

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


async def main():
    """Main function."""
    print("\nDigital Economics - Complete Course Downloader")
    print("=" * 70)
    print(f"Total lessons: {len(LESSONS)}")
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
            downloaded = 0

            for lesson_num, (lesson_id, lesson_title) in enumerate(LESSONS, 1):
                try:
                    print(f"\nLesson {lesson_num}/{len(LESSONS)}: {lesson_title}")

                    # Build and navigate to lesson URL
                    url = build_lesson_url(lesson_id)
                    await page.goto(url, wait_until='networkidle', timeout=30000)

                    # Save as PDF
                    await save_lesson_pdf(page, lesson_title, lesson_num, OUTPUT_DIR)
                    downloaded += 1

                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    continue

            print(f"\n{'='*70}")
            print(f"✓ DOWNLOAD COMPLETE!")
            print(f"{'='*70}")
            print(f"Successfully downloaded: {downloaded}/{len(LESSONS)} lessons")
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
    asyncio.run(main())
