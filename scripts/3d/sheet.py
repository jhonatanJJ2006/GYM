import sys,glob
from PIL import Image
fs=sys.argv[2:]; ims=[Image.open(f) for f in fs]; w,h=ims[0].size; c=3
W=Image.new('RGB',(w*c,h*((len(ims)+c-1)//c)))
for i,im in enumerate(ims): W.paste(im,((i%c)*w,(i//c)*h))
W.save(sys.argv[1])
