"""
clean_dataset.py — Remove ALL rows containing any non-ASCII characters from the dataset.
This removes Sinhala/Tamil font artefacts AND any corrupted/garbled text entirely.
"""
import pandas as pd, re

INPUT_CSV  = "data/science_dataset_backup.csv"
OUTPUT_CSV = "data/science_dataset.csv"

df = pd.read_csv(INPUT_CSV)
print(f"Loaded {len(df)} rows.")

def has_non_ascii(text):
    if not isinstance(text, str):
        return False
    return bool(re.search(r'[^\x00-\x7F]', text))

# Remove rows where model_answer OR question has any non-ASCII characters
mask = df['model_answer'].apply(has_non_ascii) | df['question'].apply(has_non_ascii)
df_clean = df[~mask].copy()

print(f"Removed {mask.sum()} garbage/non-ASCII rows.")
print(f"Remaining clean English rows: {len(df_clean)}")

df_clean.to_csv(OUTPUT_CSV, index=False)
print(f"Saved → {OUTPUT_CSV}")
