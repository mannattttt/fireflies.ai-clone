#  Fireflies.ai Clone — AI Meeting Assistant

A full-stack, AI-powered meeting transcription and notebook platform inspired by Fireflies.ai. Built with Next.js 16, FastAPI, SQLite, and Google Gemini API.

---

##  Features

- **1. Interactive Media Player & Transcript Sync**: Play meeting recordings with automated active transcript segment highlighting and timestamp scrubbing (`?t=seconds`).
- **2. LLM-Powered AskFred AI Chat**: Conversational AI assistant powered by Gemini API (with smart fallback) to answer questions, extract action items, and summarize meeting insights — available on both individual meeting pages and the dashboard.
- **3. Multi-Format Export**: Export executive summary reports to PDF (`window.print()`), Markdown (`.md`), Plain Text (`.txt`), and WebVTT Subtitles (`.vtt`).
- **4. Line-Level Notes, Highlights & Soundbites**: Hover over any transcript line to highlight key moments, add sticky notes, or copy timestamped soundbite URLs to share.
- **5. Category Tagging & Filtering**: Automatic topic inference and clickable category filter pills (`#Sales`, `#Engineering`, `#Product`, `#Marketing`, `#Design`, `#General`).
- **6. Global Transcript Search**: Debounced instant search across all stored transcripts with `⌘K` keyboard shortcut.
- **7. App-Wide Dark Theme**: Complete dark mode aesthetic with persistent theme storage in `localStorage`.
- **8. Fully Responsive Design**: Seamless layout scaling from mobile viewports to ultra-wide desktop displays, including a mobile bottom navigation bar and mobile AskFred AI drawer.
- **9. DB-Cached AI Summaries**: Meeting summaries are generated once and cached in the database — no repeated API calls. Includes a "Regenerate" button to refresh summaries on demand.
- **10. Expandable Transcript View**: Toggle button to collapse the media player and expand the transcript to full height for focused reading.
- **11. Smart AI Fallback**: When Gemini API rate limits are hit, the system automatically generates detailed multi-paragraph summaries and conversational AskFred responses from transcript data — ensuring the app never shows error messages.

---

##  Tech Stack

### **Frontend**
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Client Hooks)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Icons**: `@heroicons/react`
- **Utilities**: `date-fns`

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic v2
- **AI Integration**: `google-genai` SDK (Gemini 1.5 Flash / 2.0 Flash with automatic model fallback)
- **Server**: Uvicorn ASGI

### **Deployment**
- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Render](https://render.com/)

---

##  Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend                      │
│   (Dashboard, Meeting Notepad 3-Pane View, Settings, Search) │
│   Mobile: Bottom Nav Bar + AskFred AI Drawer                │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Calls (/api)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│  - Routers: /meetings, /meetings/{id}/chat,                 │
│             /meetings/{id}/regenerate-summary, /action-items │
│  - Services: transcript_parser, ai_summary, ask_fred        │
│  - AI Fallback: Smart summary & chat when API rate-limited  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌───────────────────────────┐
│     SQLite Database          │ │  Google Gemini API         │
│  (meetings.db / SQLAlchemy)  │ │  (gemini-1.5-flash /      │
│  - Cached AI Summaries       │ │   gemini-2.0-flash)       │
│  - Transcript Segments       │ │  + Smart Fallback Engine  │
└──────────────────────────────┘ └───────────────────────────┘
```

---

##  Database Schema

The database uses SQLite managed via SQLAlchemy ORM models (`backend/models/`):

### 1. `meetings`
- `id` (INTEGER, Primary Key)
- `title` (VARCHAR)
- `date` (DATETIME)
- `duration_seconds` (INTEGER)
- `media_url` (TEXT, Nullable)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2. `participants`
- `id` (INTEGER, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)

### 3. `meeting_participants` (Junction Table)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `participant_id` (INTEGER, Foreign Key -> `participants.id`)

### 4. `transcript_segments`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `speaker_name` (VARCHAR)
- `text` (TEXT)
- `start_time` (FLOAT)
- `end_time` (FLOAT)
- `order_index` (INTEGER)

### 5. `summaries` (Cached AI Summaries)
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`, Unique)
- `overview_text` (TEXT)
- `generated_at` (DATETIME)

### 6. `key_topics`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `topic_text` (VARCHAR)
- `order_index` (INTEGER)

### 7. `action_items`
- `id` (INTEGER, Primary Key)
- `meeting_id` (INTEGER, Foreign Key -> `meetings.id`)
- `text` (TEXT)
- `assignee` (VARCHAR, Nullable)
- `is_completed` (BOOLEAN, Default: False)
- `created_at` (DATETIME)

### 8. `tags` & `meeting_tags`
- Tags with `name` and `color` fields
- Many-to-many junction table linking meetings to tags

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

# Seed the database with sample meetings
python seed.py

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

# Create .env.local with backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start Next.js development server
npm run dev
```
*Frontend application will be running at `http://localhost:3000`.*

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meetings` | List all meetings (with search, date filter, sort) |
| GET | `/meetings/{id}` | Get meeting detail with transcript, summary, topics |
| POST | `/meetings` | Create a new meeting with transcript |
| PATCH | `/meetings/{id}` | Update meeting title, date, participants |
| DELETE | `/meetings/{id}` | Delete a meeting |
| GET | `/meetings/search?q=` | Global transcript search |
| GET | `/meetings/{id}/transcript/search?q=` | Search within a meeting transcript |
| POST | `/meetings/{id}/chat` | AskFred AI — ask questions about a meeting |
| POST | `/meetings/{id}/regenerate-summary` | Regenerate cached AI summary |
| POST | `/action-items` | Create a new action item |
| POST | `/action-items/{id}/toggle` | Toggle action item completion |
| DELETE | `/action-items/{id}` | Delete an action item |

---

##  Assumptions Made

1. **User Authentication**: The current version operates with a default logged-in profile ("Mannat") for local notebook management.
2. **Audio/Video Playback**: Media player falls back to an interactive audio visualizer preview when sample video assets are not present locally.
3. **Database Simplicity**: SQLite is used for lightweight local setup. For production scaling, SQLAlchemy models can be pointed to PostgreSQL with minimal configuration.
4. **Gemini API Rate Limits**: Free-tier Gemini API has 15 RPM / 1,500 RPD limits. The app includes smart fallback generators that produce detailed summaries from transcript data when the API is rate-limited — no user-facing errors.
5. **Summary Caching**: AI summaries are generated once at meeting creation and cached in the DB. Use the "Regenerate" button to refresh when API quota is available.
