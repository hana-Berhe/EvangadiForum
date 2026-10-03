// Fills an empty database with sample users, questions and answers.
//
// Run it from the backEnd folder:   npm run seed
//
// - It uses the same services as the API (register, create question, create
//   answer), so every row is created exactly like a real one: hashed password,
//   question hash, and a Gemini embedding for semantic search.
// - It only adds rows. It never deletes, truncates or updates anything.
// - It is safe to run twice: if the first seed user already exists it stops.
//
// db.config.js is imported first because it loads .env, and the services below
// read JWT_SECRET and GEMINI_API_KEY as soon as they are imported.
import { db, safeExecute } from "./db.config.js";
import {
  checkUserExists,
  registerService,
} from "../src/api/auth/service/auth.service.js";
import { createQuestionWithVectorService } from "../src/api/question/service/question.service.js";
import { createAnswerService } from "../src/api/answer/service/answer.service.js";

// Every seed user logs in with this password.
const SEED_PASSWORD = "Evangadi123";

const users = [
  { firstName: "Sara", lastName: "Bekele", email: "sara.seed@example.com" },
  { firstName: "Dawit", lastName: "Tesfaye", email: "dawit.seed@example.com" },
  { firstName: "Liya", lastName: "Mekonnen", email: "liya.seed@example.com" },
];

// `author` is a position in the users list above (0 = Sara, 1 = Dawit,
// 2 = Liya). A user cannot answer their own question, so an answer's author
// is always different from the question's author.
//
// `tag` is not saved yet: the database has no tags. It keeps the sample data
// sorted by category so a future Tags feature can use it.
const questions = [
  {
    author: 0,
    tag: "React",
    title: "Why does my useEffect run twice in development?",
    content: [
      "I log a message when my component mounts, but in the browser console the message appears **two times**. In the production build it appears once.",
      "",
      "```jsx",
      "useEffect(() => {",
      "  console.log('Dashboard mounted');",
      "}, []);",
      "```",
      "",
      "The dependency array is empty, so I expected one run. Is this a bug in my code or in React?",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "It is not a bug. In development, `<StrictMode>` mounts every component, unmounts it, and mounts it again. It does this on purpose, to show you effects that are missing a cleanup.",
          "",
          "Look in `main.jsx`. If your app is wrapped in `<StrictMode>`, that is the reason. Production builds never do the extra mount.",
        ].join("\n"),
      },
      {
        author: 2,
        content: [
          "To add to the answer above: do not remove StrictMode to hide it. Make the effect safe to run twice by returning a cleanup function:",
          "",
          "```jsx",
          "useEffect(() => {",
          "  const id = setInterval(tick, 1000);",
          "  return () => clearInterval(id);",
          "}, []);",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 1,
    tag: "React",
    title: "How do I cancel a fetch request when a component unmounts?",
    content: [
      "When I leave a page quickly, the request from that page still finishes and calls `setState` on a component that is gone.",
      "",
      "```jsx",
      "useEffect(() => {",
      "  fetch('/api/questions')",
      "    .then((res) => res.json())",
      "    .then((data) => setQuestions(data.data));",
      "}, []);",
      "```",
      "",
      "What is the correct way to stop the request inside `useEffect`?",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "Use an `AbortController` and abort it in the cleanup function:",
          "",
          "```jsx",
          "useEffect(() => {",
          "  const controller = new AbortController();",
          "",
          "  fetch('/api/questions', { signal: controller.signal })",
          "    .then((res) => res.json())",
          "    .then((data) => setQuestions(data.data))",
          "    .catch((err) => {",
          "      if (err.name !== 'AbortError') setError(err.message);",
          "    });",
          "",
          "  return () => controller.abort();",
          "}, []);",
          "```",
          "",
          "An aborted request rejects with `AbortError`, so ignore that one error and report the rest.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 2,
    tag: "Node",
    title: "Express returns 404 for /search because /:id matches first",
    content: [
      "I added a search route to my questions router, but every request to `/api/questions/search` answers with **Question not found**.",
      "",
      "```js",
      "router.get('/:id', getSingleQuestion);",
      "router.get('/search', searchQuestions);",
      "```",
      "",
      "The search controller is never called. Why does Express pick the wrong route?",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "Express checks routes from top to bottom and uses the first one that matches. `/:id` matches any single segment, so the word `search` is treated as an id.",
          "",
          "Put the fixed path before the path with a parameter:",
          "",
          "```js",
          "router.get('/search', searchQuestions);",
          "router.get('/:id', getSingleQuestion);",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 0,
    tag: "Node",
    title: "How do I verify a JWT in Express middleware?",
    content: [
      "My login route returns a token. Now I want to protect the other routes, so only requests with a valid token can continue.",
      "",
      "```js",
      "const token = req.headers.authorization;",
      "const payload = jwt.verify(token, process.env.JWT_SECRET);",
      "```",
      "",
      "This throws **jwt malformed** even with a token I just received. What am I missing?",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "The header value is `Bearer <token>`, not the token alone. Remove the prefix before you verify it:",
          "",
          "```js",
          "const header = req.headers.authorization || '';",
          "",
          "if (!header.startsWith('Bearer ')) {",
          "  return res.status(401).json({ msg: 'Authentication invalid' });",
          "}",
          "",
          "const token = header.split(' ')[1];",
          "```",
        ].join("\n"),
      },
      {
        author: 2,
        content: [
          "Also wrap `jwt.verify` in `try / catch`. It throws when the token is expired or was changed, and without a catch that becomes a 500 error instead of a 401.",
          "",
          "```js",
          "try {",
          "  req.user = jwt.verify(token, process.env.JWT_SECRET);",
          "  next();",
          "} catch {",
          "  res.status(401).json({ msg: 'Authentication invalid' });",
          "}",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 1,
    tag: "MySQL",
    title: "COUNT with LEFT JOIN gives the wrong number of answers",
    content: [
      "I want each question with its number of answers. After I joined a second table, the count became too high for some questions.",
      "",
      "```sql",
      "SELECT q.question_id, COUNT(a.answer_id) AS answerCount",
      "FROM questions q",
      "LEFT JOIN answers a ON a.question_id = q.question_id",
      "LEFT JOIN question_vectors v ON v.question_id = q.question_id",
      "GROUP BY q.question_id;",
      "```",
      "",
      "How do I count each answer only once?",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "Every extra join can repeat the answer rows, and `COUNT` counts every repeated row. Count the different ids instead:",
          "",
          "```sql",
          "COUNT(DISTINCT a.answer_id) AS answerCount",
          "```",
          "",
          "Keep the `LEFT JOIN`: with it, a question that has no answers still appears, with a count of 0.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 2,
    tag: "MySQL",
    title: "What does ON DELETE CASCADE do on a foreign key?",
    content: [
      "When I delete a question that already has answers, MySQL refuses with a foreign key error.",
      "",
      "```sql",
      "FOREIGN KEY (question_id) REFERENCES questions(question_id)",
      "```",
      "",
      "I saw `ON DELETE CASCADE` in other projects. What does it do, and is it safe to use here?",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "It tells MySQL: when the parent row is deleted, delete the child rows that point to it too.",
          "",
          "```sql",
          "FOREIGN KEY (question_id) REFERENCES questions(question_id)",
          "  ON DELETE CASCADE",
          "```",
          "",
          "With this rule, deleting a question also removes its answers in the same statement, so no answer is left pointing at a question that does not exist.",
        ].join("\n"),
      },
      {
        author: 1,
        content: [
          "It is safe when the child has no meaning without the parent, like an answer without its question. Be careful on tables where the child should survive.",
          "",
          "Because one `DELETE` can now remove many rows, ask the user to confirm and tell them how many answers will be deleted with the question.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 0,
    tag: "CSS",
    title: "How do I center a div vertically and horizontally with flexbox?",
    content: [
      "I want my login card in the exact middle of the page. It is centered from left to right, but it stays at the top.",
      "",
      "```css",
      ".page {",
      "  display: flex;",
      "  justify-content: center;",
      "}",
      "```",
      "",
      "What is missing for the vertical direction?",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "Two things. `align-items` centers on the other axis, and the container needs a height, because without one it is only as tall as the card.",
          "",
          "```css",
          ".page {",
          "  display: flex;",
          "  justify-content: center;",
          "  align-items: center;",
          "  min-height: 100vh;",
          "}",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 1,
    tag: "CSS",
    title: "CSS Modules class name is undefined in my component",
    content: [
      "I renamed `Navbar.css` to `Navbar.module.css`. Now my styles are gone, and in the browser the element has the class `undefined`.",
      "",
      "```jsx",
      "import styles from './Navbar.module.css';",
      "",
      "<header className={styles['nav-bar']}>",
      "```",
      "",
      "The class in my CSS file is `.navBar`. Do the two names have to match exactly?",
    ].join("\n"),
    answers: [],
  },
  {
    author: 2,
    tag: "AI",
    title: "What is cosine similarity and why is it used for semantic search?",
    content: [
      "I am building a search that finds questions by meaning. Every question title is stored as an embedding, which is a long list of numbers.",
      "",
      "```js",
      "const score = cosine(queryVector, questionVector);",
      "```",
      "",
      "Tutorials compare the vectors with cosine similarity. What does the score mean, and how is it calculated?",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "It measures the **angle** between two vectors, not their length. A score near 1 means they point the same way (similar meaning), and a score near 0 means they are unrelated.",
          "",
          "```js",
          "function cosine(a, b) {",
          "  let dot = 0;",
          "  let lengthA = 0;",
          "  let lengthB = 0;",
          "",
          "  for (let i = 0; i < a.length; i++) {",
          "    dot += a[i] * b[i];",
          "    lengthA += a[i] * a[i];",
          "    lengthB += b[i] * b[i];",
          "  }",
          "",
          "  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));",
          "}",
          "```",
        ].join("\n"),
      },
      {
        author: 0,
        content: [
          "In practice you also choose a **threshold**. Results under it are dropped, so a search with no good match returns nothing instead of five weak matches.",
          "",
          "A strict value such as 0.75 suits duplicate detection. A lower value such as 0.35 suits a related questions list, where a loose match is still useful.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 0,
    tag: "AI",
    title: "Embedding request fails when the model name is missing from .env",
    content: [
      "My embedding call works on my computer, but on a fresh clone every question is saved with the vector status **failed**.",
      "",
      "```js",
      "const result = await ai.models.embedContent({",
      "  model: process.env.GEMINI_EMBEDDING_MODEL,",
      "  contents: sourceText,",
      "});",
      "```",
      "",
      "The new `.env` file does not have `GEMINI_EMBEDDING_MODEL`. How do I give the model a default value so the variable becomes optional?",
    ].join("\n"),
    answers: [],
  },
  // ---------------------------------------------------------------------------
  // FAQ threads. The AI chat assistant answers ONLY from forum threads and the
  // user's own PDFs, so these threads are its grounded source for questions
  // about the forum itself. Two of the chat's suggestion buttons ("How does JWT
  // login work?" and "What is RAG?") are answered from here.
  // ---------------------------------------------------------------------------
  {
    author: 1,
    tag: "FAQ",
    title: "What is Evangadi Forum and what can I do here?",
    content: [
      "I just joined. What is this forum for, and what are the main features I should try first?",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "Evangadi Forum is a Q&A space for Evangadi learners. You can:",
          "",
          "- **Ask and answer questions.** Before posting, the AI Draft Coach gives tips to make your question clearer. When you answer, AI Answer Fit tells you if your answer really addresses the question.",
          "- **Search in two ways.** Keyword search finds the exact words. Semantic search finds questions with the same meaning, even when the words are different.",
          "- **Use the Knowledge Base.** Upload your own PDFs (private to you), search inside them, and ask questions answered only from that PDF, with citations.",
          "- **Ask the AI chat assistant.** It answers only from forum threads and your own PDFs, and it shows the sources it used.",
          "- **Join Discussion Rooms.** Six fixed rooms (General Discussion, Frontend, Backend, Databases & SQL, Projects & Code Review, Career & Interviews). Join a room to read and send messages; new messages appear every 15 seconds.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 2,
    tag: "FAQ",
    title: "How does JWT login work in this app?",
    content: [
      "What happens between typing my password on the sign-in page and being able to open protected pages like the dashboard?",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "Step by step:",
          "",
          "1. **Register** saves your password as a **bcrypt hash**, never as plain text.",
          "2. **Login** finds your email and checks the password with `bcrypt.compare`. If it matches, the server signs a **JWT** that contains your id and name, with an expiry time.",
          "3. The frontend saves the token in `localStorage`. The axios request interceptor then adds `Authorization: Bearer <token>` to every request.",
          "4. On the server, the `authenticateUser` middleware verifies the signature and the expiry, and puts your id in `req.user`. The id always comes from the token, never from the request body.",
          "5. When the token expires, the server answers **401**, the frontend clears the token, and you are sent back to the sign-in page.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 0,
    tag: "FAQ",
    title: "What is RAG and how does the Knowledge Base use it?",
    content: [
      "The Knowledge Base says answers are built only from my PDF. What does RAG mean, and how does it work behind the scenes?",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "RAG means **Retrieval-Augmented Generation**: first *retrieve* the parts of your own data that match the question, then let the AI *generate* an answer from only those parts.",
          "",
          "In the Knowledge Base:",
          "",
          "1. **Upload**: the server reads the text of your PDF and cuts it into chunks of about 1000 characters that overlap a little, so no sentence is lost at a border.",
          "2. **Embed**: every chunk becomes a vector of 768 numbers that describes its meaning.",
          "3. **Retrieve**: your question becomes a vector too. Cosine similarity finds the closest chunks; only scores of at least 0.62 are kept, at most 5.",
          "4. **Generate**: Gemini answers using only those numbered chunks and cites them as [1], [2]. If nothing is close enough, it says so instead of guessing.",
          "",
          "Your PDFs are private: nobody else can search or read them.",
        ].join("\n"),
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Topic question for the chat suggestion "What is Node.js?".
  // ---------------------------------------------------------------------------
  {
    author: 2,
    tag: "Node",
    title: "What is Node.js and why do we use it for the backend?",
    content: [
      "I know JavaScript from the browser. Why can it also run our server, and what makes Node.js a good choice for an API like ours?",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "Node.js is a **JavaScript runtime**: it runs JavaScript outside the browser, on the V8 engine from Chrome. So the frontend and the backend use the same language.",
          "",
          "Why it fits an API:",
          "",
          "- **Non-blocking I/O.** While one request waits for MySQL or Gemini, Node keeps serving other requests. The event loop picks up each result when it is ready.",
          "- **npm.** Packages like Express, mysql2, bcrypt and jsonwebtoken are one install away.",
          "- **JSON everywhere.** The API sends and receives JSON, which is native to JavaScript.",
          "",
          "It is not ideal for heavy CPU work (like video processing) in the same process, because that blocks the event loop.",
        ].join("\n"),
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Semantic vs keyword demos. Each question is written WITHOUT the words of
  // its demo search (see the demo script), so keyword search finds nothing
  // and semantic search finds it by meaning.
  // ---------------------------------------------------------------------------
  {
    author: 0,
    tag: "React",
    title: "Form submit reloads the whole page in React",
    content: [
      "When I submit my login form, the whole page reloads and my state is lost. My handler looks like this:",
      "",
      "```jsx",
      "function handleSubmit() {",
      "  login(email, password);",
      "}",
      "",
      "<form onSubmit={handleSubmit}>...</form>",
      "```",
      "",
      "How do I stop the reload?",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "A form's default action is to send the data and load a new page. Call `preventDefault()` on the event first:",
          "",
          "```jsx",
          "function handleSubmit(event) {",
          "  event.preventDefault();",
          "  login(email, password);",
          "}",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 1,
    tag: "Node",
    title: "How can I keep secrets like the database password out of GitHub?",
    content: [
      "My `db.config.js` has the MySQL password and the Gemini key written in the code. A teammate said this must never be pushed. What is the right way?",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "Move every secret into a `.env` file and read it with `process.env`:",
          "",
          "```js",
          'import dotenv from "dotenv";',
          "dotenv.config();",
          "const password = process.env.DB_PASSWORD;",
          "```",
          "",
          "Then add `.env` to `.gitignore`, so git never sees it, and commit a `.env.example` with empty values so teammates know which variables to fill in. If a secret was already pushed, change it: deleting the line does not remove it from the history.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 2,
    tag: "React",
    title: "Array.map shows nothing on the screen in my component",
    content: [
      "My `questions` array has 10 items (I checked with `console.log`), but nothing appears:",
      "",
      "```jsx",
      "{questions.map((q) => {",
      "  <QuestionCard key={q.id} question={q} />;",
      "})}",
      "```",
    ].join("\n"),
    answers: [
      {
        author: 0,
        content: [
          "With curly braces, an arrow function needs an explicit `return`. Without it, `map` returns an array of `undefined`, and React draws nothing. Use parentheses instead:",
          "",
          "```jsx",
          "{questions.map((q) => (",
          "  <QuestionCard key={q.id} question={q} />",
          "))}",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    author: 0,
    tag: "MySQL",
    title: "MySQL says Too many connections after a while",
    content: [
      "My API works for a few minutes, then every query fails with `ER_CON_COUNT_ERROR: Too many connections`. I call `mysql.createConnection()` at the start of every route.",
    ].join("\n"),
    answers: [
      {
        author: 1,
        content: [
          "Every `createConnection()` opens a new connection, and they are never closed, so MySQL reaches its limit. Create **one pool** when the server starts and reuse it:",
          "",
          "```js",
          "const db = mysql.createPool({ connectionLimit: 10, ...config });",
          "const [rows] = await db.execute(sql, params);",
          "```",
          "",
          "The pool keeps a few connections ready and gives them back after each query.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 1,
    tag: "Node",
    title: "bcrypt compare always returns false",
    content: [
      "Registration works, but signing in with the same email and password always fails. I hash with `bcrypt.hash` when registering, and I check with `bcrypt.compare(password, user.password)`.",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "Check the column name: if the hash is saved in `password_hash`, then `user.password` is `undefined` and `compare` returns false. Use `bcrypt.compare(password, user.password_hash)`.",
          "",
          "Also make sure you do not hash the password twice (for example once in the controller and again in the service), and that the column is long enough: a bcrypt hash is 60 characters.",
        ].join("\n"),
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Partners for Related Questions: close in meaning to an existing question.
  // ---------------------------------------------------------------------------
  {
    author: 1,
    tag: "CSS",
    title: "How do I center content inside a card using CSS grid?",
    content: [
      "I have a card with an icon and a short text. I want both in the middle of the card, vertically and horizontally, but with CSS grid instead of flexbox.",
    ].join("\n"),
    answers: [
      {
        author: 2,
        content: [
          "`place-items` sets both directions at once:",
          "",
          "```css",
          ".card {",
          "  display: grid;",
          "  place-items: center;",
          "  min-height: 200px;",
          "}",
          "```",
          "",
          "Like with flexbox, the card needs a height, or there is no space to center in.",
        ].join("\n"),
      },
    ],
  },
  {
    author: 2,
    tag: "Node",
    title: "Express says Cannot GET /api/users even though the route exists",
    content: [
      'I wrote `router.get("/users", getUsers)` in `user.routes.js`, but the browser shows `Cannot GET /api/users`. The server starts without errors.',
    ].join("\n"),
    answers: [],
  },
];

async function seed() {
  if (await checkUserExists(users[0].email)) {
    console.log("Seed data already exists. Nothing was changed.");
    return;
  }

  const userIds = [];

  for (const user of users) {
    const created = await registerService({
      ...user,
      password: SEED_PASSWORD,
    });

    userIds.push(created.id);
  }

  const questionIds = [];
  let answerCount = 0;

  for (const item of questions) {
    const { question } = await createQuestionWithVectorService({
      userId: userIds[item.author],
      title: item.title,
      content: item.content,
    });

    questionIds.push(question.id);

    for (const answer of item.answers) {
      await createAnswerService({
        questionId: question.id,
        userId: userIds[answer.author],
        content: answer.content,
      });

      answerCount += 1;
    }
  }

  // The only SQL in this file, and it only reads: how many of the new
  // questions got their embedding from Gemini.
  const placeholders = questionIds.map(() => "?").join(",");
  const vectorRows = await safeExecute(
    `SELECT status, COUNT(*) AS total FROM question_vectors WHERE question_id IN (${placeholders}) GROUP BY status`,
    questionIds,
  );

  console.log("");
  console.log("Seed finished.");
  console.log(`  Users:     ${userIds.length}`);
  console.log(`  Questions: ${questionIds.length}`);
  console.log(`  Answers:   ${answerCount}`);

  for (const row of vectorRows) {
    console.log(`  Vectors ${row.status}: ${row.total}`);
  }

  console.log("");
  console.log(`Log in with any of these emails, password ${SEED_PASSWORD}:`);

  for (const user of users) {
    console.log(`  ${user.email}`);
  }
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  // Close the connection pool, otherwise the script never exits.
  .finally(() => db.end());
