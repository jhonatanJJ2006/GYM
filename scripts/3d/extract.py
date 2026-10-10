import bpy, math
from mathutils import Vector, Matrix
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/workspace/GYM/public/models/coach.glb')
arm=bpy.data.objects['Skeleton']; me=bpy.data.objects['Oliver_body_Oliver_0']
for o in (arm,me):
    mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
for o in list(bpy.data.objects):
    if o not in (arm,me): bpy.data.objects.remove(o)
bpy.ops.object.select_all(action='DESELECT')
for o in (arm,me): o.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
# recenter: feet at z=0, hips xy origin, face -Y
mw=arm.matrix_world
hip=mw@arm.data.bones['Hips_01'].head_local
minz=min((me.matrix_world@v.co).z for v in me.data.vertices)
toe=mw@arm.data.bones['LeftToeBase_05'].head_local; ft=mw@arm.data.bones['LeftFoot_04'].head_local
d=(toe-ft); ang=math.atan2(d.x,d.y)  # current facing angle from +Y
R=Matrix.Rotation(math.pi+ang,4,'Z')  # rotate so facing -Y
T=R@Matrix.Translation((-hip.x,-hip.y,-minz))
for o in (arm,me): o.matrix_world=T@o.matrix_world
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
me.parent=arm; me.matrix_parent_inverse=arm.matrix_world.inverted()
arm.name='CoachRig'; me.name='CoachBody'
mz=max((me.matrix_world@v.co).z for v in me.data.vertices)
print('HEIGHT',mz, 'mods',[m.object.name for m in me.modifiers if m.type=='ARMATURE'], 'mats',[m.name for m in me.data.materials])
for b in ('Hips_01','LeftHand_018','LeftFoot_04','Head_040','LeftToeBase_05'): print(b,[round(x,3) for x in arm.data.bones[b].head_local])
print('vgroups',len(me.vertex_groups))
bpy.ops.wm.save_as_mainfile(filepath='/workspace/gym-anim/coach_base.blend')
