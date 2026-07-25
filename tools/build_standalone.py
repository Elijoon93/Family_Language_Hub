from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
html=re.sub(r'\s*<link rel="manifest"[^>]*>', '', html)
html=re.sub(r'\s*<link rel="icon"[^>]*>', '', html)
html=re.sub(r'\s*<link rel="stylesheet" href="styles\.css">', '\n  <style>\n'+css+'\n  </style>', html)
order=['config.js','js/profile-images.js','js/profiles.js','js/visuals.js','js/curriculum.js','js/core.js','js/storage.js','js/engine.js','js/app.js']
for file in order:
    code=(root/file).read_text(encoding='utf-8')
    pattern=r'\s*<script src="'+re.escape(file)+r'"></script>'
    html=re.sub(pattern, lambda _m: '\n  <script>\n'+code.replace('</script>','<\\/script>')+'\n  </script>', html)
html=html.replace('Family Language OS — خانه زبان خانواده','Family Language OS v6.1 — خانه زبان خانواده')
dist=root/'dist';dist.mkdir(exist_ok=True)
out=dist/'Family_Language_OS_v6_1_Learning_Engine_Core_Standalone.html'
out.write_text(html,encoding='utf-8')
print(out)
