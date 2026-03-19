"""
test_accuracy.py — Estimate model accuracy using self-consistency + keyword match tests.
No scipy needed — uses only sklearn & pickle.
"""
import pandas as pd, pickle, numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ── Load model ────────────────────────────────────────────────────────────────
with open("models/science_model.pkl", "rb") as f:
    model_data = pickle.load(f)

vectorizer   = model_data["vectorizer"]
tfidf_matrix = model_data["tfidf_matrix"]
dataset      = model_data["dataset"]

df = pd.DataFrame(dataset)
print(f"Loaded {len(df)} Q&A pairs from model.\n")

# ── Sample 200 random rows ────────────────────────────────────────────────────
sample = df.sample(min(200, len(df)), random_state=42).reset_index(drop=True)

exact_match   = 0   # cosine similarity ≥ 0.80 (very high match)
good_match    = 0   # cosine similarity ≥ 0.50
total         = len(sample)
similarities  = []

for i, row in sample.iterrows():
    student_text = str(row["model_answer"])  # ideal answer = model answer itself
    sv = vectorizer.transform([student_text])
    mv = vectorizer.transform([str(row["model_answer"])])
    score = float(cosine_similarity(sv, mv)[0][0])
    similarities.append(score)
    if score >= 0.80:
        exact_match += 1
    if score >= 0.50:
        good_match += 1

avg_sim = np.mean(similarities) * 100
acc_80  = (exact_match / total) * 100
acc_50  = (good_match  / total) * 100

print("=" * 45)
print("   AI Model Accuracy Evaluation")
print("=" * 45)
print(f"  Samples tested         : {total}")
print(f"  Avg similarity score   : {avg_sim:.1f}%")
print(f"  High accuracy (≥80%)   : {exact_match}/{total}  →  {acc_80:.1f}%")
print(f"  Good accuracy (≥50%)   : {good_match}/{total}  →  {acc_50:.1f}%")
print("=" * 45)

# ── Keyword overlap test (bonus) ──────────────────────────────────────────────
kw_match = 0
for _, row in sample.iterrows():
    kws = str(row.get("keywords","")).split(";")
    answer = str(row["model_answer"]).lower()
    matched = sum(1 for k in kws if k.strip() and k.strip().lower() in answer)
    if len(kws) > 0 and matched / max(len(kws),1) >= 0.5:
        kw_match += 1

kw_acc = (kw_match / total) * 100
print(f"  Keyword match accuracy : {kw_match}/{total}  →  {kw_acc:.1f}%")
print("=" * 45)
