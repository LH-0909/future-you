from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageDraw
import json, hashlib

root = Path(__file__).resolve().parents[1]
out = root / 'test-results' / 'reference-qa'
results = []
for i, source in enumerate(sorted((root.parent / '图片').glob('*.png')), 1):
    target = Image.open(source).convert('RGB')
    screenshot = Image.open(out / f'page-{i:02}.png').convert('RGB')
    difference = ImageChops.difference(target, screenshot)
    means = ImageStat.Stat(difference).mean
    results.append({'page': i, 'sourceSize': target.size, 'captureSize': screenshot.size,
                    'meanAbsoluteDifference': means,
                    'originalFileSHA256Matches': hashlib.sha256(source.read_bytes()).hexdigest() == hashlib.sha256((root/'public/reference-pages'/f'{i:02}.png').read_bytes()).hexdigest()})
    canvas = Image.new('RGB', (1672 * 2, 941 + 32), '#dce9f8')
    draw = ImageDraw.Draw(canvas)
    draw.text((20, 10), f'REFERENCE {i:02}', fill='#18345c')
    draw.text((1692, 10), f'BROWSER CAPTURE {i:02}', fill='#18345c')
    canvas.paste(target, (0, 32))
    canvas.paste(screenshot, (1672, 32))
    canvas.save(out / f'comparison-{i:02}.jpg', quality=94)
    for name,box in [('header',(0,0,1672,153)),('detail',(880,175,1660,835))]:
        ref_crop, actual_crop = target.crop(box), screenshot.crop(box)
        strip = Image.new('RGB',(ref_crop.width*2,ref_crop.height),'white')
        strip.paste(ref_crop,(0,0)); strip.paste(actual_crop,(ref_crop.width,0))
        strip.save(out / f'comparison-{i:02}-{name}.jpg',quality=94)
(out/'pixel-comparison.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
