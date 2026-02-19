import os
import io
import json
import logging
from typing import List, Optional
from dotenv import load_dotenv
from google import genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from prompts import SYSTEM_PROMPT

# 1. Setup Logging & Env
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# 2. VLM Config
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

app = FastAPI()
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"], # Replace with frontend URL
    allow_methods=["*"], 
    allow_headers=["*"]
)

# 3. Pydantic Models
class Position(BaseModel):
    x: int
    y: int

class Node(BaseModel):
    id: str
    type: str
    position: Position
    data: dict
    width: Optional[int] = 150
    height: Optional[int] = 80 

class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = ""
    type: str = "smoothstep"
    markerEnd: Optional[dict] = {"type": "arrowclosed"}

class FlowchartResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.post('/analyze', response_model=FlowchartResponse)
async def analyze_flowchart(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image.thumbnail((1024, 1024))

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[SYSTEM_PROMPT, image],
            config={
                "temperature": 0, 
                "response_mime_type": "application/json"
            }
        )

        raw_data = json.loads(response.text)
        
        # Ensure IDs exist
        for i, edge in enumerate(raw_data.get("edges", [])):
            if "id" not in edge:
                edge["id"] = f"e{edge['source']}-{edge['target']}"

        return raw_data

    except Exception as e:
        logger.error(f"Analysis Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")