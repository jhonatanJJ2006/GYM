import bpy, math, sys
sys.path.insert(0,'/workspace/gym-anim')
from common import *
from mathutils import Vector, Matrix, Quaternion, Euler
V=Vector
N={'hips':'Hips_01','sp0':'Spine_012','sp1':'Spine1_013','sp2':'Spine2_014','neck':'Neck_039','head':'Head_040',
 'clvL':'LeftShoulder_015','armL':'LeftArm_016','forL':'LeftForeArm_017','handL':'LeftHand_018',
 'clvR':'RightShoulder_042','armR':'RightArm_043','forR':'RightForeArm_044','handR':'RightHand_045',
 'thL':'LeftUpLeg_02','shL':'LeftLeg_03','ftL':'LeftFoot_04','toeL':'LeftToeBase_05',
 'thR':'RightUpLeg_07','shR':'RightLeg_08','ftR':'RightFoot_09','toeR':'RightToeBase_010'}
def nrm(v): v=V(v); return v.normalized()
def basis(y,z):
    """3x3 with given y and z (z orthogonalized)"""
    y=nrm(y); z=V(z); z=(z-y*z.dot(y)).normalized(); x=y.cross(z)
    M=Matrix((x,y,z)).transposed(); return M
def frame(up,fwd):
    """world rotation for body part: maps rest(up=Z,fwd=-Y) to given"""
    up=nrm(up); f=V(fwd); f=(f-up*f.dot(up)).normalized(); left=up.cross(f)
    return Matrix((left,-f,up)).transposed()
def rx(a): return Matrix.Rotation(D(a),3,'X')
def ry(a): return Matrix.Rotation(D(a),3,'Y')
def rz(a): return Matrix.Rotation(D(a),3,'Z')
def ss(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def lerp(a,b,t): return a+(b-a)*t
class Rig:
    def __init__(s,arm):
        s.arm=arm; B=arm.data.bones
        # drop bogus zero-weight end bones
        bpy.context.view_layer.objects.active=arm; bpy.ops.object.mode_set(mode='EDIT')
        for eb in list(arm.data.edit_bones):
            if eb.name.split('_')[0][-1]=='4' and 'Hand' in eb.name and 'Thumb' not in eb.name:
                arm.data.edit_bones.remove(eb)
        bpy.ops.object.mode_set(mode='OBJECT')
        B=arm.data.bones
        s.order=[b.name for b in B]
        s.rest={b.name:b.matrix_local.copy() for b in B}
        s.par={b.name:(b.parent.name if b.parent else None) for b in B}
        s.rel={n:(s.rest[p].inverted()@s.rest[n] if p else s.rest[n]) for n,p in s.par.items()}
        s.len={b.name:b.length for b in B}
        def hd(k): return s.rest[N[k]].translation
        s.L1=(hd('forL')-hd('armL')).length; s.L2=(hd('handL')-hd('forL')).length
        s.T1=(hd('shL')-hd('thL')).length; s.T2=(hd('ftL')-hd('shL')).length
        for pb in arm.pose.bones: pb.rotation_mode='QUATERNION'
    def solve(s,P):
        """P: dict with keys hips_pos, pelvis(3x3 delta), chest, head, clv{L,R}, wrist{L,R}, hand{L,R}(3x3 world rot), pole_arm{L,R},
        ankle{L,R}, foot{L,R}, pole_leg{L,R}, curl{L,R}=(a1,a2,a3), thumb{L,R}=(x,y,z)"""
        W={}; R=s.rest
        def rot(n): m=R[n].to_3x3(); return m
        def setD(n,Dm,head=None):
            if head is None:
                p=s.par[n]; head=(W[p]@R[p].inverted()@R[n]).translation if p else R[n].translation
            M=(Dm@rot(n)).to_4x4(); M.translation=head; W[n]=M
        def child(n,local):
            p=s.par[n]; W[n]=W[p]@s.rel[n]@local.to_4x4()
        I=Matrix.Identity(3)
        setD(N['hips'],P['pelvis'],V(P['hips_pos']))
        q0=P['pelvis'].to_quaternion(); q1=P['chest'].to_quaternion()
        setD(N['sp0'],q0.slerp(q1,0.33).to_matrix()); setD(N['sp1'],q0.slerp(q1,0.66).to_matrix()); setD(N['sp2'],P['chest'])
        qh=P['head'].to_quaternion(); setD(N['neck'],q1.slerp(qh,0.5).to_matrix()); setD(N['head'],P['head'])
        for n in s.order:
            if s.par[n]==N['head']: child(n,I)
        for S in 'LR':
            setD(N['clv'+S],P['chest']@P.get('clv'+S,I))
            for n in s.order:
                if s.par[n]==N['clv'+S] and n!=N['arm'+S]: child(n,I)
            sh=(W[N['clv'+S]]@R[N['clv'+S]].inverted()@R[N['arm'+S]]).translation
            s.cur_delta=P['chest']
            s.limb(W,N['arm'+S],N['for'+S],sh,V(P['wrist'+S]),V(P['pole_arm'+S]),s.L1,s.L2,V((0,1,0)))
            setD(N['hand'+S],P['hand'+S]@rot(N['hand'+S]).inverted(), (W[N['for'+S]]@R[N['for'+S]].inverted()@R[N['hand'+S]]).translation)
            c=P.get('curl'+S,(0,0,0)); th=P.get('thumb'+S,(0,0,0))
            for n in s.order:
                p=s.par[n]
                if n in W: continue
                if 'Hand' in n and p and ('Hand' in p):
                    if 'Thumb' in n:
                        i=int(n.split('_')[0][-1])-1
                        loc=Euler((D(th[0]),D(th[1]),D(th[2])),'XYZ').to_matrix() if i==0 else rx(th[3] if len(th)>3 else 0)
                        if (S=='L')==('Left' in n): child(n,loc)
                    else:
                        i=int(n.split('_')[0][-1])-1
                        if (S=='L')==('Left' in n): child(n,rx(c[i]) if i<3 else I)
            # legs
            hp=(W[N['hips']]@R[N['hips']].inverted()@R[N['th'+S]]).translation
            s.cur_delta=P['pelvis']
            s.limb(W,N['th'+S],N['sh'+S],hp,V(P['ankle'+S]),V(P['pole_leg'+S]),s.T1,s.T2,V((0,-1,0)))
            setD(N['ft'+S],P['foot'+S],(W[N['sh'+S]]@R[N['sh'+S]].inverted()@R[N['ft'+S]]).translation)
            for n in s.order:
                if n not in W and s.par[n] and s.par[n] in W: pass
        # remaining children (toes etc.) identity
        changed=True
        while changed:
            changed=False
            for n in s.order:
                if n not in W and s.par[n] in W: child(n,I); changed=True
        s.W=W
        return W
    def limb(s,W,a,b,root,tgt,pole,L1,L2,restpole):
        d=tgt-root; dist=min(d.length,(L1+L2)*0.999); dn=d.normalized()
        ca=(L1*L1+dist*dist-L2*L2)/(2*L1*dist); ang=math.acos(max(-1,min(1,ca)))
        pn=(pole-dn*pole.dot(dn)).normalized()
        elbow=root+(dn*math.cos(ang)+pn*math.sin(ang))*L1
        wrist=root+dn*dist
        R=s.rest
        hint=s.cur_delta@restpole
        yu=(elbow-root).normalized(); fo=(wrist-elbow); bend=fo-yu*fo.dot(yu)
        w=min(1.0,bend.length/(0.35*L2))
        for n,h,t in ((a,root,elbow),(b,elbow,wrist)):
            r=R[n].to_3x3(); y0=r.col[1]; n0=(restpole-y0*restpole.dot(y0)).normalized()
            y1=(t-h).normalized()
            hn=hint-y1*hint.dot(y1); bn=-bend-y1*(-bend).dot(y1)
            if hn.length<1e-4: hn=V((0,0,1))-y1*y1.z
            v=hn.normalized()*(1-w)+(bn.normalized()*w if bn.length>1e-6 else V((0,0,0)))
            n1=v.normalized()
            Dm=basis(y1,n1)@basis(y0,n0).inverted()
            M=(Dm@r).to_4x4(); M.translation=h; W[n]=M
    def key(s,W,f):
        arm=s.arm
        for n in s.order:
            p=s.par[n]
            Bm=s.rel[n].inverted()@((W[p].inverted()@W[n]) if p else W[n])
            pb=arm.pose.bones[n]
            l,q,_=Bm.decompose()
            pb.rotation_quaternion=q; pb.keyframe_insert('rotation_quaternion',frame=f)
            if n==N['hips']: pb.location=l; pb.keyframe_insert('location',frame=f)
    def hand_rot(s,S,fingers,palm):
        """world rot of hand bone given finger dir & palm normal"""
        r=s.rest[N['hand'+S]].to_3x3()
        return basis(fingers,palm)@basis(r.col[1],r.col[2]).inverted()@r
    def foot_rot(s,S,toe,up=(0,0,1)):
        r=s.rest[N['ft'+S]].to_3x3()
        # rest toe dir and up
        t0=V((0,-1,0)); u0=V((0,0,1))
        return basis(toe,up)@basis(t0,u0).inverted()
def fix_quat_continuity(arm):
    if not arm.animation_data or not arm.animation_data.action: return
    act=arm.animation_data.action
    for pb in arm.pose.bones:
        fcs=[act.fcurves.find(f'pose.bones["{pb.name}"].rotation_quaternion',index=i) for i in range(4)]
        if None in fcs: continue
        n=len(fcs[0].keyframe_points); prev=None
        for k in range(n):
            q=[fc.keyframe_points[k].co[1] for fc in fcs]
            if prev and sum(a*b for a,b in zip(q,prev))<0:
                q=[-x for x in q]
                for fc,x in zip(fcs,q): fc.keyframe_points[k].co[1]=x
            prev=q
        for fc in fcs:
            for kp in fc.keyframe_points: kp.interpolation='LINEAR'
import os
def clear_stage():
    for o in [o for o in bpy.data.objects if o.type in ('CAMERA','LIGHT') or o.name=='Floor' or o.name.startswith('Plane')]: bpy.data.objects.remove(o)
def stills(name,frames,views):
    sc=bpy.context.scene
    for f in frames:
        for nm,kw in views:
            clear_stage(); sc.frame_set(f); kw=dict(kw)
            if callable(kw.get('target')): kw['target']=kw['target']()
            stage(res=(640,480),**kw); sc.frame_set(f)
            sc.render.filepath=f'/workspace/gym-anim/chk/{name}_{f}_{nm}.png'; bpy.ops.render.render(write_still=True)
def video(name,nf,loops=2,**kw):
    sc=bpy.context.scene; clear_stage(); stage(res=(1280,720),**kw)
    sc.eevee.taa_render_samples=12
    d=f'/workspace/gym-anim/frames/{name}'; os.makedirs(d,exist_ok=True)
    sc.frame_start=0; sc.frame_end=nf-1
    # make actions cycle
    for o in bpy.data.objects:
        if o.animation_data and o.animation_data.action:
            for fc in o.animation_data.action.fcurves:
                if not any(m.type=='CYCLES' for m in fc.modifiers): fc.modifiers.new('CYCLES')
    sc.render.filepath=d+'/f_'; sc.render.image_settings.file_format='PNG'
    bpy.ops.render.render(animation=True)
