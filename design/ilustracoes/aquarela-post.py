import sys, numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(5)
def noise(h, w, scale, oct=3):
    out=np.zeros((h,w)); amp=1; tot=0
    for o in range(oct):
        s=scale*2**o
        g=Image.fromarray((rng.random((max(2,int(h*s)),max(2,int(w*s))))*255).astype(np.uint8)).resize((w,h),Image.BICUBIC)
        out+=amp*np.asarray(g,float)/255; tot+=amp; amp*=.5
    return out/tot
def blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)),float)/255
name, tone = sys.argv[1], tuple(int(sys.argv[2][i:i+2],16) for i in (0,2,4))
im = np.asarray(Image.open(f'{name}-raw.png').convert('RGBA'), float)/255
h, w = im.shape[:2]
rgb, a = im[...,:3], im[...,3]
# 1) papel branco por baixo → trabalhar em "absorbância"
A = -np.log(np.clip(rgb*a[...,None] + (1-a[...,None]), 0.02, 1))
# 2) variação de pigmento (manchas suaves) e granulação
A *= (0.82 + 0.36*noise(h,w,0.006))[...,None]
A *= (0.9 + 0.2*noise(h,w,0.2,2))[...,None]
# 3) escurecimento de borda: onde a tinta termina, acumula pigmento
lum = A.mean(-1)
edge = np.clip(np.abs(lum - blur(np.clip(lum/2,0,1),3)*2)*1.2, 0, 1)
A *= (1 + 0.45*edge)[...,None]
# 4) leve sangramento (tinta espalhando)
bl = np.stack([blur(np.clip(A[...,c]/3,0,1),2.2)*3 for c in range(3)], -1)
A = 0.7*A + 0.3*bl
# 5) respingos
def splat(cx, cy, spread, col, n):
    k = -np.log(np.clip(np.array(col)/255, .02, 1))
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(n):
        ang=rng.uniform(0,2*np.pi); d=abs(rng.normal(0,spread))
        x=cx+np.cos(ang)*d*1.5; y=cy+np.sin(ang)*d
        r=rng.choice([2,3,4,6,9,14],p=[.3,.25,.2,.12,.08,.05])
        x0,x1=int(max(0,x-r-3)),int(min(w,x+r+3)); y0,y1=int(max(0,y-r-3)),int(min(h,y+r+3))
        if x0>=x1 or y0>=y1: continue
        d2=((xx[y0:y1,x0:x1]-x)**2+(yy[y0:y1,x0:x1]-y)**2)/r**2
        m=np.clip(1.3-d2,0,1)**.7*(0.5+0.5*rng.random())
        A[y0:y1,x0:x1]+= m[...,None]*k*0.9
splat(w*0.86, h*0.2, 70, tone, 30)
splat(w*0.12, h*0.8, 60, tone, 24)
splat(w*0.55, h*0.1, 40, (196,154,85), 12)
out = np.exp(-A)*255
inv = 255-out; alpha=inv.max(-1)
col = 255 - inv/np.maximum(alpha[...,None],1)*255
img = Image.fromarray(np.dstack([col,alpha]).clip(0,255).astype(np.uint8),'RGBA')
bb = img.getbbox(); img = img.crop((bb[0]-10,bb[1]-10,bb[2]+10,bb[3]+10))
img = img.resize((800, int(img.height*800/img.width)), Image.LANCZOS)
img.save(f'{name}.webp','WEBP',quality=90,method=6)
bg=Image.new('RGBA',img.size,(250,248,244,255)); bg.alpha_composite(img); bg.convert('RGB').save(f'{name}-final.png')
print(img.size)
