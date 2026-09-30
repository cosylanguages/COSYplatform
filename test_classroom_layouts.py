import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        # Intercept auth guard to mock authenticated founder session
        await page.add_init_script("""
            window.addEventListener('DOMContentLoaded', () => {
                if (window.CosyAuth) {
                    window.CosyAuth.getAuthAndProfile = async () => {
                        return {
                            session: { user: { id: 'test-founder' } },
                            user: { id: 'test-founder' },
                            profile: { role: 'founder', language_access: ['*'], course_level: '*' }
                        };
                    };
                }
            });
        """)

        await page.goto("http://localhost:8000/classroom.html")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(500)

        os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

        # 1. Capture 1-on-1 Side-by-side mode (Default)
        await page.screenshot(path="/home/jules/verification/screenshots/layout_side_by_side.png")

        # 2. Switch to Group Mode & Discussion Split
        await page.click("#mode-group-btn")
        await page.wait_for_timeout(300)
        await page.screenshot(path="/home/jules/verification/screenshots/layout_discussion_split.png")

        # 3. Switch to Top Video Strip
        await page.select_option("#layout-preset-select", "top-strip")
        await page.wait_for_timeout(300)
        await page.screenshot(path="/home/jules/verification/screenshots/layout_top_strip.png")

        # 4. Switch to Stage Focus (PiP)
        await page.select_option("#layout-preset-select", "stage-focus")
        await page.wait_for_timeout(300)
        await page.screenshot(path="/home/jules/verification/screenshots/layout_stage_focus.png")

        print("Layout screenshots captured successfully.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
