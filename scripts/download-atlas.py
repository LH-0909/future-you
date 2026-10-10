"""Download the verified BodyParts3D distribution from Human Atlas.

Only model data is imported. Application code is not copied.
"""
import concurrent.futures
import gzip
import json
import hashlib
from pathlib import Path
from urllib.request import urlopen, Request
import sys

root = Path(__file__).resolve().parent.parent
directory = root / '.asset-source'
directory.mkdir(exist_ok=True)
commit = sys.argv[1]
base = f'https://raw.githubusercontent.com/ashemag/human-atlas/{commit}/public/'

def download(name):
    dest = directory / Path(name).name
    if not dest.exists():
        with urlopen(Request(base + name, headers={'User-Agent': 'FutureYou-AssetPreparation'}), timeout=90) as response:
            dest.write_bytes(response.read())
    return dest

manifest_path = download('models/atlas.json')
atlas = json.loads(manifest_path.read_text())
def chunk(item):
    compressed = download(item['gzip'].removeprefix('/'))
    data = gzip.decompress(compressed.read_bytes())
    if len(data) != item['bytes']:
        raise ValueError(f"Invalid asset length: {item['url']}")
    output = directory / Path(item['url']).name
    output.write_bytes(data)
    return {'file': output.name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(chunk, atlas['chunks']))
download('ATTRIBUTION.md')
for url, filename in [
    ('https://cdn.humanatlas.io/digital-objects/ref-organ/lung-male/v1.4/assets/3d-vh-m-lung.glb', 'hra-lung.glb'),
    ('https://cdn.humanatlas.io/digital-objects/ref-organ/lung-male/v1.4/assets/crosswalk.csv', 'hra-lung-crosswalk.csv'),
]:
    target = directory / filename
    if not target.exists():
        with urlopen(Request(url, headers={'User-Agent': 'FutureYou-AssetPreparation'}), timeout=90) as response:
            target.write_bytes(response.read())
(directory / 'provenance.json').write_text(json.dumps({'repository': 'https://github.com/ashemag/human-atlas', 'commit': commit, 'assets': results}, indent=2))
print(json.dumps({'chunks': len(results), 'bytes': sum(x['bytes'] for x in results), 'sourceCommit': commit}))
