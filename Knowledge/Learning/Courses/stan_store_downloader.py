#!/usr/bin/env python3
"""
Stan Store Course Downloader
Downloads course pages as PDFs for personal offline use.
"""

import asyncio
import json
import os
import re
from pathlib import Path
from playwright.async_api import async_playwright, Page
from urllib.parse import urlparse, parse_qs

# Course URLs to download
COURSE_URLS = [
    "https://stan.store/course/d3724f78-f12c-4f80-8512-dd6aa2223cac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTY0LCJleHAiOjE3NjQ5NTkzNjR9.CKrdLMTzPgEmNR8Ers7QTPjuLCF69ErKjIlwgaE6M48&store=thedankoe_store&lesson_id=782310",
    "https://stan.store/course/521f8a82-0edf-4b05-92e6-c6bf3020707c?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzI3LCJleHAiOjE3NTk4NTUxMjd9.p3liXD124CIeoITgxT0IJUVf_FwhM1kaOqTK3uiJ2rM&store=thedankoe_store&lesson_id=782254",
    "https://stan.store/course/a5aba88c-c250-4a37-813d-c9a4b7ac83ac?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiNjgzZDFjMDYtNmI3Zi00NTI3LTlhMDQtYWUzMzA2YTQ1M2I0IiwiaWF0IjoxNzU5NzY4NzIyLCJleHAiOjE3NTk4NTUxMjJ9.WA9-yqjCyJA22sEMVKbN9tPHK_eDvWQqb6RZOlWmL28&store=thedankoe_store&lesson_id=779752",
    "https://stan.store/course/6f597cbe-ff13-4018-8597-db466f96818f?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYW5faWQiOjI3Mzc0NDA4LCJ1dWlkIjoiYjVmYWJiZDAtNWJhMS00Nzk1LWE0OWUtY2M0NzI3MWQzMzY2IiwiaWF0IjoxNzY0ODcyOTgxLCJleHAiOjE3NjQ5NTkzODF9.Z-dHhDq9RhqserN4ozDPBwZr9eTEccpmvneKLSXOfm8&store=thedankoe_store&lesson_id=8563196"
]

# Output directory
OUTPUT_DIR = Path("/Users/michaelenriquez/Courses/stan_store_downloads")


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()


async def get_course_info(page: Page) -> dict:
    """Extract course name and lesson information from the page."""
    try:
        # Wait for the page to load
        await page.wait_for_load_state('networkidle', timeout=10000)

        # Try to get course title
        course_title = await page.locator('h1').first.text_content(timeout=5000)
        if not course_title:
            course_title = "Unknown Course"

        # Try to get lesson title
        lesson_title = await page.locator('h2, h3').first.text_content(timeout=5000)
        if not lesson_title:
            lesson_title = "Unknown Lesson"

        return {
            'course_title': sanitize_filename(course_title.strip()),
            'lesson_title': sanitize_filename(lesson_title.strip())
        }
    except Exception as e:
        print(f"Warning: Could not extract all page info: {e}")
        return {
            'course_title': "Unknown Course",
            'lesson_title': "Unknown Lesson"
        }


async def get_all_lessons(page: Page) -> list:
    """Get all lesson links from the course page."""
    try:
        # Wait for lesson list to load
        await page.wait_for_selector('a[href*="lesson_id"]', timeout=5000)

        # Get all lesson links
        lesson_links = await page.locator('a[href*="lesson_id"]').all()
        lesson_urls = []

        for link in lesson_links:
            href = await link.get_attribute('href')
            if href and 'lesson_id' in href:
                # Make absolute URL if needed
                if href.startswith('/'):
                    href = f"https://stan.store{href}"
                elif not href.startswith('http'):
                    continue
                lesson_urls.append(href)

        return list(set(lesson_urls))  # Remove duplicates
    except Exception as e:
        print(f"Warning: Could not get all lessons: {e}")
        return []


async def save_page_as_pdf(page: Page, output_path: Path):
    """Save the current page as a PDF."""
    # Wait for content to load
    await page.wait_for_load_state('networkidle', timeout=15000)

    # Additional wait for dynamic content
    await asyncio.sleep(2)

    # Save as PDF
    await page.pdf(
        path=str(output_path),
        format='A4',
        print_background=True,
        margin={
            'top': '20px',
            'bottom': '20px',
            'left': '20px',
            'right': '20px'
        }
    )
    print(f"  ✓ Saved: {output_path.name}")


async def download_course(page: Page, course_url: str, lesson_counter: dict):
    """Download all lessons from a course."""
    print(f"\n{'='*60}")
    print(f"Processing course: {course_url}")
    print(f"{'='*60}")

    # Navigate to the course
    await page.goto(course_url, wait_until='networkidle', timeout=30000)

    # Get course info from initial page
    info = await get_course_info(page)
    course_title = info['course_title']

    # Create course directory
    course_dir = OUTPUT_DIR / course_title
    course_dir.mkdir(parents=True, exist_ok=True)

    print(f"Course: {course_title}")
    print(f"Output directory: {course_dir}")

    # Get all lesson URLs
    lesson_urls = await get_all_lessons(page)

    if not lesson_urls:
        print("Warning: No lessons found, downloading current page only")
        lesson_urls = [course_url]

    print(f"Found {len(lesson_urls)} lesson(s)")

    # Download each lesson
    for idx, lesson_url in enumerate(lesson_urls, 1):
        print(f"\nLesson {idx}/{len(lesson_urls)}: {lesson_url}")

        try:
            await page.goto(lesson_url, wait_until='networkidle', timeout=30000)

            # Get lesson info
            lesson_info = await get_course_info(page)
            lesson_title = lesson_info['lesson_title']

            # Create filename with lesson number
            lesson_num = str(idx).zfill(3)
            filename = f"{lesson_num}_{lesson_title}.pdf"
            output_path = course_dir / filename

            # Save as PDF
            await save_page_as_pdf(page, output_path)
            lesson_counter['total'] += 1

        except Exception as e:
            print(f"  ✗ Error downloading lesson: {e}")
            continue


async def main():
    """Main function to download all courses."""
    print("Stan Store Course Downloader")
    print("=" * 60)

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    lesson_counter = {'total': 0}

    async with async_playwright() as p:
        # Launch browser (headless=False to see progress, set to True for background)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = await context.new_page()

        try:
            # Process each course
            for course_url in COURSE_URLS:
                await download_course(page, course_url, lesson_counter)

            print(f"\n{'='*60}")
            print(f"✓ Download complete!")
            print(f"Total lessons downloaded: {lesson_counter['total']}")
            print(f"Output directory: {OUTPUT_DIR}")
            print(f"{'='*60}")

        except Exception as e:
            print(f"\n✗ Error: {e}")
            raise
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
