# pyright: reportMissingImports=false, reportPrivateImportUsage=false
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from docx import Document
import os, json, re, shutil, uuid, traceback

# ---------------------------------
# 1️⃣ Load Environment & Configure Gemini
# ---------------------------------
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

genai_configured = False
if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
        genai_configured = True
        print("✅ Gemini key loaded successfully.")
    except Exception as e:
        print("⚠️ Gemini key configuration failed:", e)
else:
    print("❌ No GEMINI_API_KEY found in .env")

# ---------------------------------
# 2️⃣ FastAPI Setup
# ---------------------------------
app = FastAPI(title="Synapse – AI Study Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join("backend", "uploaded_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------
# 3️⃣ File Helper Functions
# ---------------------------------
def safe_name(name: str | None) -> str:
    return os.path.basename(name) if name else "uploaded.txt"

def extract_text(path: str) -> str:
    try:
        if path.lower().endswith(".pdf"):
            reader = PdfReader(path)
            return "\n".join([p.extract_text() or "" for p in reader.pages])
        elif path.lower().endswith(".docx"):
            doc = Document(path)
            return "\n".join([p.text for p in doc.paragraphs])
        else:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
    except Exception as e:
        return f"[Error extracting text: {e}]"

# ---------------------------------
# 4️⃣ Global Chat Memory
# ---------------------------------
conversation_history = []

# ---------------------------------
# 5️⃣ Routes
# ---------------------------------
@app.get("/")
def root():
    return {"status": "online", "model": "models/gemini-2.5-flash"}

@app.post("/chat")
async def chat(request: Request):
    """Handles user chat requests with memory context."""
    global conversation_history

    msg = None
    try:
        if request.headers.get("content-type", "").startswith("application/json"):
            data = await request.json()
            msg = data.get("query") or data.get("question") or data.get("q")
        else:
            form = await request.form()
            msg = form.get("query") or form.get("question") or form.get("q")
    except Exception:
        pass

    if not msg:
        raise HTTPException(status_code=400, detail="Provide a 'query' (JSON or form).")

    if not genai_configured:
        raise HTTPException(status_code=503, detail="Gemini API key not configured.")

    # Append message to memory
    conversation_history.append({"role": "user", "content": msg})
    if len(conversation_history) > 10:
        conversation_history = conversation_history[-10:]

    # Build context from history
    context = "\n".join(
        [f"{m['role'].capitalize()}: {m['content']}" for m in conversation_history]
    )

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        print(f"\n🧠 Incoming: {msg}")
        print("⚙️ Using model: models/gemini-2.5-flash")

        resp = model.generate_content(f"You are Synapse, a helpful AI assistant.\n{context}")
        reply = (resp.text or "").strip()
        if not reply:
            raise RuntimeError("Empty response from Gemini.")

        # Save AI response to memory
        conversation_history.append({"role": "assistant", "content": reply})

        print(f"✅ Reply: {reply[:120]}...")
        return {"reply": reply}

    except Exception as e:
        print("❌ Gemini API error:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"Model call failed: {e}")
