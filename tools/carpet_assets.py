import urllib.request, urllib.parse, re, html, io, json
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
source='https://t.me/s/chisto_academy?q='+urllib.parse.quote('ковёр')
s=urllib.request.urlopen(source).read().decode()
items=[]
for tag in re.findall(r'<a[^>]+tgme_widget_message_photo_wrap[^>]+>',s):
    post=re.search(r'href="https://t.me/chisto_academy/(\d+)',tag)
    image=re.search(r"background-image:url\('([^']+)'",tag)
    if post and image and post[1] in ['48','49','344','389','657','658','659','814','817','861']:
        raw=urllib.request.urlopen(html.unescape(image[1]),timeout=25).read()
        im=Image.open(io.BytesIO(raw));im.thumbnail((1400,1400))
        name='post-'+post[1]
        im.save(root/'public'/'assets'/(name+'.webp'),'WEBP',quality=88)
        items.append((name,im.copy()))
sheet=Image.new('RGB',(800,((len(items)+3)//4)*220),'#eee')
d=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(items):
    im.thumbnail((195,190));x=(i%4)*200;y=(i//4)*220
    sheet.paste(im,(x,y));d.text((x+5,y+195),name,fill='#111')
sheet.save(root/'carpet-contact-sheet.jpg')
print([name for name,_ in items])
