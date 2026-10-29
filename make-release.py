"""Build the upload file for the live site: release/fast-fleet-repair-v<version>.zip

usage (in this folder):  py make-release.py 1.0.0

The ZIP holds only what the website needs, with index.html at the top, ready to extract into the site folder on
the hosting (see "Put it online" in README.md).
"""
import pathlib
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
FOLDERS = ['css', 'js', 'fonts']
FILES = ['.htaccess', 'brand/favicon-32.png', 'brand/apple-touch-icon.png']

if len(sys.argv) != 2:
    sys.exit(__doc__)
names = sorted(p.name for p in ROOT.glob('*.html')) + FILES
names += sorted(p.relative_to(ROOT).as_posix() for d in FOLDERS for p in (ROOT / d).rglob('*') if p.is_file())

out = ROOT / 'release' / f'fast-fleet-repair-v{sys.argv[1]}.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in names:
        z.write(ROOT / name, name)  # forward slashes inside the ZIP, so the server unpacks the folders correctly
print(f'{out} ({len(names)} files, {out.stat().st_size // 1024} KB)')
