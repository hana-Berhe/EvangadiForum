# Evangadi Forum

Evangadi Forum is a developer Q&A platform where users can register, log in, ask programming questions, share answers, search for related discussions, ask questions about their own PDFs, chat with an AI assistant that answers from the forum, talk in discussion rooms, and learn from the community.

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

Milestone 3 adds a private Knowledge Base built on Retrieval-Augmented Generation (RAG).

Main features include:

- PDF upload, text extraction and chunking
- Embeddings for every chunk
- Semantic search inside one document
- AI answers grounded in the PDF, with citations and page numbers
- Reading, listing and deleting your own documents

➡️ [View Milestone 3 README](./MILESTONE-3-README.md)

---

### Milestone 4 — Extra Features: AI Chat Assistant & Discussion Rooms

Milestone 4 adds two features on top of the forum.

Main features include:

- AI chat assistant that answers only from forum threads and your own PDFs, and shows its sources
- Discussion Rooms: six fixed rooms to join and talk in, with new messages every 15 seconds

➡️ [View Milestone 4 README](./MILESTONE-4-README.md)

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
│   │   │   ├── answer/
│   │   │   ├── rag/
│   │   │   ├── chat/
│   │   │   └── room/
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
├── MILESTONE-3-README.md
├── MILESTONE-4-README.md
├── CONTRIBUTING.md
├── CONTRIBUTORS.md
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
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- express-validator
- multer
- pdf-parse
- dotenv
- CORS

### AI / Semantic Search

- Google Gemini
- Embeddings
- Vector similarity
- Semantic search
- Retrieval-Augmented Generation (RAG)

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

The frontend reads one variable, `VITE_API_BASE_URL`. See `frontEnd/.env.example`.

### 5. Create the Database

In phpMyAdmin (or the MySQL command line):

1. Create a new, empty database, for example `evangadi_forum_v2`, with collation `utf8mb4_unicode_ci`.
2. Select it and import `backEnd/schema/schema.sql`. This creates all tables, including the six fixed Discussion Rooms.
3. In `backEnd/.env`, set `DB_NAME` to that database.

> `schema.sql` recreates every table. Never run it on a database that has data you want to keep: use a new database instead.

### 6. Add Sample Data (optional)

```bash
cd backEnd
npm run seed
```

Adds 3 users, 21 questions and 22 answers through the same services the API uses, including FAQ threads the AI chat assistant can answer from. It only adds rows, and it stops if the sample users already exist. Log in with `sara.seed@example.com` and the password `Evangadi123`.

To add the "How do I use the forum?" FAQ threads the AI chat assistant answers from, run:

```bash
cd backEnd
npm run seed:faq
```

It is independent of `npm run seed`: it also works on a database that already has data, and it skips threads that are already there.

### 7. Run the Backend

```bash
cd backEnd
npm run dev
```

### 8. Run the Frontend

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
- Listing questions (keyword search, "my questions")
- Viewing a single question
- Semantic search
- Similar questions
- AI drafting assistance
- AI answer assessment (`/:questionHash/answer-fit`)
- Editing and deleting your own questions

### Answers

```text
/api/answers
```

Handles:

- Creating answers
- Retrieving answers
- Editing and deleting your own answers

### Knowledge Base (RAG)

```text
/api/rag
```

Handles:

- Uploading, listing, reading and deleting your own PDFs
- Semantic search inside a PDF
- AI answers grounded in a PDF, with citations

### AI Chat Assistant

```text
/api/chat
```

Handles:

- Answering a message from forum threads and your own PDFs, with sources

### Discussion Rooms

```text
/api/rooms
```

Handles:

- Listing and opening rooms
- Joining a room
- Reading and sending messages (members only)

---

## Request Flow

```text
Frontend
   ↓
Route
   ↓
Authentication Middleware
   ↓
Validation
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
git status
git add path/to/your-file.js
git commit -m "describe completed task"
git push -u origin feature/task-name
```

Add files by name and read `git status` first, so `.env` files and uploads never get committed. See [CONTRIBUTING.md](./CONTRIBUTING.md).

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
Knowledge Base (RAG)
        ↓
Merge to main
        ↓
Milestone 4
AI Chat Assistant + Discussion Rooms
        ↓
Merge to main
        ↓
Final Deployment
```

---

## Contributors

Built by a team of eight. See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for who built what in each milestone.

---

## Project Goal

The goal of Evangadi Forum is to provide a collaborative developer community where users can ask questions, share knowledge, search for relevant discussions, and receive AI-powered assistance.

The milestone-based structure allows the team to build the application progressively while keeping each stage organized, testable, and deployable.
