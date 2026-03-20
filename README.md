# 🚀 VivaMate AI - Interview Preparation Platform

An AI-powered interview preparation platform that generates personalized technical and behavioral questions based on your resume and job description.

## 🌐 Live Demo
- **Frontend:** [https://viva-mate-ai.vercel.app](https://viva-mate-ai.vercel.app)
- **Backend API:** [https://vivamate-ai.onrender.com](https://vivamate-ai.onrender.com)

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Run Locally](#-run-locally)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

### 🔐 User Authentication
- Register/Login with JWT authentication
- Secure password hashing with bcrypt
- Protected routes for authenticated users

### 📄 AI-Powered Interview Generation
- **Upload Resume** (PDF format) or enter self-description
- **Paste Job Description** to tailor questions
- **Generate 15 Technical Questions** covering:
  - MongoDB, Express.js, React, Node.js
  - Data Structures & Algorithms
  - System Design
  - Security best practices
  - Performance optimization
  - API design and architecture
  - Database optimization
  - Authentication & Authorization

### 🧠 15 Behavioral Questions
- STAR format answers (Situation, Task, Action, Result)
- Topics covered:
  - Teamwork & Collaboration
  - Leadership & Initiative
  - Problem-solving under pressure
  - Conflict resolution
  - Learning agility
  - Communication skills
  - Time management
  - Adaptability & Flexibility

### 📊 Interview Report Features
- **Match Score:** 0-100% compatibility with job description
- **Skill Gaps Analysis:** Identify missing skills with severity (High/Medium/Low)
- **Technical Questions:** 15 detailed questions with:
  - Question statement
  - Interviewer's intention
  - Model answer with key points
- **Behavioral Questions:** 15 real-world scenarios with:
  - STAR format answers
  - What the interviewer wants to assess
  - Best approach to answer
- **Preparation Plan:** Day-wise study schedule (7-14 day plan)

### 📥 Resume PDF Download
- Generate and download an optimized, ATS-friendly resume PDF
- Professional formatting
- Tailored to the job description

### 🎨 Modern UI
- Clean, responsive design
- Mobile-friendly layout
- Interactive question cards
- Smooth animations

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router DOM | Navigation |
| Axios | API calls |
| Sass | Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Multer | File upload |
| pdf-parse | PDF text extraction |
| Google Gemini AI | AI question generation (15+15 questions) |
| Puppeteer | PDF generation |
| Zod | Schema validation |

### Deployment
| Platform | Purpose |
|----------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 🧠 How It Works

1. **User uploads resume** (PDF) or enters self-description
2. **User pastes job description** they're targeting for the interview
3. **AI analyzes** the resume against job requirements using Google Gemini AI
4. **Generates 15 technical + 15 behavioral questions** personalized to user's experience
5. **Creates a comprehensive interview report** with:
   - Match score (0-100%)
   - Skill gaps with severity levels
   - 15 technical questions with intentions and model answers
   - 15 behavioral questions with STAR method answers
   - 7-14 day preparation plan with daily tasks
6. **User can download** optimized resume PDF tailored to the job

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/amitkumaryadav2672/VivaMate-AI.git
cd VivaMate-AI

# Install backend dependencies
cd backend
npm install

Environment Variables
Backend (.env in /backend folder)
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vivamate
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=http://localhost:5173,https://viva-mate-ai.vercel.app

Frontend (.env in /frontend folder)
VITE_API_URL=http://localhost:5000


VivaMate-AI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Auth logic
│   │   │   └── interview.controller.js # Interview logic
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   └── file.middleware.js    # File upload handling
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js         # User schema
│   │   │   └── interviewReport.model.js # Report schema
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   └── interview.routes.js   # Interview endpoints
│   │   │
│   │   ├── services/
│   │   │   └── ai.service.js         # Gemini AI integration
│   │   │
│   │   └── app.js                     # Express app setup
│   │
│   ├── server.js                      # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── components/
    │   │   │   │   └── Protected.jsx     # Route protection
    │   │   │   ├── hooks/
    │   │   │   │   └── useAuth.js        # Auth logic hook
    │   │   │   ├── pages/
    │   │   │   │   ├── Login.jsx         # Login page
    │   │   │   │   └── Register.jsx      # Register page
    │   │   │   └── services/
    │   │   │       └── auth.api.js       # Auth API calls
    │   │   │
    │   │   └── interview/
    │   │       ├── components/
    │   │       │   ├── QuestionCard.jsx  # Question display
    │   │       │   └── RoadMapDay.jsx    # Plan day display
    │   │       ├── hooks/
    │   │       │   └── useInterview.js   # Interview logic hook
    │   │       ├── pages/
    │   │       │   ├── Home.jsx          # Form page
    │   │       │   └── Interview.jsx     # Report page
    │   │       ├── services/
    │   │       │   └── interview.api.js  # Interview API calls
    │   │       └── style/
    │   │           ├── home.scss
    │   │           └── interview.scss
    │   │
    │   ├── App.jsx                       # Main app component
    │   ├── main.jsx                      # Entry point
    │   └── style.scss                    # Global styles
    │
    ├── index.html
    ├── vite.config.js
    └── package.json


# 1. Start Backend (Terminal 1)
cd backend
npm run dev
# Backend runs on http://localhost:5000

# 2. Start Frontend (Terminal 2)
cd frontend
npm run dev
# Frontend runs on http://localhost:5173

# 3. Open browser
# http://localhost:5173

🚀 Deployment
Deploy Backend (Render)
Push code to GitHub

Go to render.com

Create new Web Service

Connect your GitHub repository

Settings:

Name: vivamate-ai-backend

Root Directory: backend

Build Command: npm install

Start Command: npm start

Node Version: 18.x

Add environment variables from .env file

Click Deploy

Deploy Frontend (Vercel)
Push code to GitHub

Go to vercel.com

Click Add New → Project

Import your GitHub repository

Set environment variable:

VITE_API_URL = https://vivamate-ai.onrender.com

Click Deploy

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

text
MIT License

Copyright (c) 2025 Amit Kumar Yadav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


👨‍💻 Author
Amit Kumar Yadav





