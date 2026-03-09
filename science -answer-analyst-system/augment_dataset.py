"""
augment_dataset.py — Expand the dataset from ~961 to 2500+ Q&A pairs
Uses smart text chunking and topic variation to generate new training samples
from the existing dataset WITHOUT needing new PDFs.
"""
import os
import re
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "science_dataset.csv")

# Question templates for different topics
QUESTION_TEMPLATES = {
    'Biology': [
        "Explain the process of {topic}.",
        "Describe the role of {topic} in living organisms.",
        "What is {topic}? Explain with an example.",
        "Discuss the importance of {topic} in biology.",
        "How does {topic} occur in nature?",
        "Write short notes on {topic}.",
        "Describe {topic} using scientific terms.",
        "How is {topic} related to life functions?",
        "What are the stages involved in {topic}?",
        "Explain why {topic} is important to humans.",
    ],
    'Chemistry': [
        "Explain the concept of {topic}.",
        "Describe the chemical process involved in {topic}.",
        "What is {topic}? Give an example.",
        "How does {topic} affect chemical reactions?",
        "Define {topic} and explain its significance.",
        "Write short notes on {topic}.",
        "Describe {topic} with a balanced equation if possible.",
        "What are the properties of {topic}?",
        "Give the industrial application of {topic}.",
        "How is {topic} used in everyday life?",
    ],
    'Physics': [
        "Explain {topic} with examples.",
        "State and explain the principles of {topic}.",
        "Describe how {topic} works.",
        "Define {topic} and give its applications.",
        "What is {topic}? How is it measured?",
        "Write short notes on {topic}.",
        "Derive the relationship for {topic}.",
        "Give two real-world examples of {topic}.",
        "How does {topic} affect motion or energy?",
        "Explain {topic} using diagrams or equations.",
    ],
    'General Science': [
        "Explain {topic}.",
        "Describe {topic} with examples.",
        "What do you understand by {topic}?",
        "Discuss {topic} in detail.",
        "Write short notes on {topic}.",
        "Give two examples of {topic} from daily life.",
    ]
}

def chunk_text_into_paragraphs(text, min_words=30, max_words=200):
    """Split a long answer into meaningful paragraph chunks"""
    # Split by sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    chunks = []
    current_chunk = []
    current_words = 0
    
    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)
        
        if current_words + word_count > max_words and current_words >= min_words:
            chunk_text = ' '.join(current_chunk).strip()
            if chunk_text:
                chunks.append(chunk_text)
            current_chunk = [sentence]
            current_words = word_count
        else:
            current_chunk.append(sentence)
            current_words += word_count
    
    # Last chunk
    if current_words >= min_words:
        chunk_text = ' '.join(current_chunk).strip()
        if chunk_text:
            chunks.append(chunk_text)
    
    return chunks

def create_sub_topic(topic, index):
    """Generate sub-topic names"""
    prefixes = ['Introduction to', 'Key concepts of', 'Principles of',
                'Mechanism of', 'Applications of', 'Effects of', 'Types of',
                'Importance of', 'Structure of', 'Functions of']
    prefix = prefixes[index % len(prefixes)]
    return f"{prefix} {topic}"

def get_question_for_topic(topic, subject, template_index):
    """Generate a contextual question for a topic"""
    templates = QUESTION_TEMPLATES.get(subject, QUESTION_TEMPLATES['General Science'])
    template = templates[template_index % len(templates)]
    return template.format(topic=topic)

def augment_dataset(df):
    """
    Augment the dataset using:
    1. Chunking long answers into focused sub-answers
    2. Generating question variations
    """
    new_rows = []
    
    for _, row in df.iterrows():
        model_answer = str(row.get('model_answer', '')).strip()
        topic = str(row.get('topic', 'Science')).strip()
        subject = str(row.get('subject', 'General Science')).strip()
        grade = row.get('grade', 11)
        
        if len(model_answer.split()) < 20:
            continue
        
        # Strategy 1: Chunk long answers into focused sub-topics
        if len(model_answer.split()) > 80:
            chunks = chunk_text_into_paragraphs(model_answer, min_words=30, max_words=150)
            
            for i, chunk in enumerate(chunks):
                if i == 0:
                    continue  # Skip first chunk (already in original)
                
                sub_topic = create_sub_topic(topic, i)
                question = get_question_for_topic(sub_topic, subject, i)
                
                new_rows.append({
                    'grade': grade,
                    'subject': subject,
                    'topic': sub_topic,
                    'question': question,
                    'model_answer': chunk,
                    'keywords': '',
                    'max_score': 10,
                    'source': 'augmented'
                })
        
        # Strategy 2: Generate alternative questions for the same answer (more templates)
        templates = QUESTION_TEMPLATES.get(subject, QUESTION_TEMPLATES['General Science'])
        for i, template in enumerate(templates[1:6], start=1):  # up to 5 question variants
            alt_question = template.format(topic=topic)
            if alt_question != str(row.get('question', '')):
                new_rows.append({
                    'grade': grade,
                    'subject': subject,
                    'topic': topic,
                    'question': alt_question,
                    'model_answer': model_answer,
                    'keywords': row.get('keywords', ''),
                    'max_score': 10,
                    'source': f'augmented_variant_{i}'
                })
        
        # Strategy 3: Split the answer by numbered points into individual explanations
        point_pattern = re.compile(r'(?:^|\s)(?:\(\d+\)|\d+[\.\)])\s+(.+?)(?=(?:\(\d+\)|\d+[\.\)])|$)', re.DOTALL)
        points = point_pattern.findall(model_answer)
        
        if len(points) >= 3:
            for i, point in enumerate(points):
                point = point.strip()
                if len(point.split()) >= 20:
                    point_topic = f"Point {i+1}: {topic}"
                    question = f"Explain point {i+1} regarding {topic}."
                    new_rows.append({
                        'grade': grade,
                        'subject': subject,
                        'topic': point_topic,
                        'question': question,
                        'model_answer': point,
                        'keywords': '',
                        'max_score': 5,
                        'source': 'augmented_point'
                    })
    
    return pd.DataFrame(new_rows)

def main():
    print("🔬 Science Dataset Augmentation Tool")
    print("=" * 50)
    
    # Load existing dataset
    df = pd.read_csv(DATASET_PATH)
    original_count = len(df)
    print(f"📂 Loaded {original_count} existing Q&A pairs\n")
    
    # Run augmentation
    print("⚙️  Generating augmented entries...")
    augmented_df = augment_dataset(df)
    print(f"✅ Generated {len(augmented_df)} new entries from augmentation\n")
    
    # Combine
    for col in df.columns:
        if col not in augmented_df.columns:
            augmented_df[col] = ''
    for col in augmented_df.columns:
        if col not in df.columns:
            df[col] = ''
    
    combined = pd.concat([df, augmented_df[df.columns]], ignore_index=True)
    
    # Remove near-duplicates based on question+topic (not model_answer, to keep variants)
    combined['dedup_key'] = combined['question'].astype(str).str.lower().str.strip() + '|' + combined['topic'].astype(str).str.lower().str.strip()
    combined = combined.drop_duplicates(subset=['dedup_key'], keep='first')
    combined = combined.drop(columns=['dedup_key'])
    
    # Re-assign IDs
    combined['id'] = range(1, len(combined) + 1)
    
    # Save
    combined.to_csv(DATASET_PATH, index=False)
    
    print("=" * 50)
    print(f"🎉 Dataset expanded!")
    print(f"   Was:  {original_count} questions")
    print(f"   Now:  {len(combined)} questions")
    print(f"\n📊 Breakdown by Subject:")
    if 'subject' in combined.columns:
        print(combined.groupby(['grade', 'subject']).size().to_string())
    print(f"\n👉 Run 'python train_model.py' to retrain with the expanded dataset!")

if __name__ == "__main__":
    main()
