# ── Python 3.11 with system dependencies ────────────────
FROM python:3.11-slim

# Install Tesseract OCR for image text extraction
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for dependency caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download NLTK data to avoid runtime download errors/crashes
ENV NLTK_DATA=/app/nltk_data
RUN python -m nltk.downloader -d /app/nltk_data stopwords punkt punkt_tab

# Copy application code
COPY . .

# Hugging Face Space uses port 7860
ENV PORT=7860

EXPOSE 7860

# Run with gunicorn for production
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-7860} --workers 2 --timeout 120 app:app"]
