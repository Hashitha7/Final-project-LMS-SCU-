"""
app.py — Flask REST API for Science AI Answer Analyst
Endpoints:
  POST /api/upload-and-analyze  — Upload PDF/PNG + analyze student answer
  GET  /api/topics              — Get available topics by grade/subject
  GET  /api/health              — Health check
"""

import os
import uuid
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from extractor import extract_text
from analyzer import get_analyzer

app = Flask(__name__)
CORS(app)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Validation constants ───────────────────────────────────────────────────────
ALLOWED_EXT      = {'.pdf'}          # Only PDF (no Tesseract installed)
MAX_FILE_SIZE_MB = 10                # Max file size in MB
MIN_WORD_COUNT   = 15                # Min words required after extraction


def is_english_enough(text, threshold=0.70):
    """Return True if >= threshold fraction of words are ASCII-English."""
    words = text.split()
    if not words:
        return False
    ascii_words = sum(1 for w in words if all(ord(c) < 128 for c in w))
    return (ascii_words / len(words)) >= threshold


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    analyzer = get_analyzer()
    return jsonify({
        "status": "healthy",
        "model_loaded": analyzer.is_loaded,
        "questions_available": len(analyzer.dataset) if analyzer.dataset else 0
    })


@app.route('/api/topics', methods=['GET'])
def get_topics():
    """Get available topics, optionally filtered by grade and subject"""
    grade = request.args.get('grade')
    subject = request.args.get('subject')
    
    analyzer = get_analyzer()
    topics = analyzer.get_topics(grade=grade, subject=subject)
    
    return jsonify({
        "success": True,
        "topics": topics,
        "total": len(topics)
    })


@app.route('/api/upload-and-analyze', methods=['POST'])
def upload_and_analyze():
    """
    Upload a student answer file (PDF or PNG) and analyze it.
    
    Form data:
        file: The PDF/PNG file
        grade: Grade level (10 or 11) — optional
        subject: Subject (Biology, Chemistry, Physics) — optional
        topic: Topic name — optional
        question_id: Specific question ID — optional
    """
    # Check for file
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "error": "No file uploaded. Please upload a PDF or PNG file."
        }), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    # ── Validation 1: File type ────────────────────────────────────────────────
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        return jsonify({
            "success": False,
            "error": f"Invalid file type '{ext}'. Only PDF files are accepted. Please convert your answer sheet to PDF and try again."
        }), 400

    # ── Validation 2: File size ────────────────────────────────────────────────
    file.seek(0, 2)          # Seek to end
    file_size_mb = file.tell() / (1024 * 1024)
    file.seek(0)             # Reset
    if file_size_mb > MAX_FILE_SIZE_MB:
        return jsonify({
            "success": False,
            "error": f"File too large ({file_size_mb:.1f} MB). Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        }), 400
    
    # Save file temporarily
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    file.save(file_path)
    
    try:
        # Step 1: Extract text from file
        extraction_result = extract_text(file_path)
        
        if not extraction_result['success']:
            return jsonify({
                "success": False,
                "error": f"Text extraction failed: {extraction_result.get('error', 'Unknown error')}. Please ensure the PDF contains typed (not handwritten) text.",
                "extraction": extraction_result
            }), 422

        extracted_text = extraction_result['text']
        word_count = len(extracted_text.split())

        # ── Validation 3: Minimum word count ──────────────────────────────────
        if not extracted_text or word_count < MIN_WORD_COUNT:
            return jsonify({
                "success": False,
                "error": f"The extracted text is too short ({word_count} words). Please write a more detailed answer with at least {MIN_WORD_COUNT} words, then try again."
            }), 422

        # ── Validation 4: English language check ──────────────────────────────
        if not is_english_enough(extracted_text):
            return jsonify({
                "success": False,
                "error": "The answer appears to contain non-English text. This system only evaluates English language answers. Please write your answer in English."
            }), 422
        
        # Step 2: Get analysis parameters
        grade = request.form.get('grade')
        subject = request.form.get('subject')
        topic = request.form.get('topic')
        question_id = request.form.get('question_id')
        # Step 3: Split and Analyze the answer(s)
        import re
        # Stricter pattern: Matches "Q1", "Question 1", "A1", "Answer 1" at the start of a line. 
        # Prevents numbered lists (1., 2.) inside answers from being split into new questions.
        pattern = r'(?im)^\s*(?:Q(?:uestion)?|A(?:nswer)?|Prashnaya)?\s*[\.\-:]?\s*\d+[\.\)\-:]?\s*'
        
        # Check if the document has explicit question markers
        has_markers = bool(re.search(r'(?im)^\s*(?:Q(?:uestion)?|A(?:nswer)?)\s*\d+', extracted_text))
        
        # If no explicit markers found, we'll try to use the old pattern as a fallback, 
        # but it's risky for lists. Best is to encourage users to use Q1, Q2.
        if not has_markers:
            pattern = r'(?im)^\s*(?:Q(?:uestion)?\s*\d+|[0-9]+[\.\)])[\s:]*'

        parts = re.split(pattern, extracted_text)
        matches = list(re.finditer(pattern, extracted_text))
        headers = [m.group(0).strip() for m in matches]
        
        analyzer = get_analyzer()
        answers = []
        
        if len(headers) == 0:
            answers.append(('Answer', extracted_text))
        else:
            intro = parts[0].strip()
            if len(intro) > 30: # Only if intro text is substantial
                answers.append(('Intro', intro))
            for i, header in enumerate(headers):
                content = parts[i+1].strip()
                if len(content) > 5:
                    answers.append((header, content))
        
        valid_answers = 0
        total_score = 0
        total_sim = 0
        total_kw = 0
        all_matched = []
        all_missed = []
        combined_feedback = ""
        
        num_questions = len(answers)
        
        for header, content in answers:
            # KEY FIX: For multi-question papers, each fragment independently
            # finds its own best-matching question from the dataset.
            # We only lock to question_id for a single-question upload,
            # otherwise we let each fragment self-discover its topic.
            if num_questions == 1:
                # Single question — use the teacher-specified question_id/topic/subject
                res = analyzer.analyze_answer(content, question_id, grade, subject, topic)
            else:
                # Multi-question / mixed paper — pass subject=None so the AI
                # auto-detects the correct subject for EACH question independently
                # across Biology, Chemistry, AND Physics in the dataset.
                res = analyzer.analyze_answer(content, None, grade, None, None)
            
            if not res.get('success', False) and "short" in res.get('error', ''):
                continue
            
            valid_answers += 1
            score = res.get('score', 0)
            total_score += score
            total_sim += res.get('similarity_score', 0)
            total_kw += res.get('keyword_coverage', 0)
            
            prefix = "" if header in ["Answer", "Intro"] else f"{header} "
            matched_topic = res.get('question_topic', '')
            topic_label = f" [{matched_topic}]" if matched_topic and num_questions > 1 else ""
            
            for kw in res.get('matched_keywords', []):
                all_matched.append(f"{prefix}{kw}")
            for kw in res.get('missed_keywords', []):
                all_missed.append(f"{prefix}{kw}")
            
            # Include the auto-detected topic in feedback for transparency
            combined_feedback += f"\n\n### {header}{topic_label} (Score: {score}%)\n{res.get('feedback', '')}"
        
        if valid_answers == 0:
            # Fallback if splitting somehow failed to yield valid content
            analysis_result = analyzer.analyze_answer(extracted_text, question_id, grade, subject, topic)
        else:
            avg_score = round(total_score / valid_answers, 1)
            
            if avg_score >= 80: grade_label = "Excellent"
            elif avg_score >= 60: grade_label = "Good"
            elif avg_score >= 40: grade_label = "Fair"
            else: grade_label = "Needs Improvement"
            
            # Remove duplicates but preserve order and casing
            unique_matched = list(dict.fromkeys(all_matched))
            unique_missed = list(dict.fromkeys(all_missed))
            
            analysis_result = {
                "success": True,
                "score": avg_score,
                "grade": grade_label,
                "similarity_score": round(total_sim / valid_answers, 1),
                "keyword_coverage": round(total_kw / valid_answers, 1),
                "matched_keywords": unique_matched,
                "missed_keywords": unique_missed,
                "total_keywords": len(unique_matched) + len(unique_missed),
                "matched_count": len(unique_matched),
                "missed_count": len(unique_missed),
                "feedback": f"📊 **Paper Analysis ({valid_answers} questions analyzed)**\n" + combined_feedback.strip(),
                "question_topic": topic or "Multi-Question Paper",
                "word_count": len(extracted_text.split())
            }
        
        # Add extraction info to result
        analysis_result['extracted_text'] = extracted_text
        analysis_result['extraction_info'] = {
            'file_name': file.filename,
            'file_type': ext,
            'pages': extraction_result.get('pages'),
            'word_count': extraction_result.get('word_count', len(extracted_text.split()))
        }
        
        return jsonify(analysis_result)
    
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)


@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Analyze a student answer provided as plain text (no file upload).
    
    JSON body:
        answer_text: The student's answer text
        grade: Grade level (10 or 11) — optional
        subject: Subject (Biology, Chemistry, Physics) — optional
        topic: Topic name — optional
        question_id: Specific question ID — optional
    """
    data = request.get_json()
    
    if not data or 'answer_text' not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'answer_text' in request body."
        }), 400
    
    analyzer = get_analyzer()
    result = analyzer.analyze_answer(
        student_answer=data['answer_text'],
        question_id=data.get('question_id'),
        grade=data.get('grade'),
        subject=data.get('subject'),
        topic=data.get('topic')
    )
    
    return jsonify(result)


if __name__ == '__main__':
    print("🧪 Science AI Answer Analyst — Flask Service")
    print("=" * 50)
    
    analyzer = get_analyzer()
    if analyzer.is_loaded:
        print(f"📚 {len(analyzer.dataset)} questions loaded from trained model")
    else:
        print("⚠️  No trained model found. Running in fallback mode.")
        print("   Run Google Colab training to get better accuracy!")
    
    print(f"\n🚀 Starting server on http://localhost:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
