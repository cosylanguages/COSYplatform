from playwright.sync_api import sync_playwright
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()

        # 1. Verify Teacher Dashboard Workspace
        teacher_path = f"file://{os.path.abspath('teacher.html')}"
        page.goto(teacher_path)
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/teacher_workspace.png")

        # 2. Verify Student Dashboard
        student_path = f"file://{os.path.abspath('student.html')}"
        page.goto(student_path)
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/student_dashboard.png")

        # 3. Verify Founder Dashboard
        founder_path = f"file://{os.path.abspath('founder.html')}"
        page.goto(founder_path)
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/founder_dashboard.png")

        context.close()
        browser.close()

if __name__ == "__main__":
    run_verification()
