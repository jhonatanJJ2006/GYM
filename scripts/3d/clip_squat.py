import sys,os; sys.path.insert(0,'/workspace/gym-anim')
from lib import *
import gear
NF=90
GA=0.075; GB=0.03
def rep(t):
    if t<0.06: return 0
    if t<0.48: return ss((t-0.06)/0.42)
    if t<0.53: return 1
    if t<0.92: return 1-ss((t-0.53)/0.39)
    return 0
def tilt(a,up=True):
    a=D(a); return (0,-math.sin(a),math.cos(a))
def pose(rig,t,pass2=None):
    s=rep(t); br=math.sin(2*math.pi*t)
    hz=lerp(0.785,0.45,s); hy=lerp(0.0,0.215,s)
    P={'hips_pos':V((0,hy,hz)),'pelvis':frame(tilt(lerp(3,32,s)),(0,-1,0))}
    P['chest']=frame(tilt(lerp(4,42,s)+1.0*br),(0,-1,0))
    # neutral neck: head follows chest partly, gaze forward slightly down
    hu=V(tilt(lerp(2,12,s))); P['head']=frame(hu,(0,-1,-lerp(0.12,0.05,s)))
    P['clvL']=ry(-6); P['clvR']=ry(6)
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*0.175,0.02,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.42,-1,0)))
        P['pole_leg'+S]=V((sg*0.45,-1,0.1)); P['curl'+S]=(80,90,65); P['thumb'+S]=(0,0,0,0)
        P['wrist'+S]=V((sg*0.4,0.1,1.2)); P['hand'+S]=Matrix.Identity(3); P['pole_arm'+S]=V((sg*0.3,0.6,-1))
    W=rig.solve(P)
    c=W[N['sp2']]; R=c.to_3x3()@rig.rest[N['sp2']].to_3x3().inverted()
    bar=c.translation+R@V((0,0.105,0.145))
    for S,sg in (('L',1),('R',-1)):
        g=bar+R@V((sg*0.37,0,0))
        f=R@nrm((0,0.35,0.94)); p=R@nrm((0,-0.94,0.35))
        P['hand'+S]=rig.hand_rot(S,f,p); pz=basis(f,p).col[2]
        P['wrist'+S]=g-f*GA-pz*GB
        P['pole_arm'+S]=R@V((sg*0.25,0.8,-1))
    return P,bar,R
def build():
    arm,me=load_coach(); rig=Rig(arm)
    bb=gear.barbell('Barbell'); bb.rotation_mode='QUATERNION'
    if os.environ.get('RACK'): gear.squat_rack().location=(0,-0.75,0)
    arm.animation_data_create(); arm.animation_data.action=bpy.data.actions.new('SquatBarbell')
    for f in range(NF+1):
        P,bar,R=pose(rig,f/NF); W=rig.solve(P); rig.key(W,f)
        bb.location=bar; bb.rotation_quaternion=(R@rz(90)).to_quaternion()
        bb.keyframe_insert('location',frame=f); bb.keyframe_insert('rotation_quaternion',frame=f)
    fix_quat_continuity(arm)
    return arm,rig
if __name__=='__main__':
    arm,rig=build()
    if os.environ.get('MODE')=='video':
        video('sentadilla',NF,target=(0,0,0.85),dist=4.6,az=-38,el=8)
    else:
        stills('squat',(0,46),(('34',dict(target=(0,0,0.8),dist=3.4,az=-40,el=10)),('side',dict(target=(0,0,0.8),dist=3.0,az=-90,el=3)),('back',dict(target=(0,0.1,1.0),dist=1.3,az=150,el=25))))
    bpy.ops.wm.save_as_mainfile(filepath='/workspace/gym-anim/squat.blend')
