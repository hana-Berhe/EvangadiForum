# Evangadi Forum — Milestone 4

## Extra Features: AI Chat Assistant & Discussion Rooms

Milestone 4 adds two features on top of the forum:

- **AI chat assistant**: a chat window on every page that answers from the forum's threads and the user's own PDFs, and shows the sources it used.
- **Discussion Rooms**: six fixed rooms where learners join and talk. New messages appear every 15 seconds.

---

## AI Chat Assistant

The assistant answers **only from our own data**: every forum question with its answers, and the PDFs of the user who is asking (never another user's).

### How One Message Is Answered

```text
Greeting ("hi", "thanks")? → fixed reply, no AI call
   ↓
Message → vector (Gemini, RETRIEVAL_QUERY)
   ↓
Search forum questions AND this user's PDF chunks at the same time
   ↓
Keep scores ≥ 0.62, best first, at most 5 sources
   ↓
Nothing close? → keyword search in questions and answers
   ↓
Gemini answers only from the numbered sources, citing [1], [2]
   ↓
Only cited sources are returned; no citation → the answer is hidden
```

Two privacy locks: the vector search and the text loading both filter PDFs by `user_id`.

### Chat API

```http
POST /api/chat
```

- Protected route: **Yes**; 10 messages per minute per user (`429` after that)
- Body: `{ "message": "..." }`, 2–500 characters
- Reply: `{ kind, answer, grounded, sources, related }`

| `kind` | Meaning |
|---|---|
| `chat` | A greeting; fixed reply |
| `answer` | Answered from our data; `sources` lists what was cited |
| `related` | Not answered, but these threads are close |
| `notfound` | Nothing in our data; the window offers "Ask the community" |

Each source has `ref`, `type` (`question` or `document`), `title`, `url`, `score` (`null` for a keyword match) and, for PDFs, `page`.

### Chat Files

```text
backEnd/src/api/chat/
├── controller/chat.controller.js
├── middleware/chat.rate-limit.js
├── routes/chat.routes.js
├── service/chat.service.js
└── validations/chat.validation.js

frontEnd/src/components/ChatWidget/   # the floating chat window
frontEnd/src/api/chat.api.js
```

The Gemini prompt is `answerFromChatSourcesService` in `question/service/geminiTextCoach.service.js`. It tells Gemini that the sources are data, not instructions.

---

## Discussion Rooms

Six fixed rooms: General Discussion, Frontend Development, Backend Development, Databases & SQL, Projects & Code Review, Career & Interviews. Users cannot create rooms.

Flow: **Rooms page → Join → Open room → Read messages → Send**, with the messages polled every 15 seconds.

### Rooms API

Base path:

```text
/api/rooms
```

All routes are protected: **Yes**.

| Method | Path | What it does | Main statuses |
|---|---|---|---|
| GET | `/api/rooms` | All rooms, with member and message counts and whether you joined | 200 |
| GET | `/api/rooms/:roomId` | One room | 200, 400, 404 |
| POST | `/api/rooms/:roomId/members` | Join a room | 201 new, 200 already a member, 404 |
| GET | `/api/rooms/:roomId/messages` | Latest 50 messages, oldest first (members only) | 200, 403, 404 |
| POST | `/api/rooms/:roomId/messages` | Send a message, 1–2000 characters (members only) | 201, 400, 403, 404, 429 |

- `404` = the room does not exist; `403` = you are logged in but not a member.
- Joining relies on the database's `UNIQUE (room_id, user_id)` key, so a double join is impossible even in a race.
- Sending is limited to 30 messages per minute per user.

### Rooms Files

```text
backEnd/src/api/room/
├── controller/   room, membership, message
├── middleware/   room.access.js (requireRoomExists, requireMember)
├── routes/       room.routes.js
├── service/      room, membership, message
└── validations/  room.validation.js

backEnd/src/middleware/user-rate-limit.js   # shared by the chat and the rooms

frontEnd/src/pages/Rooms/                   # the list of rooms
frontEnd/src/pages/RoomDetail/              # one room: join card, messages, composer
frontEnd/src/api/rooms.api.js
```

### Database

Three tables in `backEnd/schema/schema.sql` (section 6): `rooms`, `room_members` and `room_messages`, plus the six fixed rooms.

---

## Settings (`backEnd/.env`)

All optional; the defaults are in the code:

| Setting | Default |
|---|---|
| `CHAT_RATE_LIMIT_PER_MIN` | 10 |
| `CHAT_QUESTION_THRESHOLD` | 0.62 |
| `CHAT_DOCUMENT_THRESHOLD` | 0.62 |
| `CHAT_MAX_SOURCES` | 5 |
| `ROOM_MESSAGE_LIMIT_PER_MIN` | 30 |

---

## Milestone 4 Checklist

- [x] Chat: parallel search over questions and the user's PDFs
- [x] Chat: keyword fallback, citation check, rate limit
- [x] Chat window on every page
- [x] Rooms: list, open, join
- [x] Rooms: read and send messages (members only)
- [x] Rooms: 15-second polling
- [x] Rooms tables in `schema.sql`
- [x] Merge completed work into `main`

---

## Milestone Goal

By the end of Milestone 4, users can:

1. Ask the AI chat assistant and get answers that show where they came from.
2. Get an honest "I could not find this" instead of an invented answer.
3. Join a Discussion Room and talk with other learners.
4. See new messages without refreshing the page.
