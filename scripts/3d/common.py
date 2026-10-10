import bpy, math
from mathutils import Vector, Matrix, Euler
D=math.radians
def load_coach(scale=1.75/1.6115):
    bpy.ops.wm.open_mainfile(filepath='/workspace/gym-anim/coach_base.blend')
    arm=bpy.data.objects['CoachRig']; me=bpy.data.objects['CoachBody']
    if abs(scale-1)>1e-4:
        arm.scale=(scale,)*3
        bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); me.select_set(True)
        bpy.context.view_layer.objects.active=arm
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for pb in arm.pose.bones:
        pb.rotation_mode='QUATERNION'; pb.rotation_quaternion=(1,0,0,0); pb.location=(0,0,0); pb.scale=(1,1,1)
    for c in arm.pose.bones: pass
    return arm,me
def mat(name,col,rough=0.5,metal=0.0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes=True; b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=(*col,1); b.inputs['Roughness'].default_value=rough; b.inputs['Metallic'].default_value=metal
    return m
def stage(target=(0,0,0.8), dist=4.2, az=-35, el=14, res=(1280,720), fps=30, lens=40):
    sc=bpy.context.scene
    sc.render.engine='BLENDER_EEVEE_NEXT'
    sc.render.resolution_x,sc.render.resolution_y=res; sc.render.fps=fps
    sc.eevee.taa_render_samples=16
    try:
        sc.eevee.use_shadows=True
    except: pass
    w=bpy.data.worlds.new('W'); sc.world=w; w.use_nodes=True
    w.node_tree.nodes['Background'].inputs[0].default_value=(0.16,0.165,0.175,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.9
    bpy.ops.mesh.primitive_plane_add(size=30); fl=bpy.context.object; fl.name='Floor'
    fl.data.materials.append(mat('FloorM',(0.11,0.11,0.115),0.7))
    bpy.ops.mesh.primitive_plane_add(size=30,location=(0,6,0),rotation=(D(90),0,0)); wl=bpy.context.object
    wl.data.materials.append(mat('WallM',(0.25,0.25,0.26),0.9))
    for loc,en,sz in (((3,-3,4),600,3),((-4,-1,3),250,4),((0,4,4),400,3)):
        bpy.ops.object.light_add(type='AREA',location=loc); L=bpy.context.object; L.data.energy=en; L.data.size=sz
        d=Vector(target)-Vector(loc); L.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    t=Vector(target)
    p=t+Vector((math.sin(D(az))*math.cos(D(el)),-math.cos(D(az))*math.cos(D(el)),math.sin(D(el))))*dist
    bpy.ops.object.camera_add(location=p); cam=bpy.context.object; cam.data.lens=lens
    cam.rotation_euler=(t-p).to_track_quat('-Z','Y').to_euler(); sc.camera=cam
    sc.view_settings.view_transform='AgX'
    return cam
