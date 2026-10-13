from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'reference-pages'
out.mkdir(exist_ok=True)
for i, source in enumerate(sorted((root.parent / '图片').glob('*.png')), 1):
    shutil.copy2(source, out / f'{i:02d}.png')
print('Six original, unmodified reference pages copied.')
