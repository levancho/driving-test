from pathlib import Path
from pypdf import PdfReader
root = Path(__file__).parent
doc = PdfReader(r'C:/Users/dleva/Downloads/drivermanual.pdf').pages
(root / 'reference').mkdir(exist_ok=True)
text = '\n\n'.join(f'=== PDF PAGE {i+1} ===\n{page.extract_text()}' for i, page in enumerate(doc))
(root / 'reference/manual.txt').write_text(text, encoding='utf-8')
print(f'{len(doc)} pages extracted')
print(text[:14000])
