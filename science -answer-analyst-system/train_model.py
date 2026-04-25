"""
train_model.py — Retrain the TF-IDF Science AI Model from the latest dataset.csv
Run this after extract_papers.py to generate a new science_model.pkl
"""
import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
import numpy as np

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "science_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "science_model.pkl")

def main():
    print(" Science AI Model Training")
    print("=" * 50)
    
    # Load dataset
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=['model_answer'])
    df['model_answer'] = df['model_answer'].astype(str)
    print(f" Loaded {len(df)} Q&A pairs\n")
    
    stop_words = list(stopwords.words('english'))
    
    # Step 1: Extract keywords using TF-IDF
    print(" Extracting keywords from model answers...")
    keyword_vectorizer = TfidfVectorizer(
        stop_words=stop_words,
        max_features=20000,
        ngram_range=(1, 3),
        min_df=1,
        max_df=0.95
    )
    kw_matrix = keyword_vectorizer.fit_transform(df['model_answer'])
    kw_features = keyword_vectorizer.get_feature_names_out()
    
    keywords_list = []
    for i in range(len(df)):
        row = kw_matrix[i].toarray().flatten()
        top_idx = row.argsort()[-20:][::-1]
        top_kws = [kw_features[j] for j in top_idx if row[j] > 0]
        keywords_list.append(';'.join(top_kws[:12]))
    
    df['keywords'] = keywords_list
    df.to_csv(DATASET_PATH, index=False)
    print(f"   Keywords extracted for all {len(df)} entries\n")
    
    # Step 2: Train main TF-IDF vectorizer
    print(" Training main TF-IDF similarity matrix...")
    main_vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=15000,
        ngram_range=(1, 3),
        sublinear_tf=True
    )
    tfidf_matrix = main_vectorizer.fit_transform(df['model_answer'])
    print(f"   Vocabulary: {len(main_vectorizer.vocabulary_)} terms")
    print(f"   Matrix shape: {tfidf_matrix.shape}\n")
    
    # Step 3: Package and save
    model = {
        'vectorizer': main_vectorizer,
        'tfidf_matrix': tfidf_matrix,
        'dataset': df.to_dict('records'),
        'metadata': {
            'total_questions': len(df),
            'grades': df['grade'].unique().tolist(),
            'subjects': df['subject'].unique().tolist() if 'subject' in df.columns else [],
            'trained_at': pd.Timestamp.now().isoformat()
        }
    }
    
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    model_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    print("=" * 50)
    print(f" Model trained and saved to: {MODEL_PATH}")
    print(f"    Model size: {model_size:.1f} MB")
    print(f"    Total Q&A pairs: {len(df)}")
    print(f"\n Restart  Python Flask server to load the new model!")

if __name__ == "__main__":
    main()
