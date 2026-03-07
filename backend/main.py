import os
import io
import json
from dotenv import load_dotenv
from google import genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image

# Load .env file
load_dotenv()

# VLM Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=GEMINI_API_KEY)


# Intialise fastapi
app = FastAPI()


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
@app.post('/analyze/image')
async def analyze_flowchart(file: UploadFile = File(...)):
    try:
        # Read the uploaded image bytes and convert it into PIL image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Resize image
        image.thumbnail((1024, 1024))

        # Send Image + prompt to AI
        response = client.models.generate_content(
            model="gemini-flash-latest",
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
    

# Updated System Prompt for Text-to-Flowchart
TEXT_TO_FLOW_PROMPT = """
You are a React Flow architect. Convert the user's process description or algorithm into a structured JSON.
Output ONLY raw JSON.

### NODE RULES (STRICT BOUNDARIES):
- TYPES: You MUST use only: "start", "process", "decision", "io".
- ROOT-LEVEL DIMENSIONS: width and height MUST be at the root level of the node object.
- DYNAMIC SCALING RULE: 
    * If a label has many lines, you MUST increase width/height to maintain a 25px clear internal margin.
    * FOR 'decision' DIAMONDS: Because corners cut inward, the node size must be at least 2.5x the width of the longest text line. 
    * If text in a diamond is 5+ lines, the node size MUST be at least 200x200.
- FONT SIZE: Assume 12px font. 

### EXAMPLE DYNAMIC STRUCTURE:
{
  "id": "unique_id",
  "type": "decision",
  "position": {"x": x, "y": y},
  "data": {"label": "Is the current\\ntemperature\\nsignificantly higher\\nthan the safety\\nthreshold?"},
  "width": 220,  # AI scales this up from 120 to fit text in diamond points
  "height": 220
}


### EDGE & LABEL RULES:
- Use "type": "smoothstep" and "markerEnd": {"type": "arrowclosed"}.
- Use "sourceHandle" and "targetHandle" (top, bottom, left, right) for clean connections.
- For decision branches (Yes/No), include these exact styling properties to create a long rectangular box:
  "label": "Yes",
  "labelStyle": {"fill": "#000", "fontWeight": 700},
  "labelBgStyle": {"fill": "#fff", "fillOpacity": 0.9, "stroke": "#000", "strokeWidth": 1},
  "labelBgPadding": [8, 4],
  "labelBgBorderRadius": 4

  
### LABEL & TEXT RULES (RHOMBIC TYPESETTING):
- IMPORTANT: Labels MUST stay within the diamond's safety zone.
- VISUAL SHAPING: For 'decision' nodes, format the text block like a rhombus:
    * The first line must be 1-2 short words.
    * The middle lines must be the longest (maximum width).
    * The last line must be 1-2 short words.
- LINE LENGTH: Middle lines can be up to 18-20 characters; top/bottom lines should be under 10 characters.
- VERTICAL ALIGNMENT: Use exactly 1 newline (\\n) between lines to ensure vertical centering.
- DYNAMIC SCALING: If the text is long, you MUST increase root-level 'width' and 'height' to at least 2.5x the longest line length.



### FONT & SIZE CONSTRAINTS:
- Use a strict "fontSize": 12 or 13 in the node style to ensure readability without overflow.
- IMPORTANT: For 'decision' nodes (120x120), the text must be centered and have at least 15px of padding from all diamond edges.
- If a label is very long, the AI must increase the 'width' and 'height' of that specific node proportionally (e.g., 140x140) instead of letting text bleed out.
"""

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

