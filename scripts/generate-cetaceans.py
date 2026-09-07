"""Author the two blue whales and three orcas. Optional authoring deps: numpy, scipy.

Every convex fragment is sampled on the same icosphere topology so it can morph
between animals without popping. Runtime needs only the generated JSON asset.
"""
from pathlib import Path
import base64
import json
import numpy as np
from scipy.spatial import ConvexHull, HalfspaceIntersection
from scipy.cluster.vq import kmeans2

rng = np.random.default_rng(8701)
phi = (1 + np.sqrt(5)) / 2
directions = np.array([(0,a,b*phi) for a in [-1,1] for b in [-1,1]] + [(a,b*phi,0) for a in [-1,1] for b in [-1,1]] + [(b*phi,0,a) for a in [-1,1] for b in [-1,1]], float)
directions /= np.linalg.norm(directions, axis=1)[:,None]
ico = ConvexHull(directions)
edges = sorted({tuple(sorted((int(t[i]),int(t[(i+1)%3])))) for t in ico.simplices for i in range(3)})
directions = np.concatenate([directions, [(directions[a]+directions[b])/np.linalg.norm(directions[a]+directions[b]) for a,b in edges]])
hull = ConvexHull(directions)
triangles = []
for tri, plane in zip(hull.simplices, hull.equations):
    a,b,c = tri
    if np.dot(np.cross(directions[b]-directions[a], directions[c]-directions[a]), plane[:3]) < 0: b,c=c,b
    triangles.append([a,b,c])
triangles = np.array(triangles)

def fracture(points, count, kind):
    points=np.asarray(points,float); boundary=ConvexHull(points); eq=boundary.equations
    inside=[]; total=0
    while total < max(1600,count*80):
        p=rng.uniform(points.min(axis=0),points.max(axis=0),(3000,3))
        p=p[np.all(p@eq[:,:3].T+eq[:,3] < -1e-6,axis=1)]
        inside.append(p); total+=len(p)
    seeds,_=kmeans2(np.concatenate(inside),count,iter=12,minit='++',seed=rng)
    pieces=[]
    for index,seed in enumerate(seeds):
        mask=np.arange(count)!=index
        halfspaces=np.concatenate([eq,np.c_[2*(seeds-seed),np.sum(seed*seed)-np.sum(seeds*seeds,axis=1)][mask]])
        vertices=HalfspaceIntersection(halfspaces,seed).intersections
        center=vertices.mean(axis=0); convex=ConvexHull(vertices-center)
        dot=directions@convex.equations[:,:3].T
        distances=np.min(np.where(dot>1e-8,-convex.equations[:,3]/np.maximum(dot,1e-8),np.inf),axis=1)
        local=(directions*distances[:,None]*.91)[triangles].reshape(-1,3)
        pieces.append({'p':center,'v':local,'s':np.linalg.norm(local,axis=1).max(),'k':kind})
    assert len(pieces)==count
    return pieces

def animal(species, counts):
    if species=='blue':
        stations=[(-4.95,.12,.08,.24),(-4.7,.09,.31,.56),(-4.15,.04,.55,.78),(-3.3,0,.76,.94),(-2.25,0,.88,1.0),(-1.0,.01,.85,.89),(.3,.02,.65,.67),(1.4,.04,.43,.44),(2.45,.07,.26,.28),(3.4,.08,.15,.17),(4.12,.09,.10,.15)]
        fin=[(-2.5,-.31,.71,.34,.12),(-2.0,-.5,1.25,.47,.10),(-1.3,-.68,1.84,.35,.07),(-.65,-.71,2.1,.035,.025)]
        tail=[(4.05,.02),(3.7,.53),(3.68,1.0),(3.96,1.55),(4.5,1.94),(4.79,1.97),(4.51,1.10),(4.35,.39)]
        dorsal=[(1.7,.4,-.09),(1.7,.4,.09),(2.2,1.00,0),(2.35,.63,-.08),(2.35,.63,.08),(2.9,.25,0)]
    else:
        stations=[(-4.05,.04,.12,.25),(-3.84,.01,.43,.56),(-3.30,0,.72,.76),(-2.35,.04,.95,.86),(-1.15,.03,1.03,.91),(.0,.03,.9,.8),(1.08,.01,.62,.54),(2.08,0,.33,.31),(2.94,.02,.13,.17),(3.30,.04,.10,.15)]
        fin=[(-2.1,-.43,.68,.42,.13),(-1.76,-.65,1.20,.58,.10),(-1.15,-.79,1.68,.46,.075),(-.65,-.72,1.76,.05,.025)]
        tail=[(3.2,.02),(2.82,.57),(2.94,1.11),(3.45,1.56),(3.83,1.64),(3.58,.88),(3.47,.33)]
        dorsal=[(-.83,.7,-.16),(-.83,.7,.16),(-.50,2.39,0),(-.23,2.15,0),(.05,1.2,-.13),(.05,1.2,.13),(.8,.5,0)]
    points=[]
    for x,y,ry,rz in stations:
        for a in np.linspace(0,2*np.pi,18,endpoint=False):points.append([x,y+np.cos(a)*ry,np.sin(a)*rz])
    pieces=fracture(points,counts[0],'body')
    for side in [-1,1]:
        points=[]
        for x,y,z,w,t in fin:
            for a in np.linspace(0,2*np.pi,10,endpoint=False):points.append([x+np.cos(a)*w,y+np.sin(a)*t,z*side])
        pieces+=fracture(points,counts[1],'fin')
    for side in [-1,1]:
        points=[]
        for x,z in tail:
            for delta in [-1,1]:
                y=.09+.08*z+delta*(.035+.04*(1-z/2.1)); zz=z*side; bank=-.33
                points.append([x,y*np.cos(bank)-zz*np.sin(bank),y*np.sin(bank)+zz*np.cos(bank)])
        pieces+=fracture(points,counts[2],'tail')
    pieces+=fracture(dorsal,counts[3],'dorsal')
    return pieces

def transform(points, scale, roll, yaw):
    rz=np.array([[np.cos(roll),-np.sin(roll),0],[np.sin(roll),np.cos(roll),0],[0,0,1]])
    ry=np.array([[np.cos(yaw),0,np.sin(yaw)],[0,1,0],[-np.sin(yaw),0,np.cos(yaw)]])
    return np.asarray(points)@(ry@rz).T*scale

source_animals=[{'center':[.2,.65,-.3],'scale':.88,'roll':-.055,'yaw':-.07,'phase':0,'species':'blue'}, {'center':[-1.45,-.9,1.0],'scale':.36,'roll':-.10,'yaw':-.08,'phase':1.15,'species':'blue'}]
orca_animals=[{'center':[-.5,.45,.10],'scale':.61,'roll':-.075,'yaw':-.1,'phase':.4,'species':'orca'}, {'center':[.85,-1.04,1.15],'scale':.45,'roll':-.04,'yaw':.08,'phase':2.2,'species':'orca'}, {'center':[1.15,1.68,-1.7],'scale':.40,'roll':-.09,'yaw':-.19,'phase':4.3,'species':'orca'}]

def place(pieces, meta, animal_id):
    placed=[]
    for p in pieces:
        placed.append({**p,'local':p['p'].copy(),'p':transform(p['p'],meta['scale'],meta['roll'],meta['yaw'])+meta['center'],'v':transform(p['v'],meta['scale'],meta['roll'],meta['yaw']),'s':p['s']*meta['scale'],'a':animal_id})
    return placed

source=place(animal('blue',[140,18,12,4]),source_animals[0],0)+place(animal('blue',[64,8,6,4]),source_animals[1],1)
orca=animal('orca',[62,10,6,6]); target=sum([place(orca,meta,index) for index,meta in enumerate(orca_animals)],[])
assert len(source)==len(target)==300
# Size matching keeps the adult's largest cells from becoming tiny orca details.
target_rank=sorted(target,key=lambda p:-p['s']); source_rank=sorted(range(len(source)),key=lambda i:-source[i]['s'])
matches=dict(zip(source_rank,target_rank))
encode=lambda values:base64.b64encode(np.round(values*4000).astype('<i2').tobytes()).decode()
output=[]
for i,p in enumerate(source):
    o=matches[i]; local=o['local']
    pale=(local[1]<-.28 and o['k']=='body') or (o['k']=='body' and -3.3<local[0]<-1.75 and local[1]>.06 and abs(local[2])>.38)
    output.append({'p':np.round(p['p'],5).tolist(),'v':encode(p['v']),'s':round(float(p['s']),5),'k':p['k'],'a':p['a'],'l':np.round(p['local'],4).tolist(),'o':{'p':np.round(o['p'],5).tolist(),'v':encode(o['v']),'s':round(float(o['s']),5),'k':o['k'],'a':o['a'],'l':np.round(local,4).tolist(),'pale':bool(pale)}})
for metas in [source_animals,orca_animals]:
    for meta in metas:
        eye=(-3.98,.01,.75) if meta['species']=='blue' else (-3.34,.13,.65)
        meta['eyes']=[(transform([eye[0],eye[1],side*eye[2]],meta['scale'],meta['roll'],meta['yaw'])+meta['center']).tolist() for side in [-1,1]]
asset={'version':2,'pieces':output,'animals':source_animals,'orcas':orca_animals,'verticesPerPiece':len(triangles)*3}
destination=Path(__file__).resolve().parents[1]/'public/experience/cetaceans.json'
destination.write_text(json.dumps(asset,separators=(',',':')))
print(json.dumps({'pieces':len(output),'trianglesPerPiece':len(triangles),'bytes':destination.stat().st_size,'asset':str(destination)}))
