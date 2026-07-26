import os
from dotenv import load_dotenv
from google import genai
import sys

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY", "").strip()
print(f"API Key found: {'Yes' if api_key else 'No'} (starts with {api_key[:5]}...)")

if not api_key:
    print("No API key found in .env")
    sys.exit(1)
try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents="Say 'Hello World' and nothing else.",
    )
    print(f"Gemini API Response: {response.text}")
    print("SUCCESS: Gemini API is working!")
except Exception as e:
    print(f"ERROR: {e}")
