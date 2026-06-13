# AdmissionAI – AI-Powered University Admission Assistant

AdmissionAI is a Retrieval-Augmented Generation (RAG) based admission support platform designed to assist students with university-related queries using institutional knowledge documents.

The system combines a knowledge base, intelligent document retrieval, and Google Gemini to provide accurate, context-aware answers about courses, fees, scholarships, hostel facilities, admission procedures, eligibility criteria, and more.

---

## Features

### AI Chat Assistant

* Natural language question answering
* Context-aware admission support
* Powered by Google Gemini
* Retrieval-Augmented Generation (RAG)

### Knowledge Base Management

* Upload university documents
* Automatic document processing
* Text chunking and indexing
* Knowledge base statistics dashboard

### Smart Retrieval System

* Keyword-based document retrieval
* Context construction from relevant chunks
* Hallucination reduction through grounded responses
* Source-aware answer generation

### Admission Support Capabilities

* Course information
* Eligibility requirements
* Fee structure details
* Scholarship information
* Hostel facilities
* Required admission documents
* Reservation policies
* Placement and career services

### Administrative Dashboard

* Document management
* Chat session tracking
* Lead management
* Call logs
* Analytics overview

---

## Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Supabase
* Prisma ORM

### AI & RAG

* Google Gemini 2.5 Flash
* Custom Retrieval Engine
* Document Chunking Pipeline

### Development Tools

* VS Code
* Prisma Studio
* Git & GitHub

---

## System Architecture

User Query
↓
Retrieval Engine
↓
Relevant Document Chunks
↓
Context Builder
↓
Google Gemini
↓
Grounded Response

The AI never answers directly from model memory. Responses are generated using information retrieved from uploaded university documents.

---

## Project Structure

backend/
├── src/
│ ├── controllers/
│ ├── services/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── utils/
│
├── prisma/
│ └── schema.prisma
│
└── uploads/

frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── services/
│ └── layouts/

---

## Database Models

### Users

Stores administrator and agent information.

### Documents

Stores uploaded knowledge base documents.

### Document Chunks

Stores processed chunks used for retrieval.

### Chat Sessions

Stores student conversation sessions.

### Chat Messages

Stores user and assistant messages.

### Leads

Stores admission enquiries.

### Call Logs

Stores communication history.

---

## Knowledge Base Workflow

1. Upload university documents
2. Extract document content
3. Split content into chunks
4. Store chunks in database
5. Retrieve relevant chunks during queries
6. Build contextual prompt
7. Generate answer using Gemini

---

## Sample Queries

* What courses are available?
* What is the fee for B.Tech Computer Science?
* Are scholarships available for OEC students?
* What documents are required for admission?
* Are separate hostels available for boys and girls?
* What is the eligibility for MCA?
* How can I apply for admission?

---

## Installation

### Clone Repository

git clone https://github.com/your-username/admission-ai.git

cd admission-ai

### Backend Setup

cd backend

npm install

Create .env file

DATABASE_URL=your_database_url

DIRECT_URL=your_direct_database_url

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-2.5-flash

Run Prisma

npx prisma generate

npx prisma db push

Start Server

npm run dev

### Frontend Setup

cd frontend

npm install

npm run dev

---

## Environment Variables

DATABASE_URL

DIRECT_URL

GEMINI_API_KEY

GEMINI_MODEL

JWT_SECRET

PORT

---

## Current Capabilities

* AI-powered admission chatbot
* Knowledge base document management
* Gemini integration
* Retrieval-Augmented Generation (RAG)
* Supabase database integration
* Prisma ORM support
* Administrative dashboard
* Lead management system

---

## Future Enhancements

* Vector embeddings with pgvector
* Semantic search
* Voice assistant integration
* Multi-university support
* Student authentication portal
* WhatsApp integration
* Analytics dashboard enhancements
* Conversation memory
* Source citations in responses

---

## Learning Outcomes

This project demonstrates practical implementation of:

* Retrieval-Augmented Generation (RAG)
* Large Language Model Integration
* Prompt Engineering
* Database Design
* Full Stack Development
* REST API Development
* Knowledge Base Systems
* AI-Powered Chat Applications

---

This project is intended for educational and demonstration purposes.

