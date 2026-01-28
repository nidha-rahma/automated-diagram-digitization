import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_ID = "gemini-flash-latest"

def correct_text_batch(text_list):
    if not text_list:
        return []
    
    input_str = json.dumps(text_list)

    system_prompt = """
    You are a post-processing engine for a Flowchart OCR system. 
    Your job is to correct typos in the provided text list based on flowchart logic.
    
    Rules:
    1. Fix obvious English typos (e.g., "pisplay" -> "Display", "Srart" -> "Start").
    2. Fix logic symbol errors (e.g., "z" or "7" used as ">", "1" used as "l" in words).
    3. PRESERVE variable names (e.g., "num1" is valid, do not change it to "numb").
    4. Infer context: "is C z I1" -> "is C > 11".
    5. Return ONLY a JSON list of strings. No Markdown. No Explanations.
    
    Example Input: ["pisplay numt", "is A z 10", "End"]
    Example Output: ["Display num1", "is A > 10", "End"]
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[system_prompt, input_str],
            config=types.GenerateContentConfig(
                temperature=0.0
            )
        )

        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]

        return json.loads(clean_text)

    except Exception as e:
        print(f"LLM Correction failed: {e}")
        return text_list