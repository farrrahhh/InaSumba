# FastAPI Backend 
Backend aplikasi InaSumba, sebuah aplikasi untuk mengenalkan kain tenun khas Sumba. Yang berisi translating, chatbot, dan e-commerce.
## Fitur

- Authentication dan Authorization
- ChatBot API

## Instalasi

### 1. Clone Repository (jika belum)
```bash
git clone https://github.com/username/project-name.git
cd backend
```
### 2. Buat Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```
### 3. Install Dependencies
```bash
pip install -r requirements.txt
```
### 4. Buat .env File
Buat file `.env` di direktori root proyek dan isi dengan variabel lingkungan yang diperlukan:
```
DB_USER=postgres
DB_PASSWORD=MLWeMdslMnKtXtUmPZAIbWPQLjYVcqyS
DB_HOST=switchyard.proxy.rlwy.net
DB_PORT=39419
DB_NAME=railway
OPENAI_API_KEY="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"
```
### 4. Jalankan Aplikasi
```bash
uvicorn main:app --reload
```