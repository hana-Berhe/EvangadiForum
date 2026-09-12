# Evangadi Forum

Evangadi Forum is a developer Q&A platform where users can register, log in, ask programming questions, share answers, and learn from the community.

## Milestone 1

Milestone 1 focuses on authentication and the initial project structure.

### Main Features

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

## Project Structure

```text
EvangadiForum/
├── backEnd/
│   ├── schema/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth/
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
└── README.md
```

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

Create a `.env` file inside the `backEnd` folder.

Use `.env.example` as a reference.

> Never commit your real `.env` file to GitHub.

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

## Team Collaboration Workflow

Do not work directly on the `main` branch.

Before starting a new task:

```bash
git checkout main
git pull origin main
git checkout -b feature/task-name
```

After completing the task:

```bash
git add .
git commit -m "Describe completed task"
git push -u origin feature/task-name
```

Then create a Pull Request on GitHub.

## Branch Naming Examples

```text
feature/login-page
feature/register-page
feature/auth-backend
feature/auth-context
fix/login-validation
```

## Team Rules

- Pull the latest `main` before starting a task.
- Work only on your assigned branch.
- Follow the Trello task description and checklist.
- Keep each task focused on the assigned files and folders.
- Avoid editing files assigned to another team member unless coordinated.
- Use clear and meaningful commit messages.
- Create a Pull Request for every completed task.
- Review changes before merging into `main`.
- Resolve merge conflicts carefully before merging.
- Never push `.env`, passwords, JWT secrets, database credentials, or API keys.

## Git Workflow Summary

```text
main
  ↓
pull latest changes
  ↓
create task branch
  ↓
work on assigned files
  ↓
commit changes
  ↓
push branch
  ↓
open Pull Request
  ↓
review
  ↓
merge into main
```

## Project Goal

The goal of Evangadi Forum is to provide a collaborative developer community where users can ask questions, share knowledge, and learn from each other.

Future milestones can extend the project with additional forum functionality and AI-powered features.
