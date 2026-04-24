
#analyzer.py — Science Answer Analysis Engine
#Uses TF-IDF cosine similarity + keyword matching to score student answers


import os
import re
import pickle
import numpy as np

# ML imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# NLTK for text preprocessing
import nltk
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

from nltk.corpus import stopwords

STOP_WORDS = set(stopwords.words('english'))

# ─── Paths ────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'science_model.pkl')
DATASET_PATH = os.path.join(BASE_DIR, 'data', 'science_dataset.csv')


class ScienceAnalyzer:
    """
    Analyzes student science answers against a trained textbook model.
    
    Scoring formula:
        combined_score = 0.6 * cosine_similarity + 0.4 * keyword_coverage
    """
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.dataset = None
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load the trained model from pickle file"""
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                self.vectorizer = self.model['vectorizer']
                self.tfidf_matrix = self.model['tfidf_matrix']
                self.dataset = self.model['dataset']
                self.is_loaded = True
                print(f" Model loaded: {len(self.dataset)} questions available")
            except Exception as e:
                print(f" Failed to load model: {e}")
                self._init_fallback()
        else:
            print(f" Model not found at {MODEL_PATH}. Using fallback mode.")
            self._init_fallback()
    
    def _init_fallback(self):
        """Fallback: use basic keyword matching without trained model"""
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2)
        )
        self.dataset = []
        self.is_loaded = False
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove special characters but keep alphanumeric and spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove stop words
        words = text.split()
        words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
        return ' '.join(words)
    
    def get_topics(self, grade=None, subject=None):
        """Get available topics, optionally filtered by grade and subject"""
        topics = []
        for item in self.dataset:
            topic_entry = {
                'id': item['id'],
                'grade': item.get('grade'),
                'subject': item.get('subject'),
                'topic': item.get('topic'),
                'question': item.get('question')
            }
            
            if grade and str(item.get('grade')) != str(grade):
                continue
            if subject and item.get('subject', '').lower() != subject.lower():
                continue
            
            topics.append(topic_entry)
        
        return topics
    
    def find_best_matching_question(self, student_answer, grade=None, subject=None, topic=None):
        """
        Find the question from the dataset that best matches the student's answer.
        This is used when the teacher doesn't specify which question the answer is for.
        """
        if not self.is_loaded or not self.dataset:
            return None, -1
        
        # Filter dataset by grade/subject if provided
        candidates = []
        candidate_indices = []
        for i, item in enumerate(self.dataset):
            if grade and str(item.get('grade')) != str(grade):
                continue
            if subject and item.get('subject', '').lower() != subject.lower():
                continue
            if topic and topic.lower() not in item.get('topic', '').lower():
                continue
            candidates.append(item)
            candidate_indices.append(i)
        
        if not candidates:
            return None, -1
        
        # Find best match using cosine similarity
        processed_answer = self.preprocess_text(student_answer)
        student_vector = self.vectorizer.transform([processed_answer])
        
        best_score = -1
        best_idx = -1
        for i, orig_idx in enumerate(candidate_indices):
            model_vector = self.tfidf_matrix[orig_idx]
            sim = cosine_similarity(student_vector, model_vector)[0][0]
            if sim > best_score:
                best_score = sim
                best_idx = i
        
        if best_idx >= 0:
            return candidates[best_idx], best_score
        return None, -1
    
    def analyze_answer(self, student_answer, question_id=None, grade=None, subject=None, topic=None):
        """
        Analyze a student's answer and return score + feedback.
        
        Args:
            student_answer: The student's answer text (extracted from PDF/PNG)
            question_id: Specific question ID to compare against (optional)
            grade: Grade filter (10 or 11)
            subject: Subject filter (Biology, Chemistry, Physics)
            topic: Topic filter
        
        Returns:
            dict with score, grade, matched/missed keywords, feedback
        """
        if not student_answer or len(student_answer.strip()) < 10:
            return {
                "success": False,
                "error": "Answer text is too short for analysis",
                "score": 0,
                "grade": "Needs Improvement"
            }
        
        processed_answer = self.preprocess_text(student_answer)
        
        # Find the matching question
        question = None
        q_index = -1
        
        if question_id and self.dataset:
            for i, q in enumerate(self.dataset):
                if str(q['id']) == str(question_id):
                    question = q
                    q_index = i
                    break
        
        if not question:
            # Auto-find best matching question
            question, match_score = self.find_best_matching_question(
                student_answer, grade, subject, topic
            )
            if question:
                q_index = next(
                    (i for i, q in enumerate(self.dataset) if q['id'] == question['id']),
                    -1
                )
        
        if not question:
            # Fallback: basic keyword analysis without model
            return self._basic_analysis(student_answer, grade, subject, topic)
        
        # ─── TF-IDF Cosine Similarity ───────────────────────
        student_vector = self.vectorizer.transform([processed_answer])
        model_vector = self.tfidf_matrix[q_index]
        similarity = float(cosine_similarity(student_vector, model_vector)[0][0])
        
        # ─── Keyword Matching ───────────────────────────────
        keywords_str = question.get('keywords', '')
        keywords = [k.strip() for k in keywords_str.split(';') if k.strip()]
        
        student_lower = student_answer.lower()
        matched_keywords = []
        missed_keywords = []
        
        for kw in keywords:
            if kw.lower() in student_lower:
                matched_keywords.append(kw)
            else:
                missed_keywords.append(kw)
        
        keyword_coverage = len(matched_keywords) / max(len(keywords), 1)
        
        # ─── Combined Score ─────────────────────────────────
        combined_score = (0.6 * similarity) + (0.4 * keyword_coverage)
        percentage = round(combined_score * 100, 1)
        percentage = min(100.0, percentage)  # Cap at 100
        
        # ─── Grade Classification ───────────────────────────
        if percentage >= 80:
            grade_label = "Excellent"
        elif percentage >= 60:
            grade_label = "Good"
        elif percentage >= 40:
            grade_label = "Fair"
        else:
            grade_label = "Needs Improvement"
        
        # ─── Feedback Generation ────────────────────────────
        feedback = self._generate_feedback(
            percentage, grade_label, matched_keywords, missed_keywords
        )
        
        return {
            "success": True,
            "score": percentage,
            "grade": grade_label,
            "similarity_score": round(similarity * 100, 1),
            "keyword_coverage": round(keyword_coverage * 100, 1),
            "matched_keywords": matched_keywords,
            "missed_keywords": missed_keywords,
            "total_keywords": len(keywords),
            "matched_count": len(matched_keywords),
            "missed_count": len(missed_keywords),
            "feedback": feedback,
            "question_topic": question.get('topic', 'Unknown'),
            "question_text": question.get('question', ''),
            "question_subject": question.get('subject', ''),
            "question_grade": question.get('grade', ''),
            "student_answer_preview": student_answer[:500],
            "word_count": len(student_answer.split())
        }
    
    def _basic_analysis(self, student_answer, grade=None, subject=None, topic=None):
        """Fallback analysis when no trained model is available"""
        # Basic science keyword list
        science_keywords = {
            'Biology': ['cell', 'photosynthesis', 'respiration', 'dna', 'gene', 
                       'protein', 'enzyme', 'organism', 'species', 'evolution',
                       'mitosis', 'meiosis', 'chlorophyll', 'nucleus', 'membrane',
                       'tissue', 'organ', 'ecosystem', 'food chain', 'bacteria'],
            'Chemistry': ['atom', 'molecule', 'element', 'compound', 'reaction',
                         'acid', 'base', 'ion', 'electron', 'proton', 'neutron',
                         'periodic table', 'chemical bond', 'solution', 'ph',
                         'oxidation', 'reduction', 'metal', 'non metal', 'salt'],
            'Physics': ['force', 'energy', 'motion', 'velocity', 'acceleration',
                       'gravity', 'wave', 'frequency', 'current', 'voltage',
                       'resistance', 'power', 'work', 'momentum', 'pressure',
                       'temperature', 'heat', 'light', 'sound', 'circuit']
        }
        
        student_lower = student_answer.lower()
        all_matched = []
        all_missed = []
        
        # Check keywords from relevant subject or all
        subjects_to_check = [subject] if subject and subject in science_keywords else science_keywords.keys()
        
        for subj in subjects_to_check:
            for kw in science_keywords.get(subj, []):
                if kw in student_lower:
                    all_matched.append(kw)
                else:
                    all_missed.append(kw)
        
        coverage = len(all_matched) / max(len(all_matched) + len(all_missed), 1)
        percentage = round(coverage * 100, 1)
        
        if percentage >= 80: grade_label = "Excellent"
        elif percentage >= 60: grade_label = "Good"
        elif percentage >= 40: grade_label = "Fair"
        else: grade_label = "Needs Improvement"
        
        return {
            "success": True,
            "score": percentage,
            "grade": grade_label,
            "similarity_score": 0,
            "keyword_coverage": percentage,
            "matched_keywords": all_matched,
            "missed_keywords": all_missed[:15],  # Limit missed keywords shown
            "total_keywords": len(all_matched) + len(all_missed),
            "matched_count": len(all_matched),
            "missed_count": len(all_missed),
            "feedback": self._generate_feedback(percentage, grade_label, all_matched, all_missed[:10]),
            "question_topic": topic or "General Science",
            "question_text": "",
            "question_subject": subject or "General",
            "question_grade": grade or "",
            "student_answer_preview": student_answer[:500],
            "word_count": len(student_answer.split()),
            "mode": "basic_fallback"
        }
    
    def _generate_feedback(self, percentage, grade, matched, missed):
        """Generate human-readable feedback"""
        feedback_parts = []
        
        if grade == "Excellent":
            feedback_parts.append(" Excellent work! Your answer demonstrates a strong understanding of the topic.")
        elif grade == "Good":
            feedback_parts.append(" Good effort! Your answer covers most of the key concepts.")
        elif grade == "Fair":
            feedback_parts.append(" Fair attempt. Your answer covers some concepts but misses several important points.")
        else:
            feedback_parts.append(" Your answer needs improvement. Many key concepts are missing.")
        
        if matched:
            feedback_parts.append(f" You correctly covered {len(matched)} key concept(s): {', '.join(matched[:8])}.")
        
        if missed:
            feedback_parts.append(f" You missed {len(missed)} concept(s). Try to include: {', '.join(missed[:8])}.")
        
        if percentage < 60:
            feedback_parts.append(" Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.")
        
        return ' '.join(feedback_parts)


# Singleton instance
_analyzer = None

def get_analyzer():
    """Get or create the singleton analyzer instance"""
    global _analyzer
    if _analyzer is None:
        _analyzer = ScienceAnalyzer()
    return _analyzer
