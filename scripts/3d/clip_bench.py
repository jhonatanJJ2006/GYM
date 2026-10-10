import sys,os; sys.path.insert(0,'/workspace/gym-anim')
from lib import *
import gear
NF=90
def rep(t):
    # 0 top -> 1 bottom; slow eccentric, brief pause, faster concentric
    if t<0.08: return 0
    if t<0.52: return ss((t-0.08)/0.44)
    if t<0.58: return 1
    if t<0.90: return 1-ss((t-0.58)/0.32)
    return 0
GA=float(os.environ.get('GA','0.075')); GB=float(os.environ.get('GB','0.03'))
def pose(rig,t):
    s=rep(t); br=math.sin(2*math.pi*t)  # breath
    bar=V((lerp(0.17,0.03,s), 0, lerp(1.00,0.725,s)))
    hips=V((-0.30,0,0.53+0.004*s))
    P={'hips_pos':hips,'pelvis':frame((1,0,0.04),(0,0,1))}
    P['chest']=frame((1,0,0.16+0.04*s),(0,0,1))
    P['head']=frame((1,0,-0.12),(0.12,0,1))
    for S,sg in (('L',-1),('R',1)):
        g=bar+V((0,sg*0.40,0))
        f=nrm((0.30,0,0.95)); p=nrm((-0.95,-sg*0.05,0.30))
        P['hand'+S]=rig.hand_rot(S,f,p)
        P['wrist'+S]=g-f*GA-basis(f,p).col[2]*GB
        P['pole_arm'+S]=V((-0.35,sg*1.0,-0.9+0.4*(1-s)))
        P['clv'+S]=Matrix.Identity(3)
        P['ankle'+S]=V((-0.74,sg*0.33,0.095))
        P['foot'+S]=rig.foot_rot(S,nrm((-1,sg*0.35,0)))
        P['pole_leg'+S]=V((0.3,sg*0.5,1))
        P['curl'+S]=(78,88,62); P['thumb'+S]=(0,0,0,0)
    return P,bar
def build(render=True):
    arm,me=load_coach(); rig=Rig(arm)
    bench=gear.flat_bench(); rack=gear.bench_rack(); bb=gear.barbell()
    arm.animation_data_create(); act=bpy.data.actions.new('BenchPress'); arm.animation_data.action=act
    bb.animation_data_create()
    for f in range(NF+1):
        t=f/NF; P,bar=pose(rig,t); W=rig.solve(P); rig.key(W,f)
        bb.location=bar; bb.keyframe_insert('location',frame=f)
    fix_quat_continuity(arm)
    return arm,rig,bb
if __name__=='__main__':
    arm,rig,bb=build()
    sc=bpy.context.scene; sc.frame_start=0; sc.frame_end=NF-1
    mode=os.environ.get('MODE','stills')
    if mode=='video':
        video('press_banca',NF,target=(-0.1,0,0.6),dist=3.8,az=-48,el=20)
    elif mode=='stills':
        for f,lab in ((0,'top'),(50,'bot')):
            sc.frame_set(f)
            for nm,kw in (('34',dict(target=(0,0,0.7),dist=3.2,az=-40,el=18)),('side',dict(target=(0.1,0,0.7),dist=2.6,az=0,el=5)),('hand',dict(target=tuple(bb.location+V((0,-0.4,0))),dist=0.7,az=-60,el=25))):
                for o in [o for o in bpy.data.objects if o.type in ('CAMERA','LIGHT') or o.name in ('Floor',) or o.name.startswith('Plane')]: bpy.data.objects.remove(o)
                stage(res=(640,480),**kw); sc.frame_set(f)
                sc.render.filepath=f'/workspace/gym-anim/chk/bench_{lab}_{nm}.png'; bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath='/workspace/gym-anim/bench.blend')
