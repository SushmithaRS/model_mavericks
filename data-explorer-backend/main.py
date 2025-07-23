from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import FileResponse
import pandas as pd
import os

app = FastAPI()

# Ensure cleaned_files directory exists
CLEANED_DIR = "cleaned_files"
os.makedirs(CLEANED_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Data Cleaning API. Use /docs to test."}

@app.post("/upload/")
async def upload(file: UploadFile = File(...), request: Request = None):
    # Read uploaded file into DataFrame
    contents = await file.read()
    if file.filename.endswith('.csv'):
        from io import StringIO
        df = pd.read_csv(StringIO(contents.decode('utf-8')))
    elif file.filename.endswith(('.xlsx', '.xls')):
        from io import BytesIO
        df = pd.read_excel(BytesIO(contents))
    else:
        return {"error": "Unsupported file type. Upload .csv or .xlsx"}

    # ✅ Cleaning logic: drop NA, reset index, trim column names
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    df.columns = df.columns.str.strip()

    # Save cleaned file
    cleaned_filename = f"cleaned_{file.filename}"
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_filename)
    if cleaned_filename.endswith('.csv'):
        df.to_csv(cleaned_path, index=False)
    else:
        df.to_excel(cleaned_path, index=False)

    # Build full download URL dynamically
    base_url = str(request.base_url)
    download_url = f"{base_url}download/{cleaned_filename}"

    return {
        "message": "File uploaded and cleaned successfully.",
        "columns": df.columns.tolist(),
        "download_url": download_url
    }

@app.get("/download/{filename}")
async def download(filename: str):
    file_path = os.path.join(CLEANED_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    return {"error": "File not found."}
