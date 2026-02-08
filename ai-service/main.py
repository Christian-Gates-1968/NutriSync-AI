"""
NutriSync AI — Food Image Analysis Microservice
=================================================
FastAPI service that accepts a food photo and returns estimated
macronutrients by calling Groq's vision-capable LLM.

Run locally:
    uvicorn main:app --reload --port 8000

The Node/Express backend proxies uploads here via POST /analyze.
"""

import base64, json, os, re, logging
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# ── bootstrap ─────────────────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.2-90b-vision-preview")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nutrisync-ai")

app = FastAPI(
    title="NutriSync AI Service",
    version="1.0.0",
    description="Analyzes food photos and returns estimated macronutrients.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── schemas ───────────────────────────────────────────────────────────
class Macros(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float


class AnalysisResult(BaseModel):
    success: bool
    food: str
    macros: Macros
    confidence: Optional[str] = None
    details: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    groq_configured: bool


# ── helpers ───────────────────────────────────────────────────────────
VISION_PROMPT = """You are a professional nutritionist AI. Analyze the food shown in
this image and respond ONLY with a valid JSON object — no markdown, no backticks,
no extra text.

JSON schema:
{
  "food": "<short name of the dish>",
  "calories": <number kcal>,
  "protein": <grams>,
  "carbs": <grams>,
  "fat": <grams>,
  "confidence": "high" | "medium" | "low",
  "details": "<one-sentence description of the portion & preparation>"
}

If the image is not food, return:
{"food": "Unknown", "calories": 0, "protein": 0, "carbs": 0, "fat": 0,
 "confidence": "low", "details": "Could not identify food in the image."}
"""


def _extract_json(text: str) -> dict:
    """Pull a JSON object out of the model's response, tolerating markdown
    fences or stray prose around it."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try to find { ... } in the text
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError("Model did not return parseable JSON")


FALLBACK_RESULT = {
    "food": "Unknown Food",
    "calories": 250,
    "protein": 10,
    "carbs": 30,
    "fat": 8,
    "confidence": "low",
    "details": "AI analysis unavailable — showing rough estimate.",
}


async def _analyze_with_groq(image_bytes: bytes, mime: str) -> dict:
    """Send the image to Groq's vision model and parse the result."""
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — returning fallback estimate")
        return FALLBACK_RESULT

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{mime};base64,{b64}"

    client = Groq(api_key=GROQ_API_KEY)

    chat_completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": data_uri},
                    },
                ],
            }
        ],
        temperature=0.3,
        max_tokens=512,
    )

    raw = chat_completion.choices[0].message.content
    logger.info("Groq raw response: %s", raw[:300])
    return _extract_json(raw)


# ── routes ────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse)
async def health():
    """Readiness check — the Node backend pings this before proxying."""
    return HealthResponse(
        status="ok",
        model=GROQ_MODEL,
        groq_configured=bool(GROQ_API_KEY),
    )


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_food_image(foodImage: UploadFile = File(...)):
    """Accept a food photo and return estimated macronutrients."""
    ALLOWED_TYPES = {
        "image/jpeg", "image/jpg", "image/png",
        "image/webp", "image/heic",
    }
    if foodImage.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {foodImage.content_type}",
        )

    image_bytes = await foodImage.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds 10 MB limit")

    try:
        data = await _analyze_with_groq(image_bytes, foodImage.content_type)
    except Exception as exc:
        logger.error("Groq analysis failed: %s", exc)
        data = FALLBACK_RESULT

    return AnalysisResult(
        success=True,
        food=data.get("food", "Unknown Food"),
        macros=Macros(
            calories=float(data.get("calories", 0)),
            protein=float(data.get("protein", 0)),
            carbs=float(data.get("carbs", 0)),
            fat=float(data.get("fat", 0)),
        ),
        confidence=data.get("confidence"),
        details=data.get("details"),
    )


# ── entry-point (for `python main.py`) ───────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
