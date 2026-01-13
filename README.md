# 📝 MeetNote – Intelligent Meeting Summarization System

MeetNote is an AI-powered meeting intelligence platform that transforms raw meeting audio into structured, searchable, and actionable insights. It enables automatic transcription, summarization, sentiment analysis, and **meeting-specific AI-powered Q&A**, helping users quickly understand what was discussed, decided, and assigned.

---

## 🚀 Features

- 🎧 Audio upload and processing
- 🗣️ Speech-to-text transcription using Whisper
- 🌍 Language translation for multilingual meetings
- 🧠 AI-based meeting summarization
- 📌 Automatic extraction of key points, action items, and decisions
- 😊 Sentiment analysis of meeting conversations
- ❓ **Meeting-specific AI Q&A** with hallucination control (answers strictly grounded in meeting content)
- 🔐 JWT-based authentication and authorization
- 📤 Multi-format export functionality
- 📊 Interactive dashboard for meeting insights

  ---

## 🛠️ Tech Stack

**Frontend**
- Next.js
- React

**Backend**
- Node.js
- API Routes (Next.js)
- JWT Authentication

**AI / NLP**
- Whisper (Speech-to-Text)
- Gemma (via Ollama)
**Database**
- MongoDB

---

## 🏗️ System Architecture (High-Level)

1. User uploads meeting audio  
2. Audio is transcribed using Whisper  
3. LLMs process transcripts to generate:
   - Summaries
   - Key points
   - Action items
   - Decisions
   - Sentiment insights
   - Multi Language Translation 
4. Structured data is stored in MongoDB  
5. Users can explore insights or ask questions via the AI Q&A interface  
6. Responses are constrained to meeting-specific context

---
## 🔐 Security

- JWT-based authentication
- User-specific meeting access
- Secure API endpoints
- Data isolation across users

---
## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB
- Ollama (local)
- Whisper dependencies

### Environment Variables

Create a `.env` file in the root directory and configure the following variables  
(use `.env.example` as a reference):

```env
# === Speech-to-Text (Whisper) ===
OPENAI_API_KEY=your_openai_api_key
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base

# === Database ===
MONGODB_URI=mongodb://localhost:27017/meetnote

# === Local LLM (Ollama) ===
OLLAMA_API_URL=http://localhost:11434
GEMMA_MODEL=gemma:latest

# === Authentication ===
JWT_SECRET=your_jwt_secret

# === App Settings ===
NEXT_PUBLIC_APP_NAME=MeetNote
```
---

## ▶️ Running the Application

Install dependencies and start the development server:

```bash
npm install
npm run dev
```
The application will be available at **http://localhost:3000**

##  Conclusion
MeetNote streamlines meeting analysis by converting audio into structured, actionable insights using AI.The platform improves productivity by enabling efficient review, understanding, and decision tracking.
Feel free to reach out with any questions, suggestions, or feedback. Contributions to enhance the functionality and user experience are always welcome.If you found this useful, give it a ⭐️ and share it with others!
