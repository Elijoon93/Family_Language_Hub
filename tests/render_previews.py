from playwright.sync_api import sync_playwright
from pathlib import Path
html=Path('/mnt/data/Family_Language_OS_v6_1_Learning_Engine_Core_Standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.set_content(html,wait_until='load',timeout=120000)
    page.wait_for_selector('#app:not(.hidden)')
    page.wait_for_timeout(500)
    if page.locator('#sessionGate[open]').count(): page.locator('#sessionGate .close-btn').click()
    page.screenshot(path='/mnt/data/Family_Language_OS_v6_1_Core_Desktop.png',full_page=True)
    page.click('[data-view="path"]')
    page.screenshot(path='/mnt/data/Family_Language_OS_v6_1_Core_Path.png',full_page=True)
    page.click('[data-profile="elena"]')
    page.click('[data-view="practice"]')
    page.screenshot(path='/mnt/data/Family_Language_OS_v6_1_Core_Elena_Practice.png',full_page=True)
    browser.close()
print('PREVIEWS_RENDERED')
