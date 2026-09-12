# Evangadi Forum

Evangadi Forum is a developer Q&A platform where users can register, log in, ask programming questions, share answers, search for related discussions, and learn from the community.

The project is organized into milestones so each major stage can be developed, tested, reviewed, and deployed incrementally.

---

## Project Milestones

### Milestone 1 — Authentication & Project Foundation

Milestone 1 establishes the project foundation and authentication system.

Main features include:

- User registration
- User login
- JWT authentication
- Protected routes
- Authentication context
- Landing page
- Dashboard
- Shared frontend layout
- Backend authentication API
- Error handling and validation

➡️ [View Milestone 1 README](./MILESTONE-1-README.MD)

---

### Milestone 2 — Questions & Answers

Milestone 2 adds the core community forum functionality.

Main features include:

- Create and list questions
- View a single question
- Create and list answers
- AI-assisted question drafting
- AI-assisted answer assessment
- Vector embeddings
- Semantic search

➡️ [View Milestone 2 README](./MILESTONE-2-README.md)

---

### Milestone 3 — AI & RAG

Milestone 3 will extend the platform with advanced AI and Retrieval-Augmented Generation (RAG) functionality.

Planned areas include:

- Document/PDF upload
- Document text extraction
- Chunking
- Embedding generation
- Vector storage and retrieval
- Similarity search
- Retrieval-Augmented Generation
- AI answers grounded in uploaded content

> The Milestone 3 README can be linked here when the milestone begins.

---

## Project Structure

```text
EvangadiForum/
├── backEnd/
│   ├── schema/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── question/
│   │   │   └── answer/
│   │   ├── middleware/
│   │   └── utility/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── frontEnd/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
│
├── MILESTONE-1-README.MD
├── MILESTONE-2-README.md
└── README.md
```

---

## Technologies

### Frontend

- React
- Vite
- React Router
- Axios
- CSS Modules

### Backend

- Node.js
- Express
- MySQL
- JWT
- bcrypt
- dotenv
- CORS

### AI / Semantic Search

- Google Gemini
- Embeddings
- Vector similarity
- Semantic search

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EvangadiForum
```

### 2. Install Frontend Dependencies

```bash
cd frontEnd
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backEnd
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backEnd` folder and use `.env.example` as a reference.

> Never commit real `.env` files, JWT secrets, database credentials, passwords, or API keys to GitHub.

### 5. Run the Backend

```bash
cd backEnd
npm run dev
```

### 6. Run the Frontend

Open another terminal:

```bash
cd frontEnd
npm run dev
```

---

## API Overview

### Authentication

```text
/api/auth
```

Handles:

- Registration
- Login
- Authentication
- Protected user access

### Questions

```text
/api/questions
```

Handles:

- Creating questions
- Listing questions
- Viewing a single question
- Semantic search
- AI drafting assistance

### Answers

```text
/api/answers
```

Handles:

- Creating answers
- Retrieving answers
- AI-assisted answer assessment

---

## Request Flow

```text
Frontend
   ↓
Route
   ↓
Validation
   ↓
Authentication Middleware
   ↓
Controller
   ↓
Service
   ↓
MySQL / Gemini / Vector Logic
   ↓
Controller Response
   ↓
Frontend
```

---

## Team Collaboration Workflow

Do not work directly on `main`.

Before starting a task:

```bash
git checkout main
git pull origin main
git checkout -b feature/task-name
```

After completing the task:

```bash
git add .
git commit -m "describe completed task"
git push -u origin feature/task-name
```

Then:

1. Open a Pull Request.
2. Review the changes.
3. Resolve conflicts if needed.
4. Merge into `main`.

---

## Branch Naming Examples

```text
feature/login-page
feature/auth-backend
feature/question-api
feature/answer-api
feature/milestone-2-qa
fix/login-validation
fix/import-paths
```

---

## Team Rules

- Pull the latest `main` before starting new work.
- Work on the assigned branch.
- Keep changes focused on the assigned task.
- Avoid editing another team member's files unless coordinated.
- Use clear and meaningful commit messages.
- Create a Pull Request for completed work.
- Review changes before merging.
- Resolve merge conflicts carefully.
- Never commit secrets or environment files.

---

## Milestone Workflow

```text
Milestone 1
Authentication + Foundation
        ↓
Merge to main
        ↓
Deploy
        ↓
Milestone 2
Questions + Answers + Semantic Search
        ↓
Merge to main
        ↓
Update Deployment
        ↓
Milestone 3
AI + RAG
        ↓
Merge to main
        ↓
Final Deployment
```

---

## Project Goal

The goal of Evangadi Forum is to provide a collaborative developer community where users can ask questions, share knowledge, search for relevant discussions, and receive AI-powered assistance.

The milestone-based structure allows the team to build the application progressively while keeping each stage organized, testable, and deployable.
