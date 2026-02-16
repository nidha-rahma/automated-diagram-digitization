import os
import io
import json
from dotenv import load_dotenv
from google import genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# Load .env file
load_dotenv()

# VLM Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=GEMINI_API_KEY)

# Intialise fastapi
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PROMPT
SYSTEM_PROMPT = """
You are an expert Optical Graph Recognition engine.
Analyze the provided flowchart image and extract its structure into a JSON format
compatible with React Flow.

Follow these strict rules:

1. Nodes:
- Identify every shape (rectangle, diamond, oval, circle, parallelogram).
- Assign a unique numeric ID (string).
- Extract the text inside the node into data.label.
- Map shape → React Flow node type:
  - rectangle → "taskNode"
  - diamond → "diamondNode"
  - oval/circle → "circleNode"
  - parallelogram → "ioNode"
- Estimate relative canvas coordinates (0–1000 scale).
- Output each node in this format:
  {
    "id": "1",
    "type": "taskNode",
    "position": { "x": 500, "y": 100 },
    "data": { "label": "Process" }
  }

2. Edges:
- Identify every arrow connecting nodes.
- source: ID where the arrow starts.
- target: ID where the arrow points.
- label: Any text written on the edge (Yes/No/etc). If none, use empty string.
- type: "smoothstep".
- markerEnd must be included as:
  "markerEnd": { "type": "arrowclosed" }

- Output each edge in this format:
{
  "id": "e1-2",
  "source": "1",
  "target": "2",
  "label": "Yes",
  "type": "smoothstep",
  "markerEnd": { "type": "arrowclosed" }
}

3. Output format:
- Return ONLY raw JSON.
- No markdown.
- Structure exactly as:

{
  "nodes": [...],
  "edges": [...]
}

IMPORTANT:
- The response must be valid JSON only.
- Do not include explanations, comments, or markdown.
- The output must be directly parsable by json.loads().

"""

# Uploads an image and returns graph json
@app.post('/analyze')
async def analyze_flowchart(file: UploadFile = File(...)):
    try:
        # Read the uploaded image bytes and convert it into PIL image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Resize image
        image.thumbnail((1024, 1024))

        # Send Image + prompt to AI
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[SYSTEM_PROMPT, image],
            config={
                "temperature": 0,
                "response_mime_type": "application/json"
            }
        )

        # Verify response
        if not response.text:
            raise ValueError("Empty response from Gemini")

        json_data = json.loads(response.text)

        if "nodes" not in json_data or "edges" not in json_data:
            raise ValueError("Invalid AI response format")

        for i, edge in enumerate(json_data["edges"]):
            edge["id"] = f"e{i}"

        for node in json_data["nodes"]:
            node["position"]["x"] = int(node["position"]["x"])
            node["position"]["y"] = int(node["position"]["y"])

        return json_data

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/")
def home():
    return {"message": "Backend is running"}

