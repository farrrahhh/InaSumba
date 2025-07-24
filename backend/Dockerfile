# Gunakan image Python ringan
FROM python:3.11-slim

# Install dependency sistem (Tesseract dan lainnya)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-ind \
    libtesseract-dev \
    libleptonica-dev \
    poppler-utils \
    && apt-get clean

# Set path model bahasa untuk pytesseract
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/

# Atur direktori kerja dalam container
WORKDIR /app

# Salin semua file ke container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Jalankan server FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
