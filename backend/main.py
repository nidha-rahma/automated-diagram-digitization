import os
import io
import json
import logging
from typing import List, Optional
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from google import genai
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from prompts import SYSTEM_PROMPT, TEXT_TO_FLOW_PROMPT
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, get_db
from models import Flowchart
import schemas

# 1. Setup Logging & Env
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# 2. VLM Config
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # Creates the 'flowcharts' table if it doesn't exist
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

# Add cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads an image and returns graph json
@app.post('/analyze/image')
async def analyze_flowchart(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image.thumbnail((1024, 1024))

        response = client.models.generate_content(
            model="gemini-flash-latest",
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
    


import re # Add this import at the top

@app.post('/analyze/algorithm')
async def generate_from_text(payload: dict):
    try:
        user_prompt = payload.get("prompt", "")
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Please provide a 'prompt' field.")

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[TEXT_TO_FLOW_PROMPT, f"User Request: {user_prompt}"]
        )

        # 1. Clean response of any chatty AI text
        text_response = response.text.strip()
        
        # 2. Use regex to find the actual JSON block { ... }
        match = re.search(r'(\{.*\})', text_response, re.DOTALL)
        
        if match:
            json_str = match.group(1)
            try:
                # 3. USE strict=False to handle \n characters (fixes your char 381 error)
                return json.loads(json_str, strict=False)
            except json.JSONDecodeError:
                # 4. Emergency cleaning for single quotes or unescaped newlines
                fixed_json = json_str.replace("'", '"').replace('\n', '\\n')
                return json.loads(fixed_json, strict=False)
        else:
            raise ValueError("AI didn't provide a valid JSON block.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/flowcharts", response_model=schemas.FlowchartResponse)
async def create_flowchart(flowchart: schemas.FlowchartCreate, db: AsyncSession = Depends(get_db)):
    new_flowchart = Flowchart(
        title=flowchart.title,
        flow_data=flowchart.flow_data
    )
    
    db.add(new_flowchart)
    await db.commit()
    await db.refresh(new_flowchart)
    return new_flowchart

@app.get("/flowcharts/{flowchart_id}", response_model=schemas.FlowchartResponse)
async def get_flowchart(flowchart_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Flowchart).where(Flowchart.id==flowchart_id))
    flowchart = result.scalars().first()
    
    if not flowchart:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    return flowchart

@app.put("/flowcharts/{flowchart_id}", response_model=schemas.FlowchartResponse)
async def update_flowchart(flowchart_id: UUID, flowchart_update: schemas.FlowchartUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Flowchart).where(Flowchart.id == flowchart_id))
    flowchart = result.scalars().first()
    
    if not flowchart:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    if flowchart_update.title is not None:
        flowchart.title = flowchart_update.title
    
    if flowchart_update.flow_data is not None:
        flowchart.flow_data = flowchart_update.flow_data
        
    await db.commit()
    await db.refresh(flowchart)
    return flowchart