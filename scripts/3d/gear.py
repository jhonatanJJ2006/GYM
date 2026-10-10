import bpy, bmesh, math
from mathutils import Vector, Matrix
from common import mat, D
STEEL=lambda: mat('Steel',(0.04,0.04,0.045),0.35,1.0)
CHROME=lambda: mat('Chrome',(0.8,0.8,0.82),0.18,1.0)
RUBBER=lambda: mat('Rubber',(0.025,0.025,0.025),0.75,0.0)
PAD=lambda: mat('Upholstery',(0.05,0.05,0.055),0.55,0.0)
ACCENT=lambda: mat('Accent',(0.75,0.25,0.03),0.45,0.2)
def _obj(name,bm,m,parent=None):
    me=bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o); me.materials.append(m)
    for p in me.polygons: p.use_smooth=True
    if parent: o.parent=parent
    return o
def box(name,c,s,m,parent=None,bev=0.0):
    bm=bmesh.new(); bmesh.ops.create_cube(bm,size=1.0)
    for v in bm.verts: v.co=Vector((v.co.x*s[0],v.co.y*s[1],v.co.z*s[2]))+Vector(c)
    if bev>0: bmesh.ops.bevel(bm,geom=bm.edges[:],offset=bev,segments=2,affect='EDGES')
    o=_obj(name,bm,m,parent)
    for p in o.data.polygons: p.use_smooth=bev>0
    return o
def cyl(name,c,r,l,axis,m,parent=None,seg=24,r2=None):
    bm=bmesh.new(); bmesh.ops.create_cone(bm,cap_ends=True,segments=seg,radius1=r,radius2=r2 if r2 else r,depth=l)
    R={'X':Matrix.Rotation(D(90),3,'Y'),'Y':Matrix.Rotation(D(90),3,'X'),'Z':Matrix.Identity(3)}[axis]
    for v in bm.verts: v.co=R@v.co+Vector(c)
    o=_obj(name,bm,m,parent)
    return o
def empty(name,loc,parent=None):
    e=bpy.data.objects.new(name,None); e.empty_display_size=0.05; e.location=loc; bpy.context.scene.collection.objects.link(e)
    if parent: e.parent=parent
    return e
def root(name):
    e=bpy.data.objects.new(name,None); bpy.context.scene.collection.objects.link(e); return e
def plate(name,y,r,t,parent,axis='Y'):
    o=cyl(name,(0,y,0),r,t,axis,RUBBER(),parent,seg=40)
    cyl(name+'_hub',(0,y,0),0.045,t+0.004,axis,STEEL(),parent,seg=20)
    return o
def barbell(name='Barbell',axis='Y',plates=((0.225,0.045),(0.225,0.045))):
    """origin at bar centre, bar along Y. grips marked by knurl"""
    rt=root(name)
    cyl(name+'_shaft',(0,0,0),0.0145,1.31,'Y',CHROME(),rt,seg=16)
    for sg in (1,-1):
        cyl(name+'_collar',(0,sg*0.665,0),0.03,0.03,'Y',CHROME(),rt,seg=20)
        cyl(name+'_sleeve',(0,sg*0.87,0),0.025,0.40,'Y',CHROME(),rt,seg=20)
        y=0.70
        for i,(r,t) in enumerate(plates):
            plate(f'{name}_plate{i}{"L" if sg<0 else "R"}',sg*(y+t/2),r,t,rt); y+=t+0.004
        cyl(name+'_clip',(0,sg*(y+0.012),0),0.034,0.022,'Y',ACCENT(),rt,seg=20)
    for sg,S in ((-1,'L'),(1,'R')): empty(f'{name}_grip_{S}',(0,sg*0.40,0),rt)
    return rt
def flat_bench(name='Bench'):
    """long axis X, head end +X, pad top z=0.44"""
    rt=root(name)
    box(name+'_pad',(-0.02,0,0.405),(1.20,0.29,0.07),PAD(),rt,bev=0.02)
    box(name+'_board',(-0.02,0,0.36),(1.18,0.24,0.02),STEEL(),rt)
    box(name+'_rail',(-0.02,0,0.30),(1.0,0.08,0.06),STEEL(),rt,bev=0.006)
    for x in (-0.52,0.48):
        box(name+'_post',(x,0,0.16),(0.07,0.07,0.30),STEEL(),rt,bev=0.006)
        box(name+'_foot',(x,0,0.025),(0.08,0.52,0.05),STEEL(),rt,bev=0.008)
        for sg in (1,-1): box(name+'_cap',(x,sg*0.25,0.02),(0.09,0.03,0.04),RUBBER(),rt)
    empty(name+'_seat',(-0.15,0,0.44),rt)
    return rt
def bench_rack(name='BenchRack',hook_z=1.02,x=0.50):
    rt=root(name)
    for sg in (1,-1):
        y=sg*0.56
        box(name+'_upright',(x,y,0.62),(0.06,0.06,1.24),STEEL(),rt,bev=0.006)
        box(name+'_hook',(x-0.05,y,hook_z-0.03),(0.10,0.07,0.03),STEEL(),rt,bev=0.006)
        box(name+'_lip',(x-0.095,y,hook_z+0.0),(0.015,0.07,0.06),RUBBER(),rt)
        box(name+'_base',(x,y,0.03),(0.55,0.08,0.06),STEEL(),rt,bev=0.008)
        for k in range(8): box(name+'_hole',(x-0.031,y,0.62+k*0.07),(0.002,0.022,0.022),RUBBER(),rt)
    box(name+'_brace',(x+0.0,0,0.10),(0.06,1.12,0.06),STEEL(),rt,bev=0.006)
    box(name+'_brace2',(x+0.0,0,1.22),(0.06,1.12,0.05),STEEL(),rt,bev=0.006)
    return rt
def squat_rack(name='SquatRack',hook_z=1.30):
    rt=root(name)
    for sx in (-0.35,0.35):
        for sy in (-0.62,0.62):
            box(name+'_post',(sx,sy,1.1),(0.075,0.075,2.2),STEEL(),rt,bev=0.006)
            for k in range(16): box(name+'_hole',(sx-0.0381 if sx<0 else sx+0.0381,sy,0.7+k*0.07),(0.002,0.025,0.025),RUBBER(),rt)
        box(name+'_top',(sx,0,2.18),(0.075,1.32,0.075),STEEL(),rt)
        box(name+'_base',(sx,0,0.03),(0.09,1.4,0.06),STEEL(),rt)
    for sy in (-0.62,0.62):
        box(name+'_side',(0,sy,2.18),(0.78,0.075,0.075),STEEL(),rt)
        box(name+'_baseS',(0,sy,0.03),(0.9,0.09,0.06),STEEL(),rt)
        box(name+'_jhook',(-0.40,sy,hook_z-0.03),(0.10,0.07,0.03),STEEL(),rt)
        box(name+'_safety',(0,sy,0.62),(0.85,0.05,0.04),CHROME(),rt)
    box(name+'_platform',(0,0,0.006),(1.6,1.8,0.012),mat('Platform',(0.12,0.09,0.06),0.8),rt)
    return rt
def dumbbell(name='Dumbbell',head_r=0.06,head_l=0.075):
    """origin at handle centre, handle along X"""
    rt=root(name)
    cyl(name+'_handle',(0,0,0),0.016,0.14,'X',CHROME(),rt,seg=16)
    for sg in (1,-1):
        bm=bmesh.new(); bmesh.ops.create_cone(bm,cap_ends=True,segments=6,radius1=head_r,radius2=head_r,depth=head_l)
        for v in bm.verts: v.co=Matrix.Rotation(D(90),3,'Y')@v.co+Vector((sg*(0.07+head_l/2),0,0))
        bmesh.ops.bevel(bm,geom=bm.edges[:],offset=0.006,segments=2,affect='EDGES')
        o=_obj(name+'_head',bm,RUBBER(),rt)
        cyl(name+'_cap',(sg*(0.07+head_l+0.001),0,0),0.025,0.004,'X',CHROME(),rt,seg=16)
    empty(name+'_grip',(0,0,0),rt)
    return rt
def incline_bench(name='InclineBench',angle=35):
    rt=root(name)
    box(name+'_seat',(-0.30,0,0.44),(0.36,0.29,0.07),PAD(),rt,bev=0.02)
    back=root(name+'_backpivot'); back.parent=rt; back.location=(-0.12,0,0.46); back.rotation_euler=(0,-D(angle),0)
    box(name+'_back',(0.42,0,0),(0.84,0.29,0.07),PAD(),back,bev=0.02)
    box(name+'_backframe',(0.42,0,-0.05),(0.80,0.08,0.05),STEEL(),back)
    box(name+'_rail',(-0.05,0,0.30),(1.0,0.08,0.06),STEEL(),rt,bev=0.006)
    box(name+'_strut',(0.30,0,0.42),(0.06,0.06,0.42),STEEL(),rt)
    for x in (-0.50,0.45):
        box(name+'_post',(x,0,0.16),(0.07,0.07,0.30),STEEL(),rt)
        box(name+'_foot',(x,0,0.025),(0.08,0.52,0.05),STEEL(),rt)
    empty(name+'_seat_pt',(-0.30,0,0.48),rt)
    return rt
def mat_obj(name='Mat'):
    rt=root(name); box(name+'_mat',(0,0,0.006),(1.80,0.62,0.012),mat('MatRubber',(0.08,0.18,0.2),0.85),rt,bev=0.004); return rt
def leg_press(name='LegPress',angle=45):
    """45deg sled; seat at origin area, sled travels along local rail axis. child 'LegPress_Sled' animated"""
    rt=root(name)
    box(name+'_base',(0.3,0,0.06),(2.0,0.9,0.12),STEEL(),rt,bev=0.01)
    box(name+'_seat',(-0.45,0,0.42),(0.45,0.5,0.08),PAD(),rt,bev=0.02)
    bk=root(name+'_backpivot'); bk.parent=rt; bk.location=(-0.62,0,0.45); bk.rotation_euler=(0,D(60),0)
    box(name+'_back',(0,0,0.32),(0.08,0.5,0.62),PAD(),bk,bev=0.02)
    box(name+'_seatframe',(-0.5,0,0.25),(0.4,0.3,0.3),STEEL(),rt)
    rail=root(name+'_rail'); rail.parent=rt; rail.location=(0.25,0,0.35); rail.rotation_euler=(0,-D(angle),0)
    for sg in (1,-1): box(name+'_railbar',(0.6,sg*0.38,0),(1.6,0.06,0.06),CHROME(),rail)
    sled=root(name+'_Sled'); sled.parent=rail; sled.location=(0.35,0,0.0)
    box(name+'_plate',(0,0,0.05),(0.06,0.7,0.62),STEEL(),sled,bev=0.01)
    box(name+'_platepad',(-0.035,0,0.05),(0.01,0.66,0.58),RUBBER(),sled)
    for sg in (1,-1):
        cyl(name+'_horn',(0.15,sg*0.42,-0.1),0.025,0.30,'X',CHROME(),sled)
        plate(name+'_wt',sg*0.42,0.2,0.05,sled).location=(0.12,0,-0.1)
    empty(name+'_foot_plate',(-0.04,0,0.05),sled)
    for sg,S in ((1,'L'),(-1,'R')): empty(f'{name}_handle_{S}',(-0.45,sg*0.32,0.48),rt); cyl(name+'_hnd',(-0.45,sg*0.32,0.45),0.016,0.18,'X',RUBBER(),rt)
    empty(name+'_seat_pt',(-0.45,0,0.46),rt)
    return rt
def stack(name,parent,x,y,n=12):
    st=root(name+'_WeightStack'); st.parent=parent; st.location=(x,y,0.12)
    for i in range(n): box(name+'_wplate',(0,0,i*0.032),(0.22,0.12,0.028),STEEL() if i%2 else mat('StackGrey',(0.15,0.15,0.16),0.4,0.6),st)
    cyl(name+'_guide',(0,0,0.6),0.01,1.2,'Z',CHROME(),parent).location=(x,y+0.0,0.12)
    return st
def cable_tower(name='Cable',y_side=0.0):
    rt=root(name)
    box(name+'_frame',(0,0.12,1.05),(0.36,0.06,2.1),STEEL(),rt)
    for sg in (1,-1): box(name+'_side',(sg*0.18,0,1.05),(0.06,0.25,2.1),STEEL(),rt)
    box(name+'_top',(0,0,2.08),(0.42,0.3,0.06),STEEL(),rt); box(name+'_base',(0,0,0.03),(0.6,0.6,0.06),STEEL(),rt)
    st=stack(name,rt,0,0.0)
    box(name+'_shroud',(0,-0.10,0.9),(0.32,0.02,1.4),mat('Glass',(0.3,0.32,0.35),0.1,0.0),rt)
    cyl(name+'_pulley',(0,-0.18,1.95),0.05,0.03,'X',CHROME(),rt)
    h=root(name+'_Handle'); h.parent=rt; h.location=(0,-0.35,1.6)
    cyl(name+'_rope',(0,0,-0.12),0.012,0.24,'Z',mat('Rope',(0.05,0.05,0.05),0.9),h)
    for sg in (1,-1): cyl(name+'_ropeEnd',(sg*0.04,0,-0.26),0.02,0.06,'Z',RUBBER(),h); empty(f'{name}_grip_{"L" if sg>0 else "R"}',(sg*0.04,0,-0.24),h)
    cab=cyl(name+'_cable',(0,0,0.5),0.003,1.0,'Z',RUBBER(),rt); cab.location=(0,-0.18,1.45)
    return rt
def lat_pulldown(name='Pulldown'):
    rt=root(name)
    box(name+'_col',(0,0.35,1.1),(0.12,0.12,2.2),STEEL(),rt); box(name+'_arm',(0,0.1,2.15),(0.12,0.6,0.08),STEEL(),rt)
    box(name+'_base',(0,0.1,0.03),(0.6,1.2,0.06),STEEL(),rt)
    box(name+'_seat',(0,0,0.48),(0.38,0.36,0.08),PAD(),rt,bev=0.02); box(name+'_seatpost',(0,0.1,0.24),(0.07,0.07,0.44),STEEL(),rt)
    box(name+'_knee',(0,-0.12,0.68),(0.42,0.1,0.1),PAD(),rt,bev=0.03)
    st=stack(name,rt,0,0.46)
    bar=root(name+'_Bar'); bar.parent=rt; bar.location=(0,-0.08,1.85)
    cyl(name+'_barbar',(0,0,0),0.014,1.15,'X',CHROME(),bar)
    for sg in (1,-1): cyl(name+'_bend',(sg*0.55,0,-0.04),0.016,0.12,'Z',RUBBER(),bar); empty(f'{name}_grip_{"L" if sg>0 else "R"}',(sg*0.36,0,0),bar)
    empty(name+'_seat_pt',(0,0,0.52),rt)
    return rt
def treadmill(name='Treadmill'):
    rt=root(name)
    box(name+'_deck',(0,0,0.14),(0.62,1.7,0.14),STEEL(),rt,bev=0.02)
    box(name+'_belt',(0,0,0.215),(0.48,1.6,0.01),RUBBER(),rt)
    for sg in (1,-1):
        box(name+'_upr',(sg*0.33,-0.72,0.7),(0.05,0.05,1.1),STEEL(),rt)
        box(name+'_rail',(sg*0.33,-0.55,1.05),(0.04,0.4,0.04),CHROME(),rt)
    box(name+'_console',(0,-0.78,1.28),(0.66,0.12,0.24),STEEL(),rt,bev=0.02)
    box(name+'_screen',(0,-0.71,1.30),(0.4,0.01,0.14),ACCENT(),rt)
    empty(name+'_belt_top',(0,0,0.22),rt)
    return rt
def bike(name='Bike'):
    rt=root(name)
    box(name+'_base',(0,0,0.04),(0.5,1.0,0.06),STEEL(),rt)
    box(name+'_frame',(0,0.05,0.4),(0.08,0.08,0.75),STEEL(),rt)
    box(name+'_seatpost',(0,0.28,0.65),(0.05,0.05,0.4),CHROME(),rt)
    box(name+'_saddle',(0,0.28,0.88),(0.16,0.26,0.06),PAD(),rt,bev=0.025)
    box(name+'_bars',(0,-0.32,1.08),(0.5,0.05,0.05),CHROME(),rt); box(name+'_stem',(0,-0.28,0.8),(0.05,0.05,0.55),STEEL(),rt)
    cyl(name+'_fly',(0,-0.30,0.38),0.22,0.05,'X',ACCENT(),rt,seg=36)
    cr=root(name+'_Crank'); cr.parent=rt; cr.location=(0,0.02,0.32)
    for sg in (1,-1):
        cr2=root(name+'_arm'); cr2.parent=cr
        box(name+'_crankarm',(sg*0.09,0,0),(0.02,0.03,0.34),STEEL(),cr)
        box(name+'_pedal',(sg*0.14,0,sg*0.17),(0.09,0.12,0.02),RUBBER(),cr)
        empty(f'{name}_pedal_{"L" if sg>0 else "R"}',(sg*0.14,0,sg*0.17),cr)
    for sg,S in ((1,'L'),(-1,'R')): empty(f'{name}_grip_{S}',(sg*0.22,-0.32,1.08),rt)
    empty(name+'_seat_pt',(0,0.28,0.91),rt)
    return rt
# ---- v2 overrides (sized for the 1.75 m cartoon coach, short legs) ----
def incline_bench(name='InclineBench',angle=38,seat_top=0.40):
    rt=root(name)
    box(name+'_seat',(-0.32,0,seat_top-0.035),(0.36,0.29,0.07),PAD(),rt,bev=0.02)
    back=root(name+'_backpivot'); back.parent=rt; back.location=(-0.14,0,seat_top+0.0); back.rotation_euler=(0,-D(angle),0)
    box(name+'_back',(0.43,0,-0.035),(0.86,0.29,0.07),PAD(),back,bev=0.02)
    box(name+'_backframe',(0.43,0,-0.09),(0.80,0.08,0.04),STEEL(),back)
    box(name+'_rail',(-0.05,0,0.24),(1.05,0.08,0.06),STEEL(),rt,bev=0.006)
    box(name+'_strut',(0.32,0,0.36),(0.06,0.06,0.30),STEEL(),rt)
    box(name+'_seatpost',(-0.32,0,0.30),(0.06,0.06,0.14),STEEL(),rt)
    for x in (-0.52,0.50):
        box(name+'_post',(x,0,0.13),(0.07,0.07,0.24),STEEL(),rt)
        box(name+'_foot',(x,0,0.025),(0.08,0.52,0.05),STEEL(),rt)
    return rt
def leg_press(name='LegPress',angle=45):
    rt=root(name)
    box(name+'_base',(0.35,0,0.06),(2.1,0.9,0.12),STEEL(),rt,bev=0.01)
    box(name+'_seat',(-0.45,0,0.31),(0.45,0.5,0.08),PAD(),rt,bev=0.02)
    box(name+'_seatframe',(-0.5,0,0.19),(0.4,0.3,0.16),STEEL(),rt)
    bk=root(name+'_backpivot'); bk.parent=rt; bk.location=(-0.66,0,0.34); bk.rotation_euler=(0,-D(52),0)
    box(name+'_back',(0,0,0.34),(0.08,0.5,0.66),PAD(),bk,bev=0.02)
    rail=root(name+'_rail'); rail.parent=rt; rail.location=(0.05,0,0.30); rail.rotation_euler=(0,-D(angle),0)
    for sg in (1,-1): box(name+'_railbar',(0.85,sg*0.38,-0.06),(1.7,0.06,0.06),CHROME(),rail)
    box(name+'_tower',(1.35,0,0.75),(0.12,0.9,1.5),STEEL(),rt)
    sled=root(name+'_Sled'); sled.parent=rail; sled.location=(0.5,0,0.0)
    box(name+'_plate',(0,0,0.18),(0.05,0.62,0.56),STEEL(),sled,bev=0.01)
    box(name+'_platepad',(-0.03,0,0.18),(0.01,0.58,0.52),RUBBER(),sled)
    box(name+'_carriage',(0.15,0,-0.02),(0.30,0.80,0.06),STEEL(),sled)
    for sg in (1,-1):
        cyl(name+'_horn',(0.2,sg*0.48,0.05),0.025,0.22,'Y',CHROME(),sled)
        o=plate(name+'_wt'+('L' if sg>0 else 'R'),sg*0.48,0.2,0.05,sled)
        for c in [c for c in sled.children if c.name.startswith(name+'_wt')]: pass
    for sg in (1,-1): cyl(name+'_hnd',(-0.45,sg*0.33,0.38),0.016,0.20,'X',RUBBER(),rt); box(name+'_hndpost',(-0.45,sg*0.33,0.33),(0.04,0.04,0.1),STEEL(),rt)
    return rt
def stack(name,parent,x,y,n=12):
    st=root(name+'_WeightStack'); st.parent=parent; st.location=(x,y,0.10)
    for i in range(n): box(name+'_wplate',(0,0,i*0.032),(0.24,0.13,0.028),STEEL() if i%2 else mat('StackGrey',(0.15,0.15,0.16),0.4,0.6),st)
    cyl(name+'_guide',(x+0.08,y,0.9),0.009,1.6,'Z',CHROME(),parent); cyl(name+'_guide',(x-0.08,y,0.9),0.009,1.6,'Z',CHROME(),parent)
    box(name+'_base',(x,y,0.05),(0.3,0.2,0.1),RUBBER(),parent)
    return st
def cable_line(name,parent):
    """unit cable along -Z from origin, scale Z = length"""
    bm=bmesh.new(); bmesh.ops.create_cone(bm,cap_ends=True,segments=8,radius1=0.004,radius2=0.004,depth=1.0)
    for v in bm.verts: v.co.z-=0.5
    o=_obj(name,bm,mat('Cable',(0.02,0.02,0.02),0.6),parent); return o
def cable_tower(name='Cable',handle='rope'):
    rt=root(name)
    for sg in (1,-1): box(name+'_side',(sg*0.2,0.05,1.1),(0.07,0.30,2.2),STEEL(),rt,bev=0.006)
    box(name+'_top',(0,0.05,2.17),(0.47,0.32,0.07),STEEL(),rt); box(name+'_base',(0,0.05,0.03),(0.7,0.7,0.06),STEEL(),rt)
    box(name+'_back',(0,0.19,1.1),(0.36,0.02,2.1),STEEL(),rt)
    stack(name,rt,0,0.06)
    box(name+'_arm',(0,-0.12,2.0),(0.08,0.30,0.06),STEEL(),rt)
    cyl(name+'_pulley',(0,-0.27,1.97),0.045,0.025,'X',CHROME(),rt)
    h=root(name+'_Handle'); h.parent=rt; h.location=(0,-0.4,1.4)
    if handle=='rope':
        cyl(name+'_clamp',(0,0,-0.02),0.016,0.05,'Z',CHROME(),h)
        for sg in (1,-1):
            cyl(name+'_rope',(sg*0.045,0,-0.13),0.012,0.22,'Z',mat('Rope',(0.05,0.05,0.06),0.9),h).rotation_euler=(0,D(sg*-22),0)
            cyl(name+'_ropeEnd',(sg*0.085,0,-0.24),0.021,0.05,'Z',RUBBER(),h)
    else:
        cyl(name+'_clamp',(0,0,-0.02),0.014,0.05,'Z',CHROME(),h)
        for sg in (1,-1): box(name+'_dside',(sg*0.06,0,-0.07),(0.012,0.02,0.11),CHROME(),h)
        cyl(name+'_dgrip',(0,0,-0.12),0.017,0.12,'X',RUBBER(),h)
    cable_line(name+'_CableLine',rt).location=(0,-0.27,1.95)
    return rt
def lat_pulldown(name='Pulldown'):
    rt=root(name)
    box(name+'_col',(0,0.42,1.15),(0.14,0.14,2.3),STEEL(),rt,bev=0.006); box(name+'_arm',(0,0.12,2.25),(0.12,0.66,0.08),STEEL(),rt)
    box(name+'_base',(0,0.15,0.03),(0.62,1.3,0.06),STEEL(),rt)
    box(name+'_seat',(0,0.0,0.37),(0.38,0.36,0.07),PAD(),rt,bev=0.02); box(name+'_seatpost',(0,0.12,0.18),(0.07,0.07,0.32),STEEL(),rt)
    box(name+'_seatbar',(0,0.06,0.33),(0.07,0.16,0.04),STEEL(),rt)
    box(name+'_kneepost',(0,-0.0,0.56),(0.05,0.05,0.3),STEEL(),rt)
    box(name+'_knee',(0,-0.16,0.60),(0.46,0.09,0.09),PAD(),rt,bev=0.035)
    box(name+'_kneearm',(0,-0.08,0.60),(0.05,0.16,0.04),STEEL(),rt)
    stack(name,rt,0,0.58)
    cyl(name+'_pulley',(0,-0.15,2.2),0.045,0.025,'X',CHROME(),rt)
    bar=root(name+'_Bar'); bar.parent=rt; bar.location=(0,-0.15,1.4)
    cyl(name+'_barbar',(0,0,0),0.014,0.95,'X',CHROME(),bar); cyl(name+'_clamp',(0,0,0.02),0.012,0.04,'Z',CHROME(),bar)
    for sg in (1,-1):
        cyl(name+'_bend',(sg*0.52,0,-0.05),0.015,0.14,'Z',CHROME(),bar).rotation_euler=(0,D(sg*35),0)
        cyl(name+'_grip',(sg*0.36,0,0),0.019,0.14,'X',RUBBER(),bar)
    cable_line(name+'_CableLine',rt).location=(0,-0.15,2.18)
    return rt
def treadmill(name='Treadmill',lugs=8):
    rt=root(name)
    box(name+'_deck',(0,0,0.13),(0.66,1.75,0.14),STEEL(),rt,bev=0.02)
    box(name+'_belt',(0,0,0.205),(0.50,1.62,0.01),RUBBER(),rt)
    for sg in (1,-1):
        box(name+'_siderail',(sg*0.30,0,0.215),(0.07,1.66,0.02),mat('Grey',(0.2,0.2,0.21),0.5,0.4),rt)
        box(name+'_upr',(sg*0.34,-0.78,0.72),(0.05,0.06,1.1),STEEL(),rt)
        box(name+'_rail',(sg*0.34,-0.58,1.08),(0.04,0.42,0.04),CHROME(),rt)
    box(name+'_console',(0,-0.84,1.30),(0.70,0.12,0.24),STEEL(),rt,bev=0.02)
    box(name+'_screen',(0,-0.775,1.32),(0.42,0.01,0.14),ACCENT(),rt)
    for i in range(lugs):
        l=box(f'{name}_Lug{i}',(0,0,0),(0.48,0.025,0.004),mat('BeltLine',(0.09,0.09,0.09),0.8),rt); l.location=(0,-0.8+i*1.6/lugs,0.212)
    return rt
def bike(name='Bike',saddle=(0,0.27,0.70),crank=(0,0.04,0.31),bars=(0,-0.30,0.96)):
    rt=root(name)
    box(name+'_base',(0,0,0.04),(0.5,1.05,0.06),STEEL(),rt)
    box(name+'_frame',(0,crank[1]+0.02,0.45),(0.08,0.08,0.7),STEEL(),rt).rotation_euler=(D(-12),0,0)
    box(name+'_seatpost',(0,saddle[1],saddle[2]-0.2),(0.05,0.05,0.36),CHROME(),rt)
    box(name+'_saddle',(saddle[0],saddle[1]+0.02,saddle[2]-0.03),(0.17,0.27,0.06),PAD(),rt,bev=0.025)
    box(name+'_bars',bars,(0.48,0.05,0.04),CHROME(),rt); box(name+'_stem',(0,bars[1]+0.02,bars[2]-0.25),(0.05,0.05,0.5),STEEL(),rt)
    cyl(name+'_fly',(0,-0.30,0.33),0.21,0.05,'X',STEEL(),rt,seg=36); cyl(name+'_flyrim',(0,-0.30,0.33),0.215,0.02,'X',ACCENT(),rt,seg=36); box(name+'_guard',(0,-0.30,0.33),(0.08,0.30,0.30),mat('Shroud',(0.18,0.18,0.19),0.5,0.3),rt,bev=0.03)
    cyl(name+'_axle',crank,0.03,0.24,'X',CHROME(),rt)
    cr=root(name+'_Crank'); cr.parent=rt; cr.location=crank
    for sg in (1,-1):
        box(name+'_crankarm',(sg*0.10,0,sg*0.075),(0.02,0.035,0.17),STEEL(),cr)
    for S,sg in (('L',1),('R',-1)):
        p=root(f'{name}_Pedal{S}'); p.parent=rt
        box(name+'_pedal',(sg*0.03,0,0),(0.09,0.11,0.02),RUBBER(),p)
    return rt
