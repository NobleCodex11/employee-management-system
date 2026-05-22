import sys

try:
    # pyrefly: ignore [missing-import]
    import pypdf
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    # pyrefly: ignore [missing-import]
    import pypdf

def extract_text(pdf_path, txt_path):
    with open(pdf_path, 'rb') as f:
        reader = pypdf.PdfReader(f)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n\n'
    
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    extract_text("Project Documentation - CMSv2024_MacFast v01.pdf", "project_requirements.txt")
