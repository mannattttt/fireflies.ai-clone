#  Fireflies.ai Clone — AI Meeting Assistant

A full-stack, AI-powered meeting transcription and notebook platform inspired by Fireflies.ai. Built with Next.js 16, FastAPI, SQLite, and Google Gemini 3.5 Flash.

---

##  Features

- **1. Interactive Media Player & Transcript Sync**: Play meeting recordings with automated active transcript segment highlighting and timestamp scrubbing (`?t=seconds`).
- **2. LLM-Powered AskFred AI Chat**: Conversational AI assistant powered by `gemini-3.5-flash` to answer questions, extract action items, and summarize meeting insights.
- **3. Multi-Format Export**: Export executive summary reports to PDF (`window.print()`), Markdown (`.md`), Plain Text (`.txt`), and WebVTT Subtitles (`.vtt`).
- **4. Line-Level Notes, Highlights & Soundbites**: Hover over any transcript line to highlight key moments, add sticky notes, or copy timestamped soundbite URLs to share.
- **5. Category Tagging & Filtering**: Automatic topic inference and clickable category filter pills (`#Sales`, `#Engineering`, `#Product`, `#Marketing`, `#Design`, `#General`).
- **6. Global Transcript Search**: Debounced instant search across all stored transcripts with `⌘K` keyboard shortcut.
- **7. App-Wide Dark Theme**: Complete dark mode aesthetic with persistent theme storage in `localStorage`.
- **8. Fully Responsive Design**: Seamless layout scaling from mobile viewports to ultra-wide desktop displays.

---

##  Tech Stack

### **Frontend**
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Client Hooks)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Icons**: `@heroicons/react`
- **Utilities**: `date-fns`

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic v2
- **AI Integration**: `google-genai` SDK (`gemini-3.5-flash`)
- **Server**: Uvicorn ASGI

---

##  Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend                      │
│   (Dashboard, Meeting Notepad 3-Pane View, Settings, Search) │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Calls (/api)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│  - Routers: /meetings, /meetings/{id}/chat, /action-items   │
│  - Services: transcript_parser, ai_summary, ask_fred        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌───────────────────────────┐
│     SQLite Database          │ │  Google Gemini 3.5 Flash  │
│  (meetings.db / SQLAlchemy)  │ │   (AI Summaries & Q&A)    │
└──────────────────────────────┘ └───────────────────────────┘
```

---

##  Database Schema

The database uses SQLite managed via SQLAlchemy ORM models (`backend/models.py`):

### 1. `meetings`
- `id` (INTEGER, Primary Key)
- `title` (VARCHAR)
- `date` (DATETIME)
- `duration_seconds` (INTEGER)
- `video_url` (VARCHAR, Nullable)
- `audio_url` (VARCHAR, Nullable)
- `created_at` (DATETIME)

### 2. `participants`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `name` (VARCHAR)
- `email` (VARCHAR)

### 3. `transcript_segments`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `speaker_name` (VARCHAR)
- `text` (TEXT)
- `start_time` (FLOAT)
- `end_time` (FLOAT)

### 4. `summaries`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `overview_text` (TEXT)
- `created_at` (DATETIME)

### 5. `key_topics`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `topic_text` (VARCHAR)
- `start_time` (FLOAT, Nullable)
- `end_time` (FLOAT, Nullable)

### 6. `action_items`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `text` (VARCHAR)
- `assignee` (VARCHAR, Nullable)
- `is_completed` (BOOLEAN, Default: False)

---

## ⚡ Quickstart & Local Setup

### **Prerequisites**
- Node.js >= 18.x
- Python >= 3.10
- Google Gemini API Key ([Get a key here](https://aistudio.google.com/))

### **1. Backend Setup**
```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Gemini API Key
echo "GEMINI_API_KEY=your_actual_gemini_api_key" > .env

# Run FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
*Backend API will be running at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).*

### **2. Frontend Setup**
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend application will be running at `http://localhost:3000`.*

---

##  Assumptions Made

1. **User Authentication**: The current version operates with a default logged-in profile ("Mannat") for local notebook management.
2. **Audio/Video Playback**: Media player falls back to an interactive audio visualizer preview when sample video assets are not present locally.
3. **Database Simplicity**: SQLite is used for lightweight local setup. For production scaling, SQLAlchemy models can be pointed to PostgreSQL with minimal configuration.
