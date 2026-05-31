# # 🎬 AI Entertainment Assistant — Discovery OS

> **Context-Aware AI Recommendation Platform for Smarter Entertainment Discovery**

AI Entertainment Assistant — **Discovery OS** is a full-stack AI-powered entertainment recommendation platform designed to understand **natural language intent, emotions, activities, goals, social context, and personalization signals** to deliver more meaningful entertainment recommendations.

Unlike traditional systems that rely heavily on keywords and popularity signals, Discovery OS focuses on understanding **what the user actually wants — not just what they typed.**

---

## ✨ Core Idea

Traditional recommendation systems struggle with contextual searches such as:

* *"late night coding music"*
* *"breakup healing songs"*
* *"family comedy night"*
* *"I am eating food and chilling at home"*
* *"gym motivation playlist"*

These queries contain:

✔ Intent
✔ Emotion
✔ Activity Context
✔ Social Context
✔ Personalization Signals

Discovery OS combines **AI interpretation + recommendation logic + retrieval + behavioral memory** to improve entertainment discovery.

---

## 🚀 Features

### Authentication & User System

* JWT Authentication
* User Registration & Login
* Protected Routes
* Persistent User Profiles

### AI Recommendation Pipeline

* Gemini Query Interpretation
* Natural Language Intent Parsing
* Query Normalization
* Query Strength Detection
* Fallback Parser for AI Failures
* Recommendation Scoring & Ranking

### Personalization Engine

* Search History Tracking
* Watch History Tracking
* Feedback Memory
* Dynamic Preference Updates

### Frontend Experience

* Modern Dark SaaS UI
* Context-Aware Search
* Live Recommendations
* Analytics & Preference Dashboard
* Responsive Interface

---

## 🧠 Recommendation Workflow

```text
User Query
    ↓
Gemini AI Interpretation
    ↓
Canonical Schema Normalization
    ↓
Fallback Parser
    ↓
Controlled Query Construction
    ↓
YouTube Retrieval
    ↓
Scoring & Ranking
    ↓
Personalized Recommendations
```

---

## 🏗️ System Architecture

```text
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
JWT Authentication
        ↓
AI Recommendation Engine
    ├── Gemini Interpretation
    ├── Query Normalization
    ├── Fallback Parser
    ├── Query Strength Detection
    ├── Recommendation Scoring
    └── Personalization Memory
        ↓
YouTube Data API
        ↓
Personalized Recommendation Output
```

MongoDB Atlas stores:

* User Profiles
* Search History
* Watch History
* Feedback Memory

---

## ⚙️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication

### AI & APIs

* Gemini API
* YouTube Data API

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📸 Screenshots


### Dashboard
`/screenshots/Screenshot(491).png`


### Recommendation Flow

`/screenshots/Screenshot(492).png`

### Profile & Analytics

`/screenshots/Screenshot(493).png`

---

## 🌐 Deployment

**Frontend:**
https://ai-entertainment-assistant.vercel.app/

**Backend API:**
https://ai-entertainment-assistant.onrender.com/

---

## 🧪 Installation

### Clone Repository

```bash
git clone <repo-url>
cd AI-Entertainment-Assistant
```

### Install Frontend

```bash
cd frontend
npm install
npm run dev
```

### Install Backend

```bash
cd backend
npm install
npm run dev
```

---

## 🛠 Engineering Challenges Solved

This project involved solving several real-world engineering issues:

* Gemini API quota exhaustion (429 handling)
* YouTube API quota failures (403 / 429)
* Query drift & retrieval over-expansion
* Recommendation stability improvements
* Deployment configuration debugging
* SPA routing fixes for Vercel deployment
* Environment variable integration across services

---

## 🔮 Future Scope

* Context Intelligence Expansion
* Goal Understanding Layer
* Multi-Strategy Retrieval
* Advanced Memory Scoring
* Explainable Recommendations
* Enhanced Personalization Logic

---

## 👨‍💻 Author

**Divyanshu Tiwari**

Built as a full-stack AI engineering project exploring **context-aware entertainment intelligence**.
