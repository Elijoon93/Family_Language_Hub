from playwright.sync_api import sync_playwright
from pathlib import Path
html=Path('/mnt/data/Family_Language_OS_v6_1_Learning_Engine_Core_Standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('console', lambda msg: errors.append(f'console:{msg.type}:{msg.text}') if msg.type=='error' else None)
    page.on('pageerror', lambda exc: errors.append(f'pageerror:{exc}'))
    page.set_content(html, wait_until='load', timeout=120000)
    page.wait_for_selector('#app:not(.hidden)', timeout=30000)
    assert page.locator('.family-button').count()==4
    assert page.locator('text=v6.1 Core').count()>=1
    # Profile images and paths.
    for name in ('saeed','arezoo','elena','aria'):
        img=page.locator(f'.family-button[data-profile="{name}"] img')
        assert img.count()==1
        assert img.evaluate('(el)=>el.complete && el.naturalWidth>0')
    # Gate.
    page.click('#openSessionGate')
    page.wait_for_selector('#sessionGate[open]')
    assert page.locator('#gateProfiles .profile-choice').count()==4
    assert page.locator('#gateLanguages .choice-card').count()==2
    page.locator('#sessionGate .close-btn').click()
    page.wait_for_timeout(500)
    if page.locator('#sessionGate[open]').count(): page.locator('#sessionGate .close-btn').click()
    # Path and diagnostic.
    page.click('[data-view="path"]')
    page.wait_for_selector('.level-map')
    page.click('[data-practice="diagnostic"]')
    page.wait_for_selector('#taskDialog[open]')
    page.locator('#taskDialog .close-btn').click()
    # Elena visual alphabet.
    page.click('[data-profile="elena"]')
    page.click('[data-view="practice"]')
    page.click('[data-practice="alphabet"]')
    page.wait_for_selector('#taskDialog[open]')
    assert page.locator('.alphabet-card').count()==26
    page.locator('#taskDialog .close-btn').click()
    # Arya parent-guided task completion.
    page.click('[data-profile="aria"]')
    page.click('[data-view="today"]')
    page.click('[data-action="start-session"]')
    page.wait_for_selector('#taskDialog[open]')
    page.click('#completeTask')
    page.wait_for_timeout(300)
    assert page.evaluate('FLH_STORE.get().attempts.length')>=1
    assert page.evaluate('FLH_STORE.get().progress.aria.en.units[FLH_STORE.get().attempts[0].unitId].attempts')>=1
    if errors:
        raise AssertionError('\n'.join(errors))
    page.screenshot(path='/mnt/data/flh_v6_1_core_preview.png', full_page=True)
    browser.close()
print('BROWSER_EMBEDDED_SMOKE_PASS')
