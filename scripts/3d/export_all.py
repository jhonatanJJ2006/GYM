import sys,os,json; sys.path.insert(0,'/workspace/gym-anim')
from drive import *
OUT='/workspace/gym-anim/out2'; os.makedirs(OUT+'/gear',exist_ok=True)
arm,me=load_coach(); rig=Rig(arm); bpy.context.scene.render.fps=30; arm.animation_data_create()
gk_all={}
for name in CLIPS:
    act,gk=key_clip(rig,arm,name); gk_all[name]=gk
    tr=arm.animation_data.nla_tracks.new(); tr.name=name; st=tr.strips.new(name,0,act)
arm.animation_data.action=None
for pb in arm.pose.bones: pb.rotation_quaternion=(1,0,0,0); pb.location=(0,0,0)
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); me.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT+'/coach.glb',export_format='GLB',use_selection=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_optimize_animation_size=True)
print('SIZE coach',os.path.getsize(OUT+'/coach.glb'))
manifest={'clips':{n:{'frames':c['nf'],'fps':30,'gear':c['gear']} for n,c in CLIPS.items()}}
json.dump(manifest,open(OUT+'/clips.json','w'),indent=1)
kinds=sorted({c['gear'] for c in CLIPS.values() if c['gear']})
for kind in kinds:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps=30
    build_gear_scene(kind)
    for name,c in CLIPS.items():
        if c['gear']!=kind: continue
        for o,a in apply_gear_keys(gk_all[name],name):
            o.animation_data.action=None
            tr=o.animation_data.nla_tracks.new(); tr.name=name; tr.strips.new(name,0,a)
    # reset to frame-0 pose of first clip for the static rest
    bpy.ops.export_scene.gltf(filepath=f'{OUT}/gear/{kind}.glb',export_format='GLB',export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_optimize_animation_size=True)
    print('SIZE',kind,os.path.getsize(f'{OUT}/gear/{kind}.glb'))
