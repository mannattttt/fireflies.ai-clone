"""
Fireflies.ai Clone — FastAPI Backend
Main application entry point with CORS configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from routers import meetings_router, action_items_router
from db import engine, Base

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Backend API for the Fireflies.ai meeting assistant clone",
    version="1.0.0",
)

app.include_router(meetings_router)
app.include_router(action_items_router)

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
