from pathlib import Path
import pypdfium2 as pdfium
root = Path(__file__).parent
doc = pdfium.PdfDocument(r'C:/Users/dleva/Downloads/drivermanual.pdf')
(root/'reference').mkdir(exist_ok=True)
text = '\n\n'.join(f'=== PDF PAGE {i+1} ===\n{page.get_textpage().get_text_range()}' for i,page in enumerate(doc)).replace('\r','')
(root/'reference/manual-fast.txt').write_text(text,encoding='utf-8')
doc[0].render(scale=0.8).to_pil().save(root/'reference/cover.png')
print(f'Extracted {len(doc)} pages')
