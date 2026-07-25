from playwright.sync_api import sync_playwright
from pathlib import Path
html=Path('/mnt/data/Family_Language_OS_v6_1_Learning_Engine_Core_Standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda exc: errors.append(str(exc)))
    page.set_content(html,wait_until='load',timeout=120000)
    page.wait_for_selector('#app:not(.hidden)')
    page.wait_for_timeout(500)
    if page.locator('#sessionGate[open]').count():
        page.click('[data-g-profile="elena"]')
        page.click('#startSessionBtn')
    else:
        page.click('#activeIdentity')
        page.wait_for_selector('#sessionGate[open]')
        page.click('[data-g-profile="elena"]')
        page.click('#startSessionBtn')
    page.click('[data-view="practice"]')
    page.click('[data-practice="visual-match"]')
    page.wait_for_selector('#taskDialog[open]')
    assert page.locator('.picture-card').count()>=3
    page.locator('#taskDialog .close-btn').click()
    page.screenshot(path='/mnt/data/flh_v6_1_core_mobile.png',full_page=True)
    if errors: raise AssertionError('\n'.join(errors))
    browser.close()
print('MOBILE_SMOKE_PASS')
