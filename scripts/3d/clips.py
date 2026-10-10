"""All coach exercise clips. pose(rig,t)->(P,G) ; G = {node: Matrix4 world}"""
import sys,os; sys.path.insert(0,'/workspace/gym-anim')
from lib import *
import gear
GA=0.075; GB=0.03
TH=(0,0,-45,40)      # thumb wrapped around a handle
THR=(0,0,-15,15)     # relaxed thumb
I3=Matrix.Identity(3)
def M4(loc,rot=None,scale=None):
    M=(rot if rot is not None else I3).to_4x4()
    if scale is not None:
        S=Matrix.Diagonal((*scale,1)); M=M@S
    M.translation=V(loc); return M
def rep(t,a=0.06,down=0.42,hold=0.06,up=0.40):
    """0..1..0 with ease; returns s"""
    if t<a: return 0
    t1=a+down
    if t<t1: return ss((t-a)/down)
    if t<t1+hold: return 1
    if t<t1+hold+up: return 1-ss((t-t1-hold)/up)
    return 0
def base(P):
    P.setdefault('clvL',I3); P.setdefault('clvR',I3)
    for S in 'LR':
        P.setdefault('curl'+S,(80,90,65)); P.setdefault('thumb'+S,TH)
    return P
def grip(rig,P,S,g,f,p,pole):
    f=nrm(f); P['hand'+S]=rig.hand_rot(S,f,p); pz=basis(f,p).col[2]
    P['wrist'+S]=V(g)-f*GA-pz*GB; P['pole_arm'+S]=V(pole)
def dummy_arms(P):
    for S,sg in (('L',1),('R',-1)):
        P.setdefault('wrist'+S,V((sg*0.4,0,1.0))); P.setdefault('hand'+S,I3); P.setdefault('pole_arm'+S,V((0,1,0)))
        P.setdefault('ankle'+S,V((sg*0.1,0,0.1))); P.setdefault('foot'+S,I3); P.setdefault('pole_leg'+S,V((0,-1,0)))
def stand_feet(rig,P,w=0.13,out=0.17,y=0.02,z=0.094,pole_out=0.2):
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*w,y,z)); P['foot'+S]=rig.foot_rot(S,nrm((sg*out,-1,0))); P['pole_leg'+S]=V((sg*pole_out,-1,0))
def shoulders(rig,P):
    base(P); dummy_arms(P); W=rig.solve(P); return {S:W[N['arm'+S]].translation.copy() for S in 'LR'},W
def arm_fk(rig,sh,up,fore):
    """elbow and wrist from shoulder + directions"""
    E=sh+nrm(up)*rig.L1; Wr=E+nrm(fore)*rig.L2*0.995; return E,Wr
def look(up,fwd): return frame(up,fwd)
CLIPS={}
def clip(name,nf=90,gear_file=None):
    def deco(fn): CLIPS[name]=dict(pose=fn,nf=nf,gear=gear_file); return fn
    return deco
# ---------------- Idle ----------------
@clip('Idle')
def idle(rig,t):
    ph=2*math.pi*t; br=math.sin(2*ph); sx=0.018*math.sin(ph)
    P={'hips_pos':V((sx,0,0.786+0.003*br)),'pelvis':frame((0.025*math.sin(ph),0.01,1),(0.03*math.sin(ph),-1,0))}
    P['chest']=frame((-0.02*math.sin(ph),0.02+0.012*br,1),(0.02*math.sin(ph+0.5),-1,0))
    P['head']=frame((0,0,1),(0.10*math.sin(ph-0.6),-1,-0.03+0.02*math.sin(2*ph)))
    P['clvL']=ry(-9+1.5*br); P['clvR']=ry(9-1.5*br)
    stand_feet(rig,P,w=0.14,out=0.2,pole_out=0.15)
    for S in 'LR': P['curl'+S]=(45,55,35); P['thumb'+S]=THR
    sh,_=shoulders(rig,P)
    for S,sg in (('L',1),('R',-1)):
        sw=0.02*math.sin(ph+(0 if S=='L' else math.pi))
        E,wr=arm_fk(rig,sh[S],(sg*0.08,sw,-1),(sg*0.02,-0.25+sw,-1))
        P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]; P['hand'+S]=rig.hand_rot(S,nrm(wr-E+V((0,-0.05,0))),V((-sg,0,0)))
    return P,{}
# ---------------- Bench press ----------------
@clip('BenchPress',gear_file='bench_press')
def bench(rig,t):
    s=rep(t,0.08,0.44,0.06,0.32)
    bar=V((lerp(0.17,0.03,s),0,lerp(1.00,0.725,s)))
    P={'hips_pos':V((-0.30,0,0.53+0.004*s)),'pelvis':frame((1,0,0.04),(0,0,1)),'chest':frame((1,0,0.16+0.04*s),(0,0,1)),'head':frame((1,0,-0.12),(0.12,0,1))}
    base(P)
    for S,sg in (('L',-1),('R',1)):
        grip(rig,P,S,bar+V((0,sg*0.40,0)),(0.30,0,0.95),nrm((-0.95,-sg*0.05,0.30)),(-0.35,sg*1.0,-0.9+0.4*(1-s)))
        P['ankle'+S]=V((-0.74,sg*0.33,0.095)); P['foot'+S]=rig.foot_rot(S,nrm((-1,sg*0.35,0))); P['pole_leg'+S]=V((0.3,sg*0.5,1))
    return P,{'Barbell':M4(bar)}
# ---------------- Incline dumbbell press ----------------
@clip('InclinePress',gear_file='incline_press')
def incline(rig,t):
    s=rep(t,0.06,0.42,0.06,0.36)   # 1 = bottom
    a=D(38); u=V((math.cos(a),0,math.sin(a))); n=V((-math.sin(a),0,math.cos(a)))
    hips=V((-0.30,0,0.48))
    P={'hips_pos':hips,'pelvis':frame(nrm(u*0.6+V((0,0,0.4))),nrm(n+V((-0.6,0,0)))),'chest':frame(nrm(u+n*0.06),n),'head':frame(nrm(u-n*0.05),nrm(n+u*0.35))}
    base(P); G={}
    sh,W=shoulders(rig,P)
    for S,sg in (('L',-1),('R',1)):
        c=(sh['L']+sh['R'])/2
        g=c+u*lerp(0.02,-0.02,s)+n*lerp(0.48,0.10,s)+V((0,sg*lerp(0.15,0.30,s),0))
        f=nrm(n*0.95+u*0.3); p=nrm(-u+n*0.25)
        grip(rig,P,S,g,f,p,nrm(-n*0.7+V((0,sg*1,0))-u*0.3))
        hz=basis(f,p)
        G['Dumbbell'+S]=M4(g,Matrix((hz.col[0]*0+V((0,1,0))*sg*0+hz.col[2].cross(f)*0+V(hz.col[0]),hz.col[1],hz.col[2])).transposed())
        P['ankle'+S]=V((-0.80,sg*0.27,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((-1,sg*0.3,0))); P['pole_leg'+S]=V((-0.3,sg*0.3,1))
    return P,G
# ---------------- Curls ----------------
def curl_core(rig,t,hammer=False):
    s=rep(t,0.06,0.36,0.08,0.44); br=math.sin(2*math.pi*t); sway=0.012*math.sin(2*math.pi*t)
    P={'hips_pos':V((sway,0.005*s,0.782+0.003*br)),'pelvis':frame((0,0.02,1),(0,-1,0)),'chest':frame((0,0.03+0.05*s,1),(0,-1,0)),'head':frame((0,0,1),(0,-1,-0.06))}
    P['clvL']=ry(-10-2*s); P['clvR']=ry(10+2*s)
    stand_feet(rig,P)
    sh,_=shoulders(rig,P); G={}
    for S,sg in (('L',1),('R',-1)):
        th=D(lerp(6,106,s)); fw=D(lerp(2,8,s)); ab=D(lerp(15,10,s))
        up=V((sg*math.sin(ab),-math.sin(fw),-math.cos(fw)*math.cos(ab)))
        E,wr=arm_fk(rig,sh[S],up,(sg*lerp(0.22,0.05,s),-math.sin(th+fw),-math.cos(th+fw)))
        wf=D(lerp(-5,8,s)); f=V((sg*0.05,-math.sin(th+fw+wf),-math.cos(th+fw+wf))).normalized()
        if hammer: p=V((-sg,0,0))
        else: p=V((sg*0.18*(1-s),-math.cos(th+fw+wf),math.sin(th+fw+wf))).normalized()
        P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        B=basis(f,p); g=wr+f*GA+B.col[2]*GB
        G['Dumbbell'+S]=M4(g,B)
    return P,G
@clip('CurlDumbbell',gear_file='dumbbells')
def curl(rig,t): return curl_core(rig,t)
@clip('HammerCurl',gear_file='dumbbells')
def hammer(rig,t): return curl_core(rig,t,True)
# ---------------- Squat ----------------
def tilt(a): a=D(a); return (0,-math.sin(a),math.cos(a))
@clip('SquatBarbell',gear_file='squat')
def squat(rig,t):
    s=rep(t,0.06,0.42,0.05,0.39); br=math.sin(2*math.pi*t)
    P={'hips_pos':V((0,lerp(0,0.215,s),lerp(0.785,0.45,s))),'pelvis':frame(tilt(lerp(3,32,s)),(0,-1,0)),'chest':frame(tilt(lerp(4,42,s)+br),(0,-1,0)),
       'head':frame(V(tilt(lerp(2,12,s))),(0,-1,-lerp(0.12,0.05,s))),'clvL':ry(-6),'clvR':ry(6)}
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*0.175,0.02,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.42,-1,0))); P['pole_leg'+S]=V((sg*0.45,-1,0.1))
    base(P); dummy_arms(P); W=rig.solve(P)
    c=W[N['sp2']]; R=c.to_3x3()@rig.rest[N['sp2']].to_3x3().inverted()
    bar=c.translation+R@V((0,0.105,0.145))
    for S,sg in (('L',1),('R',-1)):
        grip(rig,P,S,bar+R@V((sg*0.37,0,0)),R@nrm((0,0.35,0.94)),R@nrm((0,-0.94,0.35)),R@V((sg*0.25,0.8,-1)))
    return P,{'Barbell':M4(bar,R@rz(90))}
# ---------------- RDL / Row (barbell, hinge) ----------------
def hinge(rig,t,row=False):
    s=rep(t,0.06,0.42,0.06,0.40) if not row else 0.62
    r=rep(t,0.08,0.30,0.08,0.44) if row else 0
    hy=lerp(0,0.16,s); hz=lerp(0.785,0.72,s); lean=lerp(3,62,s)
    P={'hips_pos':V((0,hy,hz)),'pelvis':frame(tilt(lean*0.8),(0,-1,0)),'chest':frame(tilt(lean),(0,-1,0)),'head':frame(V(tilt(lean*0.7)),(0,-1,-0.35)),'clvL':ry(-8),'clvR':ry(8)}
    stand_feet(rig,P,w=0.15,out=0.12,pole_out=0.15)
    sh,_=shoulders(rig,P); G={}
    c=(sh['L']+sh['R'])/2
    if row:
        bar=V((0,c.y-lerp(0.02,-0.06,r),c.z-lerp(0.50,0.27,r)))
    else:
        bar=V((0,c.y-0.03,c.z-0.52))
    for S,sg in (('L',1),('R',-1)):
        g=bar+V((sg*0.24,0,0))
        grip(rig,P,S,g,(0,0.0,-1) if not row else nrm((0,0.3,-1)),(0,-0.25,0.0) if not row else (0,1,0.3) ,(sg*0.2,1,0.3 if row else 0))
        if not row: P['hand'+S]=rig.hand_rot(S,nrm((0,0.15,-1)),V((0,1,0))); B=basis(nrm((0,0.15,-1)),V((0,1,0))); P['wrist'+S]=g-nrm((0,0.15,-1))*GA-B.col[2]*GB
    return P,{'Barbell':M4(bar,rz(90))}
@clip('RomanianDeadlift',gear_file='barbell_floor')
def rdl(rig,t): return hinge(rig,t)
@clip('BentOverRow',gear_file='barbell_floor')
def row(rig,t): return hinge(rig,t,True)
# ---------------- Shoulder press / lateral raise (dumbbells) ----------------
@clip('ShoulderPress',gear_file='dumbbells')
def ohp(rig,t):
    s=rep(t,0.06,0.34,0.06,0.46)  # 1 = top
    br=math.sin(2*math.pi*t)
    P={'hips_pos':V((0,0,0.784)),'pelvis':frame((0,0.02,1),(0,-1,0)),'chest':frame((0,0.04,1),(0,-1,0)),'head':frame((0,0,1),(0,-1,-0.03)),'clvL':ry(lerp(0,8,s)),'clvR':ry(-lerp(0,8,s))}
    stand_feet(rig,P,w=0.15)
    sh,_=shoulders(rig,P); G={}
    for S,sg in (('L',1),('R',-1)):
        g=sh[S]+V((sg*lerp(0.12,0.04,s),-0.05,lerp(0.02,0.50,s)))
        f=nrm((sg*0.1,0.05,1)); p=V((0,-1,0))
        grip(rig,P,S,g,f,p,(sg*1,0.3,-0.6))
        G['Dumbbell'+S]=M4(g,basis(f,p))
    return P,G
@clip('LateralRaise',gear_file='dumbbells')
def lateral(rig,t):
    s=rep(t,0.06,0.38,0.06,0.44)
    P={'hips_pos':V((0,0.01,0.782)),'pelvis':frame((0,0.02,1),(0,-1,0)),'chest':frame((0,0.06,1),(0,-1,0)),'head':frame((0,0,1),(0,-1,-0.04)),'clvL':ry(lerp(-10,4,s)),'clvR':ry(lerp(10,-4,s))}
    stand_feet(rig,P,w=0.14)
    sh,_=shoulders(rig,P); G={}
    for S,sg in (('L',1),('R',-1)):
        a=D(lerp(12,84,s))
        up=V((sg*math.sin(a),-0.12,-math.cos(a)))
        E,wr=arm_fk(rig,sh[S],up,nrm(up+V((0,-0.25,0.05))))
        f=nrm(wr-E); p=nrm(V((0,0,-1))-f*f.z) if s>0.2 else V((-sg,0,0))
        p=nrm(V((-sg*(1-s),0,-s)))
        P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        B=basis(f,p); G['Dumbbell'+S]=M4(wr+f*GA+B.col[2]*GB,B)
    return P,G
# ---------------- Lunge / calf / farmer ----------------
@clip('Lunge',gear_file='dumbbells')
def lunge(rig,t):
    s=rep(t,0.06,0.40,0.06,0.42)
    P={'hips_pos':V((0,0.05,lerp(0.74,0.45,s))),'pelvis':frame((0,0.0,1),(0,-1,0)),'chest':frame((0,0.04,1),(0,-1,0)),'head':frame((0,0,1),(0,-1,-0.05)),'clvL':ry(-10),'clvR':ry(10)}
    P['ankleL']=V((0.12,-0.36,0.094)); P['footL']=rig.foot_rot('L',nrm((0.1,-1,0))); P['pole_legL']=V((0.05,-1,0.1))
    P['ankleR']=V((-0.12,0.42,lerp(0.12,0.14,s))); P['footR']=rig.foot_rot('R',nrm((-0.05,-1,-0.9)),nrm((0,-0.9,0.4))); P['pole_legR']=V((0,-1,-0.4))
    sh,_=shoulders(rig,P); G={}
    for S,sg in (('L',1),('R',-1)):
        E,wr=arm_fk(rig,sh[S],(sg*0.12,0,-1),(sg*0.08,-0.05,-1))
        f=nrm(wr-E); p=V((-sg,0,0)); P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        B=basis(f,p); G['Dumbbell'+S]=M4(wr+f*GA+B.col[2]*GB,B)
    return P,G
@clip('CalfRaise',gear_file='dumbbells')
def calf(rig,t):
    s=rep(t,0.06,0.34,0.12,0.40); h=0.075*s
    P={'hips_pos':V((0,-0.01,0.786+h)),'pelvis':frame((0,0.0,1),(0,-1,0)),'chest':frame((0,0.03,1),(0,-1,0)),'head':frame((0,0,1),(0,-1,-0.03)),'clvL':ry(-10),'clvR':ry(10)}
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*0.13,0.03,0.094+h)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.15,-1,-s*0.9)),nrm((0,-s*0.6,1))); P['pole_leg'+S]=V((sg*0.2,-1,0))
    sh,_=shoulders(rig,P); G={}
    for S,sg in (('L',1),('R',-1)):
        E,wr=arm_fk(rig,sh[S],(sg*0.12,0,-1),(sg*0.08,-0.05,-1))
        f=nrm(wr-E); p=V((-sg,0,0)); P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        B=basis(f,p); G['Dumbbell'+S]=M4(wr+f*GA+B.col[2]*GB,B)
    return P,G
@clip('FarmerCarry',gear_file='dumbbells')
def farmer(rig,t):
    P,G=calf(rig,0.0)
    ph=2*math.pi*t; br=math.sin(2*ph)
    P['hips_pos']=V((0.015*math.sin(ph),-0.01,0.786+0.004*br)); return P,G
# ---------------- Leg press ----------------
LP_A=D(45); LP_R=V((math.cos(LP_A),0,math.sin(LP_A))); LP_Z=V((-math.sin(LP_A),0,math.cos(LP_A)))
LP_O=V((0.05,0,0.30))
def lp_plate(x): return LP_O+LP_R*x+LP_Z*0.18
@clip('LegPress',gear_file='leg_press')
def legpress(rig,t,high=False):
    s=rep(t,0.06,0.42,0.05,0.40)   # 1 = knees bent
    u=nrm((-0.78,0,0.62)); n=nrm((0.62,0,0.78))
    hips=V((-0.47,0,0.42))
    P={'hips_pos':hips,'pelvis':frame(nrm(u+V((0,0,0.6))),nrm(n+V((0.4,0,0)))),'chest':frame(u,n),'head':frame(nrm(u+n*0.2),nrm(n+u*0.15)),'clvL':ry(-8),'clvR':ry(8)}
    base(P); dummy_arms(P)
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((0,sg*0.15,0.3)); P['foot'+S]=I3; P['pole_leg'+S]=V((0.3,sg*0.35,1))
    W=rig.solve(P); hp=W[N['thL']].translation
    tgt=lerp(0.61,0.36,s)
    lo,hi=-0.5,1.5
    for _ in range(40):
        m=(lo+hi)/2; d=(lp_plate(m)-LP_R*0.095+V((0,0.15,0.03 if high else -0.04))-hp).length
        if d>tgt: hi=m
        else: lo=m
    x=(lo+hi)/2; pl=lp_plate(x)
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=pl-LP_R*0.095+V((0,sg*0.15,0.03 if high else -0.04))
        P['foot'+S]=rig.foot_rot(S,nrm(LP_Z+V((0,sg*0.25,0))),-LP_R)
        grip(rig,P,S,V((-0.45,sg*0.33,0.38)),(0.15,-sg*0.25,-1),V((0,sg,0)),(-0.3,sg*1,-0.2))
    sled=M4((0.5+x-0.5,0,0))
    rail=M4(LP_O,Matrix.Rotation(-LP_A,3,'Y'))
    return P,{'LegPress_Sled':rail@M4((x,0,0))}
@clip('LegPressHigh',gear_file='leg_press')
def legpress_high(rig,t): return legpress(rig,t,True)
# ---------------- Lat pulldown ----------------
def cable_M(top,bot):
    d=V(top)-V(bot); L=d.length; R=(-d).to_track_quat('-Z','Y').to_matrix()
    return M4(top,R,(1,1,L))
@clip('LatPulldown',gear_file='pulldown')
def pulldown(rig,t):
    s=rep(t,0.06,0.34,0.08,0.46)   # 1 = bar at chest
    lean=lerp(8,20,s)
    P={'hips_pos':V((0,0.03,0.48)),'pelvis':frame(tilt(-8),nrm((0,-1,0.0))),'chest':frame(tilt(-lean+4*s),(0,-1,0.3*s)),'head':frame(V(tilt(-lean*0.6)),nrm((0,-1,0.35-0.2*s))),'clvL':ry(lerp(20,-4,s)),'clvR':ry(lerp(-20,4,s))}
    for S,sg in (('L',1),('R',-1)):
        P['ankle'+S]=V((sg*0.17,-0.36,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.2,-1,0))); P['pole_leg'+S]=V((sg*0.2,-1,0.6))
    sh,_=shoulders(rig,P)
    c=(sh['L']+sh['R'])/2
    bar=V((0,lerp(c.y-0.10,c.y-0.20,s),lerp(c.z+0.50,c.z-0.12,s)))
    for S,sg in (('L',1),('R',-1)):
        grip(rig,P,S,bar+V((sg*0.36,0,0)),nrm((0,-0.2*s,1)),V((0,1,-0.1)),(sg*1,0.6,-0.5))
    stackz=(1-0)*(0.50+0.12)*(s)
    G={'Pulldown_Bar':M4(bar),'Pulldown_WeightStack':M4((0,0.58,0.10+0.85*stackz*0.6)),'Pulldown_CableLine':cable_M((0,-0.15,2.18),bar+V((0,0,0.02)))}
    return P,G
# ---------------- Cable pushdown ----------------
TW=V((0,-0.62,0))
@clip('CablePushdown',gear_file='cable_pushdown')
def pushdown(rig,t):
    s=rep(t,0.06,0.32,0.08,0.46)   # 1 = arms extended
    P={'hips_pos':V((0,0.03,0.775)),'pelvis':frame(tilt(6),(0,-1,0)),'chest':frame(tilt(14),(0,-1,0)),'head':frame(V(tilt(8)),(0,-1,-0.12)),'clvL':ry(-10),'clvR':ry(10)}
    stand_feet(rig,P,w=0.15,y=0.06)
    sh,_=shoulders(rig,P); G={}; mids=[]
    for S,sg in (('L',1),('R',-1)):
        th=D(lerp(95,8,s))
        up=V((sg*0.10,-0.12,-1))
        E,wr=arm_fk(rig,sh[S],up,(sg*lerp(-0.20,0.18,s),-math.sin(th),-math.cos(th)))
        f=nrm(wr-E+V((0,0,0))); p=V((-sg,0,0))
        P['hand'+S]=rig.hand_rot(S,f,p); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        B=basis(f,p); mids.append(wr+f*GA+B.col[2]*GB)
    g=(mids[0]+mids[1])/2; top=TW+V((0,0.27,1.95))
    hd=g+V((0,0,0.25)); R=(top-hd).normalized()
    Hrot=(hd-top).to_track_quat('-Z','Y').to_matrix()
    hnd=g+(top-g).normalized()*0.25
    disp=(top-hnd).length-0.62
    G['Cable_Handle']=M4(hnd,Hrot); G['Cable_WeightStack']=M4(TW+V((0,-0.06,0.10+max(0,disp)*0.5)),rz(180))
    G['Cable_CableLine']=cable_M(top,hnd)
    return P,G
# ---------------- Cable crossover ----------------
TL=V((0.95,0.10,0)); TR=V((-0.95,0.10,0))
@clip('CableCrossover',gear_file='cable_crossover')
def crossover(rig,t):
    s=rep(t,0.06,0.36,0.08,0.42)  # 1 = hands together
    P={'hips_pos':V((0,0.0,0.77)),'pelvis':frame(tilt(8),(0,-1,0)),'chest':frame(tilt(18+3*s),(0,-1,0)),'head':frame(V(tilt(10)),(0,-1,-0.10)),'clvL':ry(lerp(4,-6,s)),'clvR':ry(lerp(-4,6,s))}
    P['ankleL']=V((0.14,-0.16,0.094)); P['footL']=rig.foot_rot('L',nrm((0.1,-1,0))); P['pole_legL']=V((0.1,-1,0.1))
    P['ankleR']=V((-0.14,0.20,0.094)); P['footR']=rig.foot_rot('R',nrm((-0.15,-1,0))); P['pole_legR']=V((-0.1,-1,0))
    sh,_=shoulders(rig,P); G={}
    for S,sg,T,nm in (('L',1,TL,'CableL'),('R',-1,TR,'CableR')):
        a=D(lerp(78,8,s))
        g=sh[S]+V((sg*math.sin(a)*0.50,-math.cos(a)*0.50-0.05,lerp(0.02,-0.30,s)))
        f=nrm((0,-0.3,-1)); p=V((-sg,0,0)) if False else nrm((-sg*math.cos(a)*0+ -sg*1,-0.4*s,0))
        grip(rig,P,S,g,f,p,(sg*0.6,0.6,-0.7))
        # tower rotated to face the athlete: local -Y (pulley side) -> toward centre
        Rt=rz(-90) if sg>0 else rz(90)
        top=T+Rt@V((0,-0.27,1.97)); hd=g+(top-g).normalized()*0.12
        G[nm]=M4(T,Rt)
        G[nm+'_Handle']=M4(hd,(hd-top).to_track_quat('-Z','Y').to_matrix())
        disp=(top-hd).length-1.0
        G[nm+'_WeightStack']=M4(T+Rt@V((0,0.06,0.10+max(0,0.5*((top-hd).length-0.75)))),Rt)
        G[nm+'_CableLine']=cable_M(top,hd)
    return P,G
# ---------------- Treadmill ----------------
def gait(rig,t,speed,cad,lift,stance,belt=0.22,bounce=0.03,armsw=0.22,elb=85,lean=6):
    G={}; nstr=cad
    hz=0.786+belt-(0.035 if speed>1.2 else 0.01)
    P={}
    ph=2*math.pi*nstr*t
    for S,sg,off in (('L',1,0.0),('R',-1,0.5)):
        q=(nstr*t+off)%1.0; Ls=speed*stance/nstr*3.0
        if q<stance:
            u=q/stance; y=-Ls/2+Ls*u; z=belt+0.094; toe=nrm((sg*0.08,-1,-0.1+0.25*u)); up=V((0,0,1))
            if u>0.75: toe=nrm((sg*0.08,-1,-0.1-1.2*(u-0.75)/0.25*0.8))
        else:
            u=(q-stance)/(1-stance); y=Ls/2-Ls*ss(u); z=belt+0.094+lift*math.sin(math.pi*u)**1.2+0.06*math.sin(math.pi*min(1,u*1.6))
            toe=nrm((sg*0.08,-1,-0.6*(1-u)+0.15*u)); up=V((0,0,1))
        P['ankle'+S]=V((sg*0.10,y,z)); P['foot'+S]=rig.foot_rot(S,toe); P['pole_leg'+S]=V((sg*0.1,-1,0.2))
    dip=math.cos(2*ph)
    P['hips_pos']=V((0.012*math.sin(ph),0.03,hz-bounce*(0.5+0.5*dip)))
    P['pelvis']=frame(tilt(lean*0.5),nrm((0.08*math.sin(ph),-1,0)))
    P['chest']=frame(tilt(lean),nrm((-0.10*math.sin(ph),-1,0)))
    P['head']=frame((0,0,1),(0,-1,-0.08))
    P['clvL']=ry(-8); P['clvR']=ry(8)
    for S in 'LR': P['curl'+S]=(75,85,60); P['thumb'+S]=(0,0,-25,30)
    sh,_=shoulders(rig,P)
    for S,sg in (('L',1),('R',-1)):
        sw=armsw*math.sin(ph+(math.pi if S=='L' else 0))
        up=nrm((sg*0.12,-sw,-1)); e=D(elb)
        E,wr=arm_fk(rig,sh[S],up,nrm((-sg*0.25,-math.sin(e)-sw,-math.cos(e))))
        f=nrm(wr-E); P['hand'+S]=rig.hand_rot(S,f,V((-sg,0,0))); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
    return P
@clip('TreadmillJog',gear_file='treadmill')
def jog(rig,t):
    P=gait(rig,t,1.6,4,0.12,0.42)
    return P,lugs(t,1.6*3)
@clip('TreadmillWalk',gear_file='treadmill')
def walk(rig,t):
    P=gait(rig,t,1.2,3,0.05,0.62,bounce=0.012,armsw=0.14,elb=30,lean=3)
    # walking keeps one foot down: stance 62%
    return P,lugs(t,1.2*3)
def lugs(t,dist,n=8,L=1.6):
    G={}; sp=L/n; d=(dist/sp)
    k=round(d); shift=k*sp*t   # integer lug spacings per loop: seamless
    for i in range(n):
        y=((-0.8+i*sp+shift)+0.8)%L-0.8
        e=min(1,(0.8-abs(y))/0.06)
        G[f'Treadmill_Lug{i}']=M4((0,y-0.12,0.212),None,(max(0.001,e),1,1))
    return G
# ---------------- Bike ----------------
BK_C=V((0,0.04,0.31)); BK_R=0.15
@clip('Bike',gear_file='bike')
def bike(rig,t):
    a=2*math.pi*3*t  # 3 rev per loop = 60 rpm
    ph=a
    P={'hips_pos':V((0.006*math.sin(ph),0.27,0.775)),'pelvis':frame(tilt(22),(0,-1,0)),'chest':frame(tilt(32+1.5*math.sin(2*ph)),nrm((0.03*math.sin(ph),-1,0))),'head':frame(V(tilt(14)),(0,-1,0.05)),'clvL':ry(-2),'clvR':ry(2)}
    G={'Bike_Crank':M4(BK_C,Matrix.Rotation(-a,3,'X'))}
    for S,sg,off in (('L',1,0),('R',-1,math.pi)):
        b=a+off; ped=BK_C+V((sg*0.13,-math.sin(b)*BK_R*-1*-1,math.cos(b)*BK_R))
        ped=BK_C+V((sg*0.13,0,0))+Matrix.Rotation(-a,3,'X')@V((0,0,sg*BK_R))
        G['Bike_Pedal'+S]=M4(ped)
        P['ankle'+S]=ped+V((0,0.03,0.085)); P['foot'+S]=rig.foot_rot(S,nrm((sg*0.05,-1,-0.25+0.2*math.sin(b+math.pi/2))))
        P['pole_leg'+S]=V((sg*0.12,-1,0.4))
    base(P); P.setdefault('thumbL',TH)
    for S,sg in (('L',1),('R',-1)):
        grip(rig,P,S,V((sg*0.20,-0.30,0.965)),(0,-1,-0.1),V((0,0,-1)) if False else V((0,0.15,-1)),(sg*1,0.6,-0.3))
    return P,G
# ---------------- Mat: plank, crunch, bridge, leg raise, breathe ----------------
@clip('Plank',gear_file='mat')
def plank(rig,t):
    ph=2*math.pi*t; br=math.sin(2*ph)
    u=nrm((1,0,0.16)); n=V((0,0,-1))
    sht=V((0.34,0,0.30+0.004*br))
    hips=sht-u*0.47+V((0,0,0.006*math.sin(ph)))
    P={'hips_pos':hips,'pelvis':frame(u,n),'chest':frame(nrm(u+V((0,0,0.01*br))),n),'head':frame(u,nrm((0.45,0,-1)))}
    base(P)
    for S,sg in (('L',-1),('R',1)):
        P['ankle'+S]=V((hips.x-0.66,sg*0.09,0.115)); P['foot'+S]=rig.foot_rot(S,nrm((0.25,0,-1)),nrm((-1,0,0.1)))
        P['pole_leg'+S]=V((0,0,-1))
    sh,_=shoulders(rig,P)
    for S,sg in (('L',-1),('R',1)):
        E=V((sh[S].x+0.0,sg*0.15,0.055)); E=sh[S]+(E-sh[S]).normalized()*rig.L1
        wr=E+nrm((1,-sg*0.35,0.02))*rig.L2*0.995
        f=nrm((1,-sg*0.2,-0.3)); p=V((0,-sg,0))
        P['hand'+S]=rig.hand_rot(S,f,nrm((0,-sg,0.0))); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]
        P['curl'+S]=(80,90,65); P['thumb'+S]=(0,0,-30,30)
    return P,{}
def supine_legs(rig,P,hips,sg_list=(('L',-1),('R',1)),kx=0.42):
    for S,sg in sg_list:
        P['ankle'+S]=V((hips.x-kx,sg*0.13,0.094)); P['foot'+S]=rig.foot_rot(S,nrm((-1,sg*0.1,0)))
        P['pole_leg'+S]=V((0.2,sg*0.15,1))
def chest_hands(rig,P,R=None):
    """arms crossed on chest"""
    sh,W=shoulders(rig,P)
    c=W[N['sp2']]; R=c.to_3x3()@rig.rest[N['sp2']].to_3x3().inverted()
    for S,sg in (('L',1),('R',-1)):
        # rest-frame: left=+X, fwd=-Y, up=+Z
        g=c.translation+R@V((-sg*0.12,-0.16,0.10+(0.03 if S=='L' else 0)))
        f=R@nrm((-sg,0,0.3)); p=R@V((0,1,0))
        P['hand'+S]=rig.hand_rot(S,f,p); B=basis(f,p); P['wrist'+S]=g-f*0.05-B.col[2]*0.03; P['pole_arm'+S]=R@V((sg*0.6,-0.3,-1))
        P['curl'+S]=(30,40,25); P['thumb'+S]=THR
@clip('Crunch',gear_file='mat')
def crunch(rig,t):
    s=rep(t,0.06,0.34,0.10,0.44)
    hips=V((-0.15,0,0.115))
    a=lerp(0,34,s)
    def sup(a,extra=0): a=D(a); return frame(nrm((math.cos(a),0,math.sin(a))),nrm((-math.sin(a),0,math.cos(a))))
    P={'hips_pos':hips,'pelvis':sup(-4+3*s),'chest':sup(a),'head':sup(a+lerp(4,12,s))}
    supine_legs(rig,P,hips); base(P); dummy_arms(P); chest_hands(rig,P)
    return P,{}
@clip('Breathe',gear_file='mat')
def breathe(rig,t):
    br=0.5-0.5*math.cos(2*math.pi*t)
    hips=V((-0.15,0,0.115))
    def sup(a): a=D(a); return frame(nrm((math.cos(a),0,math.sin(a))),nrm((-math.sin(a),0,math.cos(a))))
    P={'hips_pos':hips,'pelvis':sup(-4),'chest':sup(1+3*br),'head':sup(2)}
    supine_legs(rig,P,hips); base(P); dummy_arms(P)
    sh,W=shoulders(rig,P)
    for S,sg in (('L',-1),('R',1)):
        E=sh[S]+nrm((-0.5,sg*0.45,-0.2))*rig.L1; wr=E+nrm((-1,sg*0.3,-0.15))*rig.L2*0.99
        P['hand'+S]=rig.hand_rot(S,nrm(wr-E),V((0,0,-1))); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]; P['curl'+S]=(20,25,15); P['thumb'+S]=THR
    return P,{}
@clip('GluteBridge',gear_file='mat')
def bridge(rig,t):
    s=rep(t,0.06,0.34,0.14,0.40)
    hips=V((-0.10,0,lerp(0.115,0.36,s)))
    def sup(a): a=D(a); return frame(nrm((math.cos(a),0,math.sin(a))),nrm((-math.sin(a),0,math.cos(a))))
    P={'hips_pos':hips,'pelvis':sup(lerp(-4,-30,s)),'chest':sup(lerp(1,-24,s)),'head':sup(lerp(4,10,s))}
    supine_legs(rig,P,V((-0.10,0,0)),kx=0.46); base(P); dummy_arms(P)
    sh,W=shoulders(rig,P)
    for S,sg in (('L',-1),('R',1)):
        E=sh[S]+nrm((-0.7,sg*0.3,-0.3))*rig.L1; wr=E+nrm((-1,sg*0.1,-0.25))*rig.L2*0.99
        wr.z=max(wr.z,0.05)
        P['hand'+S]=rig.hand_rot(S,nrm((-1,0,-0.1)),V((0,0,-1))); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]; P['curl'+S]=(15,20,10); P['thumb'+S]=THR
    return P,{}
@clip('LegRaise',gear_file='mat')
def legraise(rig,t):
    s=rep(t,0.06,0.38,0.08,0.44)
    hips=V((-0.15,0,0.115))
    def sup(a): a=D(a); return frame(nrm((math.cos(a),0,math.sin(a))),nrm((-math.sin(a),0,math.cos(a))))
    P={'hips_pos':hips,'pelvis':sup(-2),'chest':sup(0),'head':sup(4)}
    a=D(lerp(10,82,s))
    for S,sg in (('L',-1),('R',1)):
        P['ankle'+S]=hips+V((-math.cos(a)*0.62,sg*0.08,math.sin(a)*0.62)); P['foot'+S]=rig.foot_rot(S,nrm((-math.cos(a)*0.3-math.sin(a)*0,0,1)),nrm((math.sin(a),0,math.cos(a))))
        P['pole_leg'+S]=V((math.sin(a),0,math.cos(a)))
    base(P); dummy_arms(P)
    sh,W=shoulders(rig,P)
    for S,sg in (('L',-1),('R',1)):
        E=sh[S]+nrm((-1,sg*0.3,-0.3))*rig.L1; wr=E+nrm((-1,sg*0.05,-0.25))*rig.L2*0.99
        P['hand'+S]=rig.hand_rot(S,nrm((-1,0,-0.1)),V((0,0,-1))); P['wrist'+S]=wr; P['pole_arm'+S]=E-sh[S]; P['curl'+S]=(15,20,10); P['thumb'+S]=THR
    return P,{}
# ---------------- gear scenes ----------------
def build_gear_scene(kind):
    if kind=='bench_press': gear.flat_bench(); gear.bench_rack(); gear.barbell('Barbell')
    elif kind=='incline_press': gear.incline_bench(); gear.dumbbell('DumbbellL'); gear.dumbbell('DumbbellR')
    elif kind in ('curl','dumbbells'): gear.dumbbell('DumbbellL'); gear.dumbbell('DumbbellR')
    elif kind=='squat': gear.barbell('Barbell')
    elif kind=='barbell_floor': gear.barbell('Barbell')
    elif kind=='leg_press': gear.leg_press()
    elif kind=='pulldown': gear.lat_pulldown()
    elif kind=='cable_pushdown': o=gear.cable_tower('Cable','rope'); o.location=TW; o.rotation_euler=(0,0,math.pi)
    elif kind=='cable_crossover': gear.cable_tower('CableL','single'); gear.cable_tower('CableR','single')
    elif kind=='treadmill': gear.treadmill().location=(0,-0.12,0)
    elif kind=='bike': gear.bike()
    elif kind=='mat': gear.mat_obj().location=(0.05,0,0)
