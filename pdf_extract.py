from pathlib import Path
import PyPDF2
pdf = Path('assets/images/ISHAS.pdf')
print('PDF exists', pdf.exists())
reader = PyPDF2.PdfReader(str(pdf))
print('pages', len(reader.pages))
for i in range(min(3, len(reader.pages))):
    print('---PAGE', i+1, '---')
    text = reader.pages[i].extract_text() or ''
    print(text[:2000])
