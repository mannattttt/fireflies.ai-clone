"""
Fireflies.ai Clone — FastAPI Backend
Main application entry point with CORS configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Backend API for the Fireflies.ai meeting assistant clone",
    version="1.0.0",
)

# CORS configuration — allow the Next.js frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check / hello world endpoint."""
    return {"message": "Hello from Fireflies API"}
