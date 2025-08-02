from fastapi import FastAPI, UploadFile, File, Request, Body, Form
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import requests
import google.generativeai as genai
import traceback

# ----- App Initialization -----
app = FastAPI(title="AI Data Copilot API", description="Upload, analyze, and chat with your data.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Constants -----
GEMINI_API_KEY = "AIzaSyCgNV9ckHZorFlvvaB4TqQJGeYzLEXBUtg"
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set.")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

genai.configure(api_key=GEMINI_API_KEY)

CLEANED_DIR = "cleaned_files"
os.makedirs(CLEANED_DIR, exist_ok=True)
DATA_CACHE = {}  

# ----- Helpers -----
def load_cleaned_df(filename):
    path = os.path.join(CLEANED_DIR, filename)
    if filename.endswith('.csv'):
        return pd.read_csv(path)
    elif filename.endswith(('.xlsx', '.xls')):
        return pd.read_excel(path)
    return None

# ----- Endpoints -----

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Driven Data Explorer API. Use /docs to test."}


@app.post("/upload/")
async def upload(file: UploadFile = File(...), request: Request = None):
    contents = await file.read()
    if file.filename.endswith('.csv'):
        from io import StringIO
        df = pd.read_csv(StringIO(contents.decode('utf-8')))
    elif file.filename.endswith(('.xlsx', '.xls')):
        from io import BytesIO
        df = pd.read_excel(BytesIO(contents))
    else:
        return {"error": "Unsupported file type. Upload .csv or .xlsx"}

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    df.columns = df.columns.str.strip()

    cleaned_filename = f"cleaned_{file.filename}"
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_filename)
    if cleaned_filename.endswith('.csv'):
        df.to_csv(cleaned_path, index=False)
    else:
        df.to_excel(cleaned_path, index=False)

    # Cache the cleaned df
    session_id = cleaned_filename
    DATA_CACHE[session_id] = df

    base_url = str(request.base_url)
    download_url = f"{base_url}download/{cleaned_filename}"

    return {
        "message": "File uploaded and cleaned successfully.",
        "columns": df.columns.tolist(),
        "session_id": session_id,
        "download_url": download_url
    }


@app.post("/ask-ai/")
def ask_ai(session_id: str = Form(...), question: str = Form(...)):
    if session_id not in DATA_CACHE:
        return JSONResponse(status_code=404, content={"error": "Session not found."})
    df = DATA_CACHE[session_id]
    context = f"Columns:\n{', '.join(df.columns)}\n\nSample Data:\n{df.head(5).to_string(index=False)}"

    prompt = f"""You are a helpful data science assistant.
The user asked: "{question}".

Here is the dataset context:
{context}

Answer the user's question as clearly and accurately as possible."""

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        response = requests.post(GEMINI_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        answer = result["candidates"][0]["content"]["parts"][0]["text"]
        return {"answer": answer}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Gemini API error: {str(e)}"})

@app.post("/eda/")
async def eda(payload: dict = Body(...)):
    filename = payload.get("filename")
    df = load_cleaned_df(filename)
    if df is None:
        return {"error": "File not found or unsupported format."}
    insights = []
    anomalies = {}
    clusters = {}
    paragraph_parts = []

    for col in df.columns:
        col_data = df[col].dropna()
        if np.issubdtype(col_data.dtype, np.number):
            zscores = np.abs((col_data - col_data.mean()) / col_data.std())
            outliers = col_data[zscores > 3].tolist()
            if outliers:
                anomalies[col] = outliers
                paragraph_parts.append(f"'{col}' has {len(outliers)} outlier(s).")
            skew = col_data.skew()
            if skew > 1:
                paragraph_parts.append(f"'{col}' is highly right-skewed (skew={skew:.2f}).")
            elif skew < -1:
                paragraph_parts.append(f"'{col}' is highly left-skewed (skew={skew:.2f}).")
        else:
            top = col_data.value_counts().idxmax() if not col_data.empty else None
            if top:
                paragraph_parts.append(f"Most frequent value in '{col}' is '{top}'.")
    summary_text = f"EDA Summary:✨ Data Overview: {df.shape[0]} rows, {df.shape[1]} columns. "
    summary_text += " ".join(paragraph_parts) if paragraph_parts else "No significant anomalies or patterns detected."
    return PlainTextResponse(summary_text)
@app.post("/feature-selection/")
async def feature_selection(payload: dict = Body(...)):
    filename = payload.get("filename")
    threshold = payload.get("threshold", 0.0)
    df = load_cleaned_df(filename)
    if df is None:
        return {"error": "File not found or unsupported format."}
    # Simple variance threshold feature selection
    numeric_df = df.select_dtypes(include=np.number)
    variances = numeric_df.var()
    selected = variances[variances > threshold].index.tolist()
    return {"selected_features": selected, "variances": variances.to_dict()}

# --- Data Visualization Endpoint
from typing import Optional

@app.get("/visualize/")
async def visualize(filename: str, column: str, chart_type: Optional[str] = None):
    df = load_cleaned_df(filename)
    if df is None or column not in df.columns:
        return {"error": "File/column not found."}

    col_data = df[column].dropna()
    inferred_chart = ""

    # If chart_type is not provided, infer it
    if not chart_type:
        if np.issubdtype(col_data.dtype, np.number):
            chart_type = "histogram"
        elif col_data.nunique() < 20:
            chart_type = "bar"
        else:
            chart_type = "box"
        inferred_chart = "(auto-inferred)"

    # Anomaly detection (only for numeric)
    anomalies = []
    if np.issubdtype(col_data.dtype, np.number):
        zscores = np.abs((col_data - col_data.mean()) / col_data.std())
        anomalies = col_data[zscores > 3].tolist()

    # Insight text
    insight = f"Column '{column}' has {col_data.nunique()} unique values. "
    if np.issubdtype(col_data.dtype, np.number):
        insight += f"Mean: {col_data.mean():.2f}, Std: {col_data.std():.2f}. "
        if anomalies:
            insight += f"Detected {len(anomalies)} outlier(s). "
    else:
        top = col_data.value_counts().idxmax()
        insight += f"Most frequent: {top}. "

    # Plotting
    plt.figure(figsize=(8, 5))
    try:
        if chart_type == "histogram":
            sns.histplot(col_data, kde=True)
        elif chart_type == "bar":
            sns.countplot(x=col_data)
        elif chart_type == "box":
            sns.boxplot(x=col_data)
        elif chart_type == "line":
            plt.plot(col_data.values)
            plt.title(f"Line Chart of {column}")
        elif chart_type == "pie":
            if col_data.nunique() > 10:
                return {"error": "Too many unique values for pie chart."}
            col_counts = col_data.value_counts()
            plt.pie(col_counts, labels=col_counts.index, autopct='%1.1f%%')
        elif chart_type == "scatter":
            num_cols = df.select_dtypes(include=[np.number]).columns
            if len(num_cols) >= 2:
                x, y = num_cols[:2]
                plt.scatter(df[x], df[y])
                plt.xlabel(x)
                plt.ylabel(y)
                plt.title("Scatter Plot")
            else:
                return {"error": "Need at least 2 numeric columns for scatter plot."}
        elif chart_type == "violin":
            sns.violinplot(x=col_data)
        elif chart_type == "heatmap":
            num_df = df.select_dtypes(include=[np.number])
            if num_df.shape[1] >= 2:
                corr = num_df.corr()
                sns.heatmap(corr, annot=True, cmap="coolwarm")
            else:
                return {"error": "Need at least 2 numeric columns for heatmap."}
        else:
            return {"error": f"Unsupported chart type: {chart_type}"}
    except Exception as e:
        return {"error": f"Failed to generate chart: {str(e)}"}

    # Save the plot
    img_name = f"{column}_{chart_type}.png"
    img_path = os.path.join(CLEANED_DIR, img_name)
    plt.tight_layout()
    plt.savefig(img_path)
    plt.close()

    base_url = "http://localhost:8000/"
    return {
        "image_url": f"{base_url}download/{img_name}",
        "chart_type": chart_type,
        "inferred": inferred_chart,
        "anomalies": anomalies,
        "insight": insight
    }


@app.post("/predict/")
async def predict(payload: dict = Body(...)):
    filename = payload.get("filename")
    target = payload.get("target")
    df = load_cleaned_df(filename)
    if df is None or target not in df.columns:
        return {"error": "File or target column not found."}
    df = df.dropna()
    X = df.drop(columns=[target]).select_dtypes(include=[float, int])
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    return {
        "accuracy": acc,
        "classification_report": report,
        "target": target
    }


@app.get("/download/{filename}")
async def download(filename: str):
    file_path = os.path.join(CLEANED_DIR, filename)
    if os.path.exists(file_path):
        media_type = 'text/csv' if filename.endswith('.csv') else 'application/octet-stream'
        return FileResponse(path=file_path, filename=filename, media_type=media_type)
    return {"error": "File not found."}
