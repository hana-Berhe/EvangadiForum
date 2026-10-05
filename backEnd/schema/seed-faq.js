// Adds the "How do I use the forum?" FAQ threads, and nothing else.
//
// Run it from the backEnd folder:   npm run seed:faq
//
// - It is independent of seed.js: it works on an empty database AND on one
//   that already has data (for example the deployed one), so the FAQ threads
//   get their own creation date.
// - The chat assistant answers only from forum threads and the user's own
//   PDFs, so these threads are where it finds answers about using the forum.
// - It uses the same services as the API, so every thread gets a question
//   hash and a Gemini embedding, exactly like a question posted in the app.
// - It only adds rows. A thread whose title already exists is skipped, so it
//   is safe to run again after adding a new FAQ below.
//
// db.config.js is imported first because it loads .env, and the services below
// read JWT_SECRET and GEMINI_API_KEY as soon as they are imported.
import crypto from "node:crypto";
import { db, safeExecute } from "./db.config.js";
import { registerService } from "../src/api/auth/service/auth.service.js";
import { createQuestionWithVectorService } from "../src/api/question/service/question.service.js";
import { createAnswerService } from "../src/api/answer/service/answer.service.js";

// Two team accounts: one asks, one answers, because nobody can answer their
// own question. They are created only if they do not exist yet, with a random
// password, because nobody needs to log in with them.
const TEAM = 0;
const MENTOR = 1;
const accounts = [
  { firstName: "Evangadi", lastName: "Team", email: "team.faq@example.com" },
  {
    firstName: "Evangadi",
    lastName: "Mentor",
    email: "mentor.faq@example.com",
  },
];

const faqs = [
  {
    author: TEAM,
    title: "How do I ask a good question on the forum?",
    content: [
      "I want to post my first question. Where do I do it, and how can I make sure people understand it and answer it?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "1. Click **New Question** in the sidebar.",
          "2. Write a clear **title** (5 to 255 characters) that says the problem in one sentence, for example *\"Express returns 404 for /search\"* instead of *\"Help please\"*.",
          "3. In the **details** (at least 10 characters), explain what you tried, what you expected, and what happened. Paste the error message and the smallest piece of code that shows the problem.",
          "4. Click **AI suggestions** before posting. The Draft Coach reads your draft and gives tips to make it clearer.",
          "",
          "Tip: search first. Semantic search may find a thread that already answers your question.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "How do I use the Knowledge Base, and why did my PDF upload fail?",
    content: [
      "I want to ask questions about my course notes. How do I upload a PDF, and what can make the upload fail?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "Open **Knowledge Base** in the sidebar, upload a PDF, and wait until it shows **Ready**. Then select it to read it, search inside it, or ask AI about it. Answers come only from that PDF, with page numbers.",
          "",
          "An upload is refused when:",
          "",
          "- the file is **not a PDF**,",
          "- it is **larger than 10 MB**,",
          "- it has **no readable text** (for example a scanned image without text),",
          "- you already have **20 PDFs**. Delete one you no longer need first.",
          "",
          "Your PDFs are private. Nobody else can see, search or ask them.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "How do I join a Discussion Room and send messages?",
    content: [
      "I opened a room but I can't write anything. How do the Discussion Rooms work?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "1. Click **Rooms** in the sidebar. There are six rooms: General Discussion, Frontend Development, Backend Development, Databases & SQL, Projects & Code Review, and Career & Interviews.",
          "2. Open a room and click **Join room**. Only members can read and send messages, so you can't write until you join.",
          "3. Type your message (up to 2000 characters) and send it. New messages appear every 15 seconds.",
          "",
          "If you send more than 30 messages in one minute, you have to wait a little before sending again.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "How do I edit or delete my question or answer?",
    content: [
      "I made a mistake in a question I posted. Can I change it, or remove it?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "Yes. Open your question (all of them are listed under **Your Topics** in the sidebar). The **edit** and **delete** buttons appear on your own question and on your own answers.",
          "",
          "Only the author can edit or delete a post. You won't see these buttons on other people's posts.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "What is the difference between keyword search and semantic search?",
    content: [
      "The search on the home page has two modes. Which one should I use?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "- **Keyword search** finds questions that contain the exact words you typed. Use it when you know a specific word, like an error name.",
          "- **Semantic search** finds questions with the same **meaning**, even when they use different words. *\"login keeps failing\"* can find *\"How do I verify a JWT in Express middleware?\"*. It needs at least 5 characters.",
          "",
          "If keyword search finds nothing, try semantic search with a short description of your problem.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "Why does the chat assistant say it could not find an answer?",
    content: [
      "I asked the chat assistant a question and it said it could not find it. Is it broken?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "No. The assistant answers **only** from forum threads and your own PDFs, never from the open internet, so it doesn't make answers up.",
          "",
          "When nothing in the forum or your PDFs is close enough to your question, it tells you honestly. It may show related threads, and the **Ask the community** button opens the question form so a person can answer you.",
          "",
          "Tips: ask one clear question at a time, and upload your notes to the Knowledge Base if you want it to answer from them. You can send up to 10 messages per minute.",
        ].join("\n"),
      },
    ],
  },
  {
    author: TEAM,
    title: "How do I change my profile picture or name?",
    content: [
      "Where can I update my name, email or profile photo?",
    ].join("\n"),
    answers: [
      {
        author: MENTOR,
        content: [
          "Click your avatar in the navbar to open your **Profile**. In **Edit profile** you can change your first name, last name and email, and choose a **Profile picture** (JPG, PNG or WebP, up to 2 MB). Then click **Save Changes**.",
        ].join("\n"),
      },
    ],
  },
];

// The user id for an account: the existing one, or a newly created one.
async function getAccountId(account) {
  const rows = await safeExecute(
    "SELECT user_id FROM users WHERE email = ? LIMIT 1",
    [account.email.toLowerCase()],
  );
  if (rows.length > 0) return rows[0].user_id;

  const created = await registerService({
    ...account,
    password: crypto.randomBytes(24).toString("hex"),
  });
  console.log(`  Created account ${account.email}`);
  return created.id;
}

async function titleExists(title) {
  const rows = await safeExecute(
    "SELECT question_id FROM questions WHERE title = ? LIMIT 1",
    [title],
  );
  return rows.length > 0;
}

async function seedFaq() {
  const accountIds = [];
  for (const account of accounts) {
    accountIds.push(await getAccountId(account));
  }

  let added = 0;
  let skipped = 0;

  for (const faq of faqs) {
    if (await titleExists(faq.title)) {
      console.log(`  Skipped (already there): ${faq.title}`);
      skipped += 1;
      continue;
    }

    const { question } = await createQuestionWithVectorService({
      userId: accountIds[faq.author],
      title: faq.title,
      content: faq.content,
    });

    for (const answer of faq.answers) {
      await createAnswerService({
        questionId: question.id,
        userId: accountIds[answer.author],
        content: answer.content,
      });
    }

    console.log(`  Added: ${faq.title}`);
    added += 1;
  }

  console.log("");
  console.log(`FAQ seed finished. Added: ${added}, skipped: ${skipped}.`);
}

seedFaq()
  .catch((error) => {
    console.error("FAQ seed failed:", error);
    process.exitCode = 1;
  })
  // Close the connection pool, otherwise the script never exits.
  .finally(() => db.end());
