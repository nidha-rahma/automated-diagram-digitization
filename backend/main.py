import os
import io
import json
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from google import genai
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from PIL import Image

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, get_db
from models import Flowchart
import schemas

# Load .env file
load_dotenv()

# VLM Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=GEMINI_API_KEY)

# Creates tables when server boots up
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # Auto create tables in models.py if they dont exist yet
        await conn.run_sync(Base.metadata.create_all)
    yield

# Intialise fastapi
app = FastAPI(lifespan=lifespan)


# PROMPT
SYSTEM_PROMPT = """
You are an expert Optical Graph Recognition engine.
Analyze the provided flowchart image and extract its structure into a JSON format.
Follow these strict rules:

1. **Nodes**: Identify every shape (rectangle, diamond, oval, circle).
   - Assign a unique numeric ID (string) to each node.
   - Extract the text inside the node into 'label'.
   - Identify the shape type: "process" (rectangle), "decision" (diamond), "start_end" (oval/rounded), "io" (parallelogram).
   - Estimate relative (x, y) coordinates (0-1000 scale) to maintain the layout.

2. **Edges**: Identify every arrow connecting nodes.
   - 'source': ID of the node where the line starts.
   - 'target': ID of the node where the arrow points.
   - 'label': Any text written ON the line (e.g., "Yes", "No"). If none, use empty string.

3. **Output Format**: Return ONLY raw JSON. Do not use Markdown backticks.
Structure:
{
  "nodes": [
    {"id": "1", "label": "Start", "type": "start_end", "x": 500, "y": 100},
    ...
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "init"},
    ...
  ]
}
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
            contents=[SYSTEM_PROMPT, image]
        )

        # Clean the response
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]

        # Verify response
        json_data = json.loads(text_response)

        return json_data

    except Exception as e:
        print(f"Error: {e}")
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
async def get_flowchart(flowchart_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Flowchart).where(Flowchart.id==flowchart_id))
    flowchart = result.scalars().first()
    
    if not flowchart:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    return flowchart

@app.put("/flowcharts/{flowchart_id}", response_model=schemas.FlowchartResponse)
async def update_flowchart(flowchart_id: str, flowchart_update: schemas.FlowchartUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Flowchart).where(Flowchart.id == flowchart_id))
    flowchart = result.scalars.first()
    
    if not flowchart:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    if flowchart_update.title is not None:
        flowchart.title = flowchart_update.title
    
    if flowchart_update.flow_data is not None:
        flowchart.flow_data = flowchart_update.flow_data
        
    await db.commit()
    await db.refresh(flowchart)
    return flowchart