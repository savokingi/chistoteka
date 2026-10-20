import concurrent.futures, html, io, json, re, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
items = []
def page(url):
    return urllib.request.urlopen(url, timeout=30).read().decode('utf-8')
service = page('https://chistoteca.ru/')
academy = page('https://chisto.academy/obuchenie')
telegram = page('https://t.me/s/chisto_academy')
urls = list(dict.fromkeys(re.findall(r"https://static\.tildacdn\.com/tild[^\s\"<>']+\.(?:png|jpg)", service)))
for i, url in enumerate(urls[:28]):
    items.append((f'service-{i:02}', url, 'https://chistoteca.ru/'))
for i, url in enumerate(list(dict.fromkeys(re.findall(r"https://thb\.tildacdn\.com/tild[^\s\"<>']+\.(?:png|jpg)", academy)))[:17]):
    url = re.sub(r'/-/resize/20x/', '/', url).replace('thb.tildacdn.com', 'static.tildacdn.com')
    items.append((f'academy-{i:02}', url, 'https://chisto.academy/obuchenie'))
for tag in re.findall(r'<a[^>]+tgme_widget_message_photo_wrap[^>]+>', telegram):
    image = re.search(r"background-image:url\('([^']+)'", tag)
    post = re.search(r'href="https://t.me/chisto_academy/(\d+)', tag)
    if image and post:
        items.append((f'post-{post[1]}', html.unescape(image[1]), f'https://t.me/chisto_academy/{post[1]}'))
def download(item):
    name, url, source = item
    try:
        raw = urllib.request.urlopen(url, timeout=45).read()
        im = Image.open(io.BytesIO(raw))
        im = ImageOps.exif_transpose(im)
        im.thumbnail((1800, 1800))
        im.save(OUT / f'{name}.webp', 'WEBP', quality=88, method=5)
        return dict(name=name, url=url, source=source, size=list(im.size))
    except Exception as exc:
        return dict(name=name, error=str(exc))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(download, items))
(ROOT / 'asset-sources.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
valid = [r for r in results if 'size' in r]
sheet = Image.new('RGB', (1000, ((len(valid) + 4) // 5) * 190), '#edf0f4')
draw = ImageDraw.Draw(sheet)
for i, result in enumerate(valid):
    im = Image.open(OUT / (result['name'] + '.webp')).convert('RGBA')
    im.thumbnail((190, 160))
    x, y = (i % 5) * 200, (i // 5) * 190
    sheet.paste(im, (x + (190-im.width)//2, y), im)
    draw.text((x+8, y+165), result['name'], fill='#15283e')
sheet.save(ROOT / 'asset-contact-sheet.jpg')
print(json.dumps(results, ensure_ascii=False, indent=2))
