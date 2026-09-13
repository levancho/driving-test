from pathlib import Path
import pypdfium2 as pdfium
import json
root=Path(__file__).parent
doc=pdfium.PdfDocument(r'C:/Users/dleva/Downloads/mv21.pdf')
(root/'reference').mkdir(exist_ok=True)
pages={str(i+1):p.get_textpage().get_text_range().replace('\r','') for i,p in enumerate(doc)}
(root/'reference/ny-pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'dist/manual-pages-ny.json').write_text(json.dumps(pages,ensure_ascii=False),encoding='utf-8')
doc[0].render(scale=1).to_pil().save(root/'reference/ny-cover.png')
print(f'{len(doc)} PDF pages')
for i in range(1,5): print(f'PDF PAGE {i}: '+pages[str(i)].encode('ascii','replace').decode()[:6000])
