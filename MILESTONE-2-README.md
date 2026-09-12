# Evangadi Forum — Milestone 2

## Questions & Answers

Milestone 2 adds the core community forum functionality to Evangadi Forum.

The main focus of this milestone is:

- Creating and listing questions
- Viewing a single question
- Creating and listing answers
- AI-assisted question drafting
- AI-assisted answer assessment
- Vector embeddings for semantic search

---

## Backend Structure

```text
backEnd/
└── src/
    └── api/
        ├── auth/
        │   ├── controller/
        │   ├── routes/
        │   ├── service/
        │   └── validations/
        │
        ├── question/
        │   ├── controller/
        │   │   └── question.controller.js
        │   ├── routes/
        │   │   └── question.routes.js
        │   ├── service/
        │   │   ├── geminiTextCoach.service.js
        │   │   ├── question.service.js
        │   │   └── vector.service.js
        │   └── validations/
        │       └── question.validation.js
        │
        └── answer/
            ├── controller/
            │   └── answer.controller.js
            ├── routes/
            │   └── answer.routes.js
            ├── service/
            │   └── answer.service.js
            └── validations/
                └── answer.validation.js
```

---

## Question API

Base path:

```text
/api/questions
```

### 1. Create Question

```http
POST /api/questions
```

Purpose:

- Create a new question
- Save it in MySQL
- Generate an embedding/vector for semantic search
- Associate the question with the authenticated user

Protected route: **Yes**

---

### 2. List Questions

```http
GET /api/questions
```

Purpose:

- Return available questions
- Support normal keyword search
- Support a `mine` filter for the logged-in user's questions

Protected route: Depends on implementation

---

### 3. Get Single Question

```http
GET /api/questions/:questionHash
```

Purpose:

- Return one question
- Return its details
- Return answers associated with the question

---

### 4. Semantic Search

```http
GET /api/questions/search
```

Purpose:

- Convert the user's search text into an embedding
- Compare it with saved question vectors
- Return semantically related questions

---

### 5. AI Draft Coach

```http
POST /api/questions/draft-coach
```

Purpose:

- Help the user improve a question before posting
- Use Gemini to provide suggestions or rewrite assistance

---

## Answer API

Base path:

```text
/api/answers
```

### 1. Create Answer

```http
POST /api/answers
```

Purpose:

- Add an answer to a question
- Associate the answer with the authenticated user

Protected route: **Yes**

---

### 2. Get Answers

```http
GET /api/answers
```

Purpose:

- Return answers
- Can be filtered by question depending on the final route design

---

### 3. Assess Answer

```http
POST /api/answers/assess
```

Purpose:

- Send an answer to the AI service
- Evaluate answer quality
- Return useful feedback to the user

---

## Main Services

### `question.service.js`

Handles question business logic such as:

- Create question
- List questions
- Get single question
- Search questions

### `vector.service.js`

Handles embedding and semantic-search logic such as:

- Generate embeddings
- Compare vectors
- Calculate similarity
- Return related questions

### `geminiTextCoach.service.js`

Handles Gemini-powered text assistance such as:

- Improve question wording
- Give drafting suggestions
- Support AI-assisted forum features

### `answer.service.js`

Handles answer business logic such as:

- Create answer
- Retrieve answers
- Prepare answer data for AI assessment

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

## Milestone 2 Checklist

- [ ] Question folder structure
- [ ] Answer folder structure
- [ ] Create Question API
- [ ] List Questions API
- [ ] Single Question API
- [ ] Semantic Search
- [ ] Question Draft Coach
- [ ] Create Answer API
- [ ] Get Answers API
- [ ] Answer Assessment
- [ ] Input validation
- [ ] Authentication on protected routes
- [ ] Error handling
- [ ] Postman testing
- [ ] Frontend integration
- [ ] Merge completed work into `main`

---

## Git Workflow

Create a Milestone 2 branch:

```bash
git checkout -b feature/milestone-2-qa
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "scaffold milestone 2 question and answer APIs"
```

Push:

```bash
git push -u origin feature/milestone-2-qa
```

After Milestone 2 is complete and tested, open a Pull Request and merge it into `main`.

---

## Milestone Goal

By the end of Milestone 2, users should be able to:

1. Sign in using the authentication system completed in Milestone 1.
2. Create questions.
3. Browse and search questions.
4. Open a question and read its answers.
5. Submit answers.
6. Receive AI assistance when drafting questions.
7. Use semantic search to find meaningfully related questions.
8. Receive AI feedback on answers.

Milestone 2 prepares the application for the more advanced AI and RAG functionality in Milestone 3.
