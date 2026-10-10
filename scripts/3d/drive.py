import sys,os; sys.path.insert(0,'/workspace/gym-anim')
from clips import *
def key_clip(rig,arm,name,objs_cache=None):
    c=CLIPS[name]; nf=c['nf']
    act=bpy.data.actions.new(name); act.use_fake_user=True; arm.animation_data.action=act
    gk={}
    for f in range(nf+1):
        P,G=c['pose'](rig,f/nf); rig.key(rig.solve(P),f)
        for k,M in G.items(): gk.setdefault(k,[]).append((f,M))
    fix_quat_continuity(arm)
    return act,gk
def apply_gear_keys(gk,name):
    for k,lst in gk.items():
        o=bpy.data.objects.get(k)
        if o is None: print('MISSING',k); continue
        o.rotation_mode='QUATERNION'
        o.animation_data_create(); a=bpy.data.actions.new(f'{name}__{k}'); o.animation_data.action=a
        for f,M in lst:
            o.matrix_world=M; bpy.context.view_layer.update()
            o.keyframe_insert('location',frame=f); o.keyframe_insert('rotation_quaternion',frame=f); o.keyframe_insert('scale',frame=f)
        q=None
        for fc in a.fcurves:
            for kp in fc.keyframe_points: kp.interpolation='LINEAR'
        yield o,a
if __name__=='__main__':
    name=sys.argv[-1]
    arm,me=load_coach(); rig=Rig(arm); arm.animation_data_create()
    act,gk=key_clip(rig,arm,name)
    kind=CLIPS[name]['gear']
    if kind: build_gear_scene(kind); list(apply_gear_keys(gk,name))
    nf=CLIPS[name]['nf']; sc=bpy.context.scene
    views=os.environ.get('VIEWS','34').split(',')
    VW={'34':dict(dist=3.6,az=-38,el=14),'side':dict(dist=3.2,az=-90,el=4),'front':dict(dist=3.2,az=0,el=8),'top':dict(dist=3.0,az=-30,el=55),'back':dict(dist=3.2,az=150,el=15)}
    frs=[int(float(x)*nf) for x in os.environ.get('T','0,0.5').split(',')]
    sc.eevee.taa_render_samples=8
    for f in frs:
        for v in views:
            sc.frame_set(f)
            hp=arm.matrix_world@arm.pose.bones['Hips_01'].head
            tgt=os.environ.get('TGT'); tgt=eval(tgt) if tgt else (hp.x,hp.y,max(0.45,hp.z*0.9))
            kw=dict(VW[v]); 
            if os.environ.get('DIST'): kw['dist']=float(os.environ['DIST'])
            clear_stage(); stage(target=tgt,res=(480,360),**kw); sc.eevee.taa_render_samples=8; sc.frame_set(f)
            sc.render.filepath=f'/workspace/gym-anim/chk/c_{name}_{f}_{v}_{os.environ.get("TAG","a")}.png'; bpy.ops.render.render(write_still=True)
