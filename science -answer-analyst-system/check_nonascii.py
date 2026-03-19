import pandas as pd, re
df = pd.read_csv('data/science_dataset.csv')
non_ascii_df = df[df['model_answer'].apply(lambda x: bool(re.search(r'[^\x00-\x7F]', str(x))))]
for _, row in non_ascii_df.head(5).iterrows():
    ans = str(row['model_answer'])[:150]
    topic = str(row['topic'])
    print('Topic:', topic)
    print('Answer:', ans)
    print('---')
