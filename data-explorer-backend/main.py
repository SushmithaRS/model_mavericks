from fastapi import FastAPI, UploadFile, File, Request
from fastapi import Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Visualization Recommendation & Insights Endpoint ---
@app.post("/visualization-ai/")
async def visualization_ai(payload: dict = Body(...)):
    filename = payload.get("filename")
    column = payload.get("column")
    df = load_cleaned_df(filename)
    if df is None or column not in df.columns:
        return {"error": "File/column not found."}
    col_data = df[column].dropna()
    # Chart recommendation
    if np.issubdtype(col_data.dtype, np.number):
        chart_type = "histogram"
    elif col_data.nunique() < 20:
        chart_type = "bar"
    else:
        chart_type = "box"
    # Anomaly detection (simple z-score)
    anomalies = []
    if np.issubdtype(col_data.dtype, np.number):
        zscores = np.abs((col_data - col_data.mean()) / col_data.std())
        anomalies = col_data[zscores > 3].tolist()
    # Insight generation
    insight = f"Column '{column}' has {col_data.nunique()} unique values. "
    if np.issubdtype(col_data.dtype, np.number):
        insight += f"Mean: {col_data.mean():.2f}, Std: {col_data.std():.2f}. "
        if anomalies:
            insight += f"Detected {len(anomalies)} outlier(s). "
    else:
        top = col_data.value_counts().idxmax()
        insight += f"Most frequent: {top}. "
    return {
        "chart_type": chart_type,
        "anomalies": anomalies,
        "insight": insight
    }

from fastapi import FastAPI, UploadFile, File, Request
from fastapi import Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- AI Predictive Modeling Endpoint ---
@app.post("/predict/")
async def predict(payload: dict = Body(...)):
    filename = payload.get("filename")
    target = payload.get("target")
    df = load_cleaned_df(filename)
    if df is None or target not in df.columns:
        return {"error": "File or target column not found."}
    # Drop NA and non-numeric columns except target
    df = df.dropna()
    X = df.drop(columns=[target])
    X = X.select_dtypes(include=[float, int])
    y = df[target]
    # Simple train/test split
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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure cleaned_files directory exists
CLEANED_DIR = "cleaned_files"
os.makedirs(CLEANED_DIR, exist_ok=True)

# Helper to load cleaned file
def load_cleaned_df(filename):
    path = os.path.join(CLEANED_DIR, filename)
    if filename.endswith('.csv'):
        return pd.read_csv(path)
    elif filename.endswith(('.xlsx', '.xls')):
        return pd.read_excel(path)
    return None


@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Driven Data Explorer API. Use /docs to test."}


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

# --- AI-Driven EDA Endpoint ---
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
        # Numeric columns
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
            missing = df[col].isnull().sum()
            if missing > 0:
                paragraph_parts.append(f"'{col}' has {missing} missing values.")
            if len(col_data) > 100:
                from sklearn.cluster import KMeans
                try:
                    kmeans = KMeans(n_clusters=3, random_state=42)
                    labels = kmeans.fit_predict(col_data.values.reshape(-1, 1))
                    clusters[col] = {
                        "n_clusters": 3,
                        "counts": dict(zip(*np.unique(labels, return_counts=True)))
                    }
                    paragraph_parts.append(f"'{col}' shows {len(set(labels))} clusters (k-means).")
                except Exception:
                    pass
        else:
            top = col_data.value_counts().idxmax() if not col_data.empty else None
            if top:
                paragraph_parts.append(f"Most frequent value in '{col}' is '{top}'.")
            missing = df[col].isnull().sum()
            if missing > 0:
                paragraph_parts.append(f"'{col}' has {missing} missing values.")
    # Compose stylish summary
    summary_text = f"EDA Summary:✨ Data Overview: {df.shape[0]} rows, {df.shape[1]} columns. "
    if paragraph_parts:
        summary_text += " ".join(paragraph_parts)
    else:
        summary_text += "No significant anomalies or patterns detected."
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(summary_text)

# --- Feature Selection Endpoint ---
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

# --- Data Visualization Endpoint ---
@app.get("/visualize/")
async def visualize(filename: str, column: str):
    df = load_cleaned_df(filename)
    if df is None or column not in df.columns:
        return {"error": "File/column not found."}
    col_data = df[column].dropna()
    # Chart recommendation
    if np.issubdtype(col_data.dtype, np.number):
        chart_type = "histogram"
    elif col_data.nunique() < 20:
        chart_type = "bar"
    else:
        chart_type = "box"
    # Anomaly detection (simple z-score)
    anomalies = []
    if np.issubdtype(col_data.dtype, np.number):
        zscores = np.abs((col_data - col_data.mean()) / col_data.std())
        anomalies = col_data[zscores > 3].tolist()
    # Insight generation
    insight = f"Column '{column}' has {col_data.nunique()} unique values. "
    if np.issubdtype(col_data.dtype, np.number):
        insight += f"Mean: {col_data.mean():.2f}, Std: {col_data.std():.2f}. "
        if anomalies:
            insight += f"Detected {len(anomalies)} outlier(s). "
    else:
        top = col_data.value_counts().idxmax()
        insight += f"Most frequent: {top}. "
    # Plot
    plt.figure(figsize=(8, 5))
    if chart_type == "histogram":
        sns.histplot(col_data, kde=True)
    elif chart_type == "bar":
        sns.countplot(x=col_data)
    else:
        sns.boxplot(x=col_data)
    img_path = os.path.join(CLEANED_DIR, f"{column}_hist.png")
    plt.savefig(img_path)
    plt.close()
    base_url = "http://localhost:8000/"
    return {
        "image_url": f"{base_url}download/{column}_hist.png",
        "chart_type": chart_type,
        "anomalies": anomalies,
        "insight": insight
    }

@app.get("/download/{filename}")
async def download(filename: str):
    file_path = os.path.join(CLEANED_DIR, filename)
    if os.path.exists(file_path):
        if filename.endswith('.csv'):
            return FileResponse(path=file_path, filename=filename, media_type='text/csv')
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    return {"error": "File not found."}
