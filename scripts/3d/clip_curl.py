import sys,os; sys.path.insert(0,'/workspace/gym-anim')
from lib import *
import gear
NF=90
GA=0.075; GB=0.03
def rep(t):
    if t<0.06: return 0
    if t<0.42: return ss((t-0.06)/0.36)
    if t<0.50: return 1
    if t<0.94: return 1-ss((t-0.50)/0.44)
    return 0
def pose(rig,t):
    s=rep(t); br=math.sin(2*math.pi*t)
    sway=0.012*math.sin(2*math.pi*t)
    P={'hips_pos':V((sway,0.005*s,0.782+0.003*br)),'pelvis':frame((0,0.02,1),(0,-1,0))}
    P['chest']=frame((0.0,0.03+0.05*s,1),(0,-1,-0.0))
    P['head']=frame((0,0.0,1),(0,-1,-0.06))
    P['clvL']=ry(-10-2*s); P['clvR']=ry(10+2*s)
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*0.13,0.03,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.17,-1,0)))
        P['pole_leg'+S]=V((sg*0.2,-1,0)); P['curl'+S]=(80,90,65); P['thumb'+S]=(0,0,0,0)
        P['wrist'+S]=V((sg*0.3,-0.2,0.9)); P['hand'+S]=Matrix.Identity(3); P['pole_arm'+S]=V((0,1,0))
    W=rig.solve(P)
    gs={}
    for S,sg in (('L',1),('R',-1)):
        sh=W[N['arm'+S]].translation
        th=D(lerp(6,106,s)); fw=D(lerp(2,8,s)); ab=D(lerp(15,10,s))
        up=V((sg*math.sin(ab),-math.sin(fw),-math.cos(fw)*math.cos(ab))).normalized()
        E=sh+up*rig.L1
        dirv=V((sg*lerp(0.22,0.05,s),-math.sin(th+fw),-math.cos(th+fw))).normalized()
        wr=E+dirv*rig.L2*0.995
        wf=D(lerp(-5,8,s))  # wrist flexion up at top
        f=V((sg*0.05,-math.sin(th+fw+wf),-math.cos(th+fw+wf))).normalized()
        p=V((sg*0.18*(1-s),-math.cos(th+fw+wf),math.sin(th+fw+wf))).normalized()
        P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=(E-sh)
        pz=basis(f,p).col[2]
        gs[S]=(wr+f*GA+pz*GB, f, pz)
    return P,gs
def build():
    arm,me=load_coach(); rig=Rig(arm)
    dl=gear.dumbbell('DumbbellL'); dr=gear.dumbbell('DumbbellR')
    arm.animation_data_create(); arm.animation_data.action=bpy.data.actions.new('CurlDumbbell')
    for f in range(NF+1):
        P,gs=pose(rig,f/NF); W=rig.solve(P); rig.key(W,f)
        for o,S in ((dl,'L'),(dr,'R')):
            g,fv,pz=gs[S]; ax=fv.cross(pz)  # handle axis ~ thumb dir
            M=basis(fv,pz) # rotate dumbbell so its X (handle) aligns with hand x
            o.rotation_mode='QUATERNION'
            # dumbbell local X -> M col0 (hand across)
            R=Matrix((M.col[0],M.col[1],M.col[2])).transposed()
            o.location=g; o.rotation_quaternion=R.to_quaternion()
            o.keyframe_insert('location',frame=f); o.keyframe_insert('rotation_quaternion',frame=f)
    fix_quat_continuity(arm)
    return arm,rig
if __name__=='__main__':
    arm,rig=build()
    if os.environ.get('MODE')=='video':
        video('curl_mancuernas',NF,target=(0,0,0.88),dist=4.0,az=-35,el=8)
    else:
        def ht(): return tuple(bpy.data.objects['DumbbellL'].matrix_world.translation)
        stills('curl',(0,45),(('34',dict(target=(0,0,0.85),dist=3.0,az=-38,el=10)),('side',dict(target=(0,0,0.85),dist=2.6,az=-90,el=5)),('hand',dict(target=ht,dist=0.6,az=-60,el=15))))
    bpy.ops.wm.save_as_mainfile(filepath='/workspace/gym-anim/curl.blend')
