from pathlib import Path
from PIL import Image
import pypdfium2 as pdfium
import json
root=Path(__file__).parent
doc=pdfium.PdfDocument(r'C:/Users/dleva/Downloads/drivermanual.pdf')
grid=[('two-way',0,0),('sharp-turn',1,0),('divided',2,0),('winding',0,1),('merge',1,1),('hill',2,1),('lane-reduction',3,1),('crossroad',0,2),('school',2,2),('slippery',3,2),('hospital',0,3),('yield-ahead',2,3),('signal-ahead',3,3),('workers',0,4),('flagger',1,4)]
im=Image.open(root/'reference/signs-222.png')
def crop(image,name,box):
    sx,sy=image.width/756,image.height/1080
    image.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(box))).save(root/f'dist/signs/{name}.png')
for name,col,row in grid:
    x=40+168*col; y=108+189*row
    crop(im,name,(x,y,x+142,y+138))
crop(Image.open(root/'reference/signs-223.png'),'no-uturn',(245,303,386,442))
crop(Image.open(root/'reference/signs-223.png'),'bicycles',(75,684,217,824))
last=Image.open(root/'reference/signs-224.png')
crop(last,'keep-right',(540,496,680,634))
crop(last,'railroad',(40,858,183,997))
crop(last,'crossbuck',(379,866,517,999))
pages={str(i-1):page.get_textpage().get_text_range().replace('\r','').replace('\ufffe','') for i,page in enumerate(doc) if i>=2}
(root/'dist/manual-pages.json').write_text(json.dumps(pages,ensure_ascii=False),encoding='utf-8')
print('20 sign images and manual pages packaged')
