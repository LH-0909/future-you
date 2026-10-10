"""Add real lung tissue from the Human Reference Atlas (CC BY 4.0).

BodyParts3D's selected distribution supplies a bronchial tree but no solid
lung parenchyma. Register the HRA male lung reference to that tree for this
educational composite. This is not a patient-specific registration.
"""
import csv,json,struct
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parent.parent
directory=root/'.asset-source'
b=(directory/'hra-lung.glb').read_bytes()
length=struct.unpack_from('<I',b,12)[0]
doc=json.loads(b[20:20+length])
binary=b[28+length:]
if doc.get('extensionsRequired'): raise ValueError('Unsupported GLB extension')

def accessor(index):
    a=doc['accessors'][index];view=doc['bufferViews'][a['bufferView']]
    dtype={5126:np.dtype('<f4'),5125:np.dtype('<u4'),5123:np.dtype('<u2')}[a['componentType']]
    count={'SCALAR':1,'VEC3':3}[a['type']]
    offset=view.get('byteOffset',0)+a.get('byteOffset',0)
    stride=view.get('byteStride',dtype.itemsize*count)
    return np.ndarray((a['count'],count),dtype=dtype,buffer=binary,offset=offset,strides=(stride,dtype.itemsize)).copy()

def node_geometry(node):
    # The downloaded reference has no node transforms. Refuse silently changed
    # export conventions rather than placing anatomical structures incorrectly.
    if any(k in node for k in ['matrix','translation','rotation','scale']):
        raise ValueError('Re-review HRA node transforms before registering')
    primitives=doc['meshes'][node['mesh']]['primitives']
    if len(primitives)!=1: raise ValueError('Re-review HRA mesh primitives')
    p=primitives[0]
    return accessor(p['attributes']['POSITION']),accessor(p['attributes']['NORMAL']),accessor(p['indices']).flatten().astype('<u4')

geometries={i:node_geometry(n) for i,n in enumerate(doc['nodes']) if 'mesh' in n}
lung_nodes=[i for i,n in enumerate(doc['nodes']) if 'mesh' in n and n['mesh']<=26]
bronchial_nodes=[i for i,n in enumerate(doc['nodes']) if 'mesh' in n and n['mesh']>=27]
source_points=np.concatenate([geometries[i][0] for i in bronchial_nodes])
atlas=json.loads((directory/'atlas.json').read_text())
target_parts=[p for p in atlas['parts'] if p['system']=='respiratory' and ('bronch' in p['name'].lower() or 'trachea' in p['name'].lower())]
target_min=np.min([p['bounds'][0] for p in target_parts],axis=0)
target_max=np.max([p['bounds'][1] for p in target_parts],axis=0)
source_min=source_points.min(axis=0);source_max=source_points.max(axis=0)
scale=float((target_max[0]-target_min[0])/(source_max[0]-source_min[0]))
shift=(target_min+target_max)/2-(source_min+source_max)/2*scale
crosswalk={r['node_name']:r for r in csv.DictReader((directory/'hra-lung-crosswalk.csv').open())}
data=bytearray();parts=[]
def append(array):
    while len(data)%4:data.append(0)
    offset=len(data);data.extend(array.tobytes());return offset
for i in lung_nodes:
    n=doc['nodes'][i];pos,normal,indices=geometries[i]
    positions=(pos*scale+shift).astype('<f4');normals=(np.clip(normal,-1,1)*32767).astype('<i2')
    meta=crosswalk[n['name']]
    parts.append({'id':n['name'],'name':meta['label'],'conceptId':meta['OntologyID'],'positions':append(positions),'normals':append(normals),'indices':append(indices),'vertexCount':len(positions),'indexCount':len(indices)})
(directory/'hra-lung.bin').write_bytes(data)
(directory/'hra-lung.json').write_text(json.dumps({'source':'Human Reference Atlas / HuBMAP male lung v1.4','url':'https://purl.humanatlas.io/ref-organ/lung-male/v1.4','license':'CC BY 4.0','scale':scale,'translation':shift.tolist(),'parts':parts}))
print(json.dumps({'parts':len(parts),'scale':scale,'translation':shift.tolist(),'targetBounds':[target_min.tolist(),target_max.tolist()]}))
