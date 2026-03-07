"""
app.py — Flask REST API for Science AI Answer Analyst
Endpoints:
  POST /api/upload-and-analyze  — Upload PDF/PNG + analyze student answer
  GET  /api/topics              — Get available topics by grade/subject
  GET  /api/health              — Health check
"""

import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from extractor import extract_text
from analyzer import get_analyzer

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React frontend

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
        return jsonify({
            "success": False,
            "error": "No file selected."
        }), 400
    
    # Validate file type
    allowed_extensions = {'.pdf', '.png', '.jpg', '.jpeg'}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        return jsonify({
            "success": False,
            "error": f"Unsupported file type: {ext}. Please upload PDF, PNG, or JPG."
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
                "error": f"Failed to extract text: {extraction_result.get('error', 'Unknown error')}",
                "extraction": extraction_result
            }), 422
        
        extracted_text = extraction_result['text']
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return jsonify({
                "success": False,
                "error": "Could not extract enough text from the file. Please upload a clearer image or PDF.",
                "extraction": extraction_result
            }), 422
        
        # Step 2: Get analysis parameters
        grade = request.form.get('grade')
        subject = request.form.get('subject')
        topic = request.form.get('topic')
        question_id = request.form.get('question_id')
        
        # Step 3: Analyze the answer
        analyzer = get_analyzer()
        analysis_result = analyzer.analyze_answer(
            student_answer=extracted_text,
            question_id=question_id,
            grade=grade,
            subject=subject,
            topic=topic
        )
        
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
