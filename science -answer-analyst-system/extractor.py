"""
extractor.py — Text extraction from PDF and PNG/JPG files
Supports: PDF (via pdfplumber), PNG/JPG (via pytesseract OCR)
"""

import os
import re

# PDF extraction
try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print(" pdfplumber not installed. PDF extraction disabled.")

# Image OCR extraction
try:
    import pytesseract
    from PIL import Image
    # Set the Tesseract binary path explicitly
    TESSERACT_PATH = r'C:\Users\User\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    # Test if Tesseract binary is actually available
    try:
        pytesseract.get_tesseract_version()
        OCR_SUPPORT = True
        print(" Tesseract OCR detected — PNG/JPG image uploads enabled!")
    except pytesseract.TesseractNotFoundError:
        OCR_SUPPORT = False
        print(" Tesseract binary not found. Image OCR disabled.")
except ImportError:
    OCR_SUPPORT = False
    print(" pytesseract/Pillow not installed. Image OCR disabled.")


def clean_text(text):
    """Clean extracted text: remove extra whitespace, fix common OCR artifacts"""
    if not text:
        return ""
    # Remove multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove multiple newlines (keep max 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove leading/trailing whitespace per line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    # Remove very short lines (likely OCR noise)
    lines = text.split('\n')
    lines = [l for l in lines if len(l) > 2 or l == '']
    return '\n'.join(lines).strip()


def extract_from_pdf(file_path):
    """Extract text from a PDF file using pdfplumber"""
    if not PDF_SUPPORT:
        return {"success": False, "error": "pdfplumber not installed", "text": ""}
    
    try:
        all_text = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text.append(text)
        
        full_text = '\n\n'.join(all_text)
        cleaned = clean_text(full_text)
        
        return {
            "success": True,
            "text": cleaned,
            "pages": len(all_text),
            "word_count": len(cleaned.split())
        }
    except Exception as e:
        return {"success": False, "error": str(e), "text": ""}


def extract_from_image(file_path):
    """Extract text from a PNG/JPG image using Tesseract OCR"""
    if not OCR_SUPPORT:
        return {
            "success": False,
            "error": "Image upload requires Tesseract OCR which is not installed on this server. Please upload a PDF file instead.",
            "text": ""
        }
    
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image, lang='eng')
        cleaned = clean_text(text)
        
        return {
            "success": True,
            "text": cleaned,
            "word_count": len(cleaned.split())
        }
    except pytesseract.TesseractNotFoundError:
        return {
            "success": False,
            "error": "Tesseract OCR is not installed. Please upload a PDF file instead.",
            "text": ""
        }
    except Exception as e:
        return {"success": False, "error": str(e), "text": ""}


def extract_text(file_path):
    """
    Auto-detect file type and extract text.
    Supports: .pdf, .png, .jpg, .jpeg
    """
    if not os.path.exists(file_path):
        return {"success": False, "error": f"File not found: {file_path}", "text": ""}
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.pdf':
        return extract_from_pdf(file_path)
    elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']:
        return extract_from_image(file_path)
    else:
        return {"success": False, "error": f"Unsupported file type: {ext}", "text": ""}


if __name__ == '__main__':
    # Quick test
    import sys
    if len(sys.argv) > 1:
        result = extract_text(sys.argv[1])
        print(f"Success: {result['success']}")
        print(f"Words: {result.get('word_count', 0)}")
        print(f"Text preview: {result['text'][:500]}")
    else:
        print("Usage: python extractor.py <file_path>")
