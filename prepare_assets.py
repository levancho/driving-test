from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont
import json
root=Path(__file__).parent
doc=pdfium.PdfDocument(r'C:/Users/dleva/Downloads/drivermanual.pdf')
(root/'dist/signs').mkdir(exist_ok=True)
for page in [222,223,224]:
    doc[page-1].render(scale=2).to_pil().save(root/f'reference/signs-{page}.png')
for size in [192,512]:
    im=Image.new('RGB',(size,size),'#102a43'); d=ImageDraw.Draw(im)
    font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',int(size*.40))
    d.text((size/2,size*.44),'US',font=font,anchor='mm',fill='white')
    d.rounded_rectangle((size*.23,size*.69,size*.77,size*.75),radius=size*.02,fill='#d7f277')
    im.save(root/f'dist/icon-{size}.png')
    im.save(root/f'dist/icon-us-{size}.png')
pages=[18,19,40,42,53,54,57,58,67,68,72,83,84,94,95,97,99,106,117,148,212,213,214,215]
alltext={str(i):doc[i+1].get_textpage().get_text_range().replace('\r','') for i in pages}
(root/'reference/selected.json').write_text(json.dumps(alltext,ensure_ascii=False,indent=2),encoding='utf-8')
print('Icons and sign reference pages ready')
