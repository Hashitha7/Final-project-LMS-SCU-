"""
extract_papers.py — Extract Questions & Answers from Past Papers + Teacher Guides
Builds an enriched science_dataset.csv with 2000+ Q&A pairs
"""
import os
import re
import csv
import pdfplumber
import pandas as pd
from pathlib import Path

# ─── CONFIG ──────────────────────────────────────────────────────────────────
PAPERS_FOLDER = r"C:\Users\User\Downloads\New folder (8)"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXISTING_CSV = os.path.join(BASE_DIR, "data", "science_dataset.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "data", "science_dataset.csv")

# ─── Subject Detection ───────────────────────────────────────────────────────
BIO_KEYWORDS = ['cell', 'plant', 'animal', 'organ', 'blood', 'tissue', 'dna', 'gene',
                'photosynthesis', 'respiration', 'ecosystem', 'species', 'reproduction',
                'nervous', 'digestive', 'heart', 'brain', 'enzyme', 'protein', 'bacteria',
                'virus', 'evolution', 'ecology', 'nutrition', 'chlorophyll', 'mitosis',
                'membrane', 'chromosome', 'hormone', 'vaccine', 'antibiotic', 'fungi']
CHEM_KEYWORDS = ['atom', 'molecule', 'element', 'compound', 'reaction', 'acid', 'base',
                 'salt', 'metal', 'chemical', 'bond', 'electron', 'proton', 'periodic',
                 'solution', 'ph', 'ion', 'organic', 'carbon', 'hydrogen', 'oxygen',
                 'formula', 'oxidation', 'reduction', 'electrolysis', 'polymer', 'mixture',
                 'distillation', 'neutralisation', 'alloy', 'corrosion', 'catalyst']
PHYS_KEYWORDS = ['force', 'energy', 'motion', 'speed', 'velocity', 'wave', 'light',
                 'sound', 'electric', 'magnet', 'current', 'voltage', 'resistance', 'power',
                 'work', 'heat', 'temperature', 'pressure', 'gravity', 'momentum',
                 'frequency', 'lens', 'mirror', 'circuit', 'friction', 'newton', 'mass',
                 'density', 'acceleration', 'nuclear', 'radiation', 'transformer', 'motor']

def detect_subject(text):
    text_lower = text.lower()
    scores = {
        'Biology': sum(1 for k in BIO_KEYWORDS if k in text_lower),
        'Chemistry': sum(1 for k in CHEM_KEYWORDS if k in text_lower),
        'Physics': sum(1 for k in PHYS_KEYWORDS if k in text_lower)
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'General Science'

def detect_grade(filename):
    fn = filename.lower()
    if 'grade 10' in fn or 'gr10' in fn or 'g10' in fn:
        return 10
    if 'grade 11' in fn or 'gr11' in fn or 'g11' in fn:
        return 11
    # O/L papers are Grade 11 level
    if 'olevel' in fn or 'o level' in fn or 'ol ' in fn:
        return 11
    return 11  # default

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF"""
    all_text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text.append(text)
    except Exception as e:
        print(f"  ⚠️ Error reading {pdf_path}: {e}")
    return "\n".join(all_text)

def extract_qa_pairs_from_marking_scheme(text, grade, source_file):
    """
    Extract Q&A pairs from O/L marking scheme / paper-with-answers format.
    Looks for structured answer blocks.
    """
    pairs = []
    
    # Split text into lines for analysis
    lines = text.split('\n')
    
    # Pattern to detect the start of structured Q&A answers in marking schemes
    # e.g., "(01)", "1.", "Q1", "(1)", etc.
    q_pattern = re.compile(
        r'^\s*(?:\(0*(\d+)\)|(\d+)[\.\)]\s|Q\s*(\d+)[\.\):]|Answer\s*(\d+)[:\.])',
        re.IGNORECASE
    )
    
    current_q_num = None
    current_answer_lines = []
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        m = q_pattern.match(line_stripped)
        if m:
            # Save the previous Q&A
            if current_q_num and current_answer_lines:
                answer_text = ' '.join(current_answer_lines).strip()
                if len(answer_text.split()) >= 15:  # Minimum 15 words for a good answer
                    subject = detect_subject(answer_text)
                    pairs.append({
                        'grade': grade,
                        'subject': subject,
                        'topic': f"Q{current_q_num} from {Path(source_file).stem}",
                        'question': f"Answer question {current_q_num} on {subject}.",
                        'model_answer': answer_text[:2000]
                    })
            
            # Start new question
            q_num = m.group(1) or m.group(2) or m.group(3) or m.group(4)
            current_q_num = q_num
            rest = line_stripped[m.end():].strip()
            current_answer_lines = [rest] if rest else []
        else:
            if current_q_num:
                current_answer_lines.append(line_stripped)
    
    # Save last Q&A
    if current_q_num and current_answer_lines:
        answer_text = ' '.join(current_answer_lines).strip()
        if len(answer_text.split()) >= 15:
            subject = detect_subject(answer_text)
            pairs.append({
                'grade': grade,
                'subject': subject,
                'topic': f"Q{current_q_num} from {Path(source_file).stem}",
                'question': f"Answer question {current_q_num} on {subject}.",
                'model_answer': answer_text[:2000]
            })
    
    return pairs

def extract_qa_from_teacher_guide(text, grade, source_file):
    """
    Extract Q&A pairs from Teacher Guides (Guru Athpotha).
    Teacher guides have topic headings + paragraph explanations.
    """
    pairs = []
    
    # Split by section headings (all caps lines or lines ending in ':')
    sections = re.split(r'\n(?=[A-Z][A-Z\s]{5,60}\n|[A-Z][^\n]{5,60}:\s*\n)', text)
    
    for section in sections:
        lines = section.strip().split('\n')
        if len(lines) < 4:
            continue
        
        # First line = topic heading
        topic = lines[0].strip()
        content = ' '.join(lines[1:]).strip()
        content = re.sub(r'\s+', ' ', content)
        
        if len(content.split()) < 30:
            continue
        
        subject = detect_subject(content)
        
        # Create multiple Q variations from long paragraphs (chunk it)
        words = content.split()
        chunk_size = 120  # ~120 words per chunk
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if len(chunk.split()) < 25:
                continue
            
            pairs.append({
                'grade': grade,
                'subject': subject,
                'topic': topic[:100],
                'question': f"Explain {topic}.",
                'model_answer': chunk[:2000]
            })
    
    return pairs

# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    print("🚀 Science Dataset Extraction Tool")
    print("=" * 50)
    
    # Load existing dataset
    existing_df = pd.read_csv(EXISTING_CSV) if os.path.exists(EXISTING_CSV) else pd.DataFrame()
    print(f"📂 Existing dataset: {len(existing_df)} questions\n")
    
    all_new_pairs = []
    
    pdf_files = [f for f in os.listdir(PAPERS_FOLDER) if f.lower().endswith('.pdf')]
    print(f"📁 Found {len(pdf_files)} PDF files to process:\n")
    
    for pdf_file in sorted(pdf_files):
        pdf_path = os.path.join(PAPERS_FOLDER, pdf_file)
        grade = detect_grade(pdf_file)
        is_teacher_guide = 'teacher' in pdf_file.lower() or 'guide' in pdf_file.lower()
        
        print(f"📖 Processing: {pdf_file}")
        print(f"   Grade: {grade} | Type: {'Teacher Guide' if is_teacher_guide else 'Past Paper/Marking Scheme'}")
        
        text = extract_text_from_pdf(pdf_path)
        if not text or len(text.strip()) < 100:
            print(f"   ⚠️ Could not extract enough text, skipping.\n")
            continue
        
        if is_teacher_guide:
            pairs = extract_qa_from_teacher_guide(text, grade, pdf_file)
        else:
            pairs = extract_qa_pairs_from_marking_scheme(text, grade, pdf_file)
        
        print(f"   ✅ Extracted {len(pairs)} Q&A pairs\n")
        all_new_pairs.extend(pairs)
    
    if not all_new_pairs:
        print("❌ No Q&A pairs extracted. Check PDF readability.")
        return
    
    # Build new DataFrame
    new_df = pd.DataFrame(all_new_pairs)
    
    # Combine with existing
    if not existing_df.empty:
        # Align columns
        for col in ['id', 'grade', 'subject', 'topic', 'question', 'model_answer', 'keywords', 'max_score', 'source']:
            if col not in new_df.columns:
                new_df[col] = ''
            if col not in existing_df.columns:
                existing_df[col] = ''
        
        combined_df = pd.concat([existing_df, new_df[existing_df.columns]], ignore_index=True)
    else:
        combined_df = new_df
    
    # Re-assign IDs
    combined_df['id'] = range(1, len(combined_df) + 1)
    combined_df = combined_df.drop_duplicates(subset=['model_answer'], keep='first')
    
    # Save
    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
    combined_df.to_csv(OUTPUT_CSV, index=False)
    
    print("=" * 50)
    print(f"✅ DONE! New dataset saved to: {OUTPUT_CSV}")
    print(f"📊 Total questions: {len(combined_df)}")
    print(f"   (Was: {len(existing_df)} → Now: {len(combined_df)})")
    print(f"\n📊 Breakdown by Subject:")
    if 'subject' in combined_df.columns:
        print(combined_df.groupby(['grade', 'subject']).size().to_string())
    print(f"\n👉 Next Step: Run 'python train_model.py' to retrain the AI model!")

if __name__ == "__main__":
    main()
