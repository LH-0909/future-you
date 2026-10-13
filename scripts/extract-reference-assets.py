"""Extract supplied illustration assets, keeping their original pixels and crops.

The reference UI is implemented in React; these crops contain photographs,
anatomy renders, or the callouts belonging to those illustrations.
"""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
sources = sorted((root.parent / '图片').glob('*.png'))
out = root / 'public' / 'reference-assets'
out.mkdir(exist_ok=True)
images = [Image.open(p).convert('RGB') for p in sources]
manifest = {}

def crop(name, page, box):
    image = images[page-1].crop(box)
    image.save(out / f'{name}.webp', lossless=True)
    manifest[name] = {'source': sources[page-1].name, 'page': page, 'box': box, 'size': image.size}

crop('brand', 1, (54, 17, 202, 54))
crop('avatar', 1, (1508, 18, 1544, 55))
crop('body-back', 1, (398, 157, 879, 941))
crop('lumbar-detail', 1, (1372, 282, 1613, 436))
crop('pelvis-detail', 1, (1384, 505, 1613, 643))
crop('disc-detail', 1, (1362, 693, 1613, 823))
for i,name in enumerate(['back', 'front', 'muscle', 'bone', 'nerve', 'compare']):
    crop(f'view-{name}', 1, (72 + i*80, 818, 142 + i*80, 879))
for i,name in enumerate(['skin','muscle','bone','ligament','disc','nerve']):
    crop(f'layer-{name}', 1, (79, 428+i*62, 113, 463+i*62))
crop('spine-exploded', 2, (310, 59, 1095, 625))
crop('disc-cutaway', 2, (1246, 267, 1501, 476))
for i,name in enumerate(['vertebra','disc','ligament','muscle','nerve']):
    crop(f'piece-{name}', 2, (59+i*115, 758, 149+i*115, 855))
    crop(f'assembly-{name}', 2, (681+i*194, 783, 827+i*194, 896))
crop('posture-hero', 3, (31, 252, 642, 788))
for i,name in enumerate(['standard','forward','crossed','phone']):
    crop(f'posture-{name}', 3, (688+i*238, 245, 763+i*238, 330))
for name,x1,x2 in [('muscle-before',686,821),('muscle-after',834,970),('disc-before',1011,1146),('disc-after',1160,1296),('pelvis-before',1338,1474),('pelvis-after',1488,1623)]:
    crop(name, 3, (x1, 566, x2, 670))
crop('walking-banner', 3, (1421, 811, 1647, 921))
crop('body-tense', 4, (625, 333, 848, 726))
crop('body-relaxed', 4, (875, 333, 1096, 726))
crop('walking-person', 4, (1145, 314, 1430, 618))
for i,name in enumerate(['walk','stretch','rotate','shoulder']):
    crop(f'movement-{name}', 4, (77, 562+i*80, 181, 638+i*80))
crop('quiz-stretch', 5, (625, 344, 1118, 822))
crop('quiz-erector', 5, (1166, 335, 1394, 663))
crop('quiz-trapezius', 5, (1403, 335, 1629, 663))
crop('plan-hero', 6, (538, 67, 1672, 444))
for i,name in enumerate(['neck','shoulder','side','squat','twist']):
    crop(f'exercise-{name}', 6, (905+i*154, 569, 1042+i*154, 785))
crop('user-avatar', 6, (1498, 20, 1537, 56))
(out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Extracted {len(manifest)} supplied illustration assets.')
