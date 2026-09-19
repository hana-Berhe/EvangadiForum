# Working together on Evangadi Forum

Short rules so eight people can work in one repo without breaking each other's work.

## 1. Start every task from a fresh main

```bash
git checkout main
git pull origin main
git checkout -b feature/T-22-rag-upload
```

Use the branch name from the assignment sheet. One task = one branch = one PR.

## 2. Never commit to main

`main` is protected. Every change arrives through a Pull Request that one teammate has approved.

## 3. Add files by name

```bash
git status
git add backEnd/src/api/rag/service/rag.service.js
```

Do **not** use `git add .` or `git add -A`, even though the task docs show it. It picks up things that must never be in the repo: `.env`, uploaded PDFs, editor files. Run `git status` before every commit and read the list.

## 4. Commit messages

`[T-22] Implement RAG PDF upload and chunking` (task number in brackets, then what changed).

## 5. Before you open a PR, bring main into your branch

```bash
git checkout main
git pull origin main
git checkout feature/T-22-rag-upload
git merge main
```

Fix any conflicts on your branch, start the server, test again, then push. Use `merge`, not `rebase`: rebase rewrites history and needs a force push, which can destroy a teammate's work.

## 6. Conflicts in the shared RAG files

`rag.routes.js`, `rag.controller.js`, `rag.service.js` and `rag.validation.js` are touched by almost everyone.

- Write only between your own `// ---- T-XX ----` markers.
- Import lines at the top will sometimes conflict. The fix is always: **keep both lines**.
- Never delete someone else's block to make a conflict go away. Ask them.

## 7. Keep the diff small

Change only the lines your task needs. Do not reformat, reorder or rename things in files you are only passing through. A reviewer should see your work, not noise.

## 8. Project conventions

- Errors go to the client as `{ "msg": "..." }`. Success is `{ success, message, data }`.
- Throw the error classes from `src/utility/errors/errors.js`. Do not write `res.status(500)` by hand.
- Talk to the database through `safeExecute`.
- Embeddings: always call `generateQuestionEmbedding` from `question/service/vector.service.js` and pass a `taskType`. Never call Gemini's `embedContent` yourself. For similarity use `calculateCosineSimilarity`.
- Frontend API files are named `src/api/<name>.api.js`.
- The frontend folder is `frontEnd/` (the assignment sheet says `frontEndNew/`. Ignore that).

## 9. Database

- **Never run `schema/schema.sql` on a database that has data.** It begins with `DROP TABLE`. The three RAG tables are already in it, so check with `SHOW TABLES;` before doing anything.
- Need sample data? `npm run seed` inside `backEnd`.

## 10. Secrets and uploads

- `.env` is never committed. If your task needs a new setting, add it to `.env.example` with a safe example value and mention it in your PR.
- `backEnd/uploads/` is git-ignored. Uploaded PDFs stay on your machine.

## 11. Pull requests

- The PR template fills in automatically. In **Testing**, write only what you really tested.
- The reviewer reads the diff and runs the branch before approving.
- Merge with **Create a merge commit**, then delete the branch on GitHub.

## 12. After your PR is merged

```bash
git checkout main
git pull origin main
git branch -d feature/T-22-rag-upload
```
