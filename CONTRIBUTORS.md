# Contributors

Evangadi Forum was built by a team of eight. This page lists who built what, milestone by milestone.

`FE` = frontend, `BE` = backend.

## The Team

Hana · Yabets · Abel · Wonde · Desalew · Natinael · Haymanot Bekalu · Haymanot Yitewal

---

## Milestone 1 — Authentication & Project Foundation

| Person | Task |
|---|---|
| Hana | T-01 Project scaffolding (FE + BE) |
| Yabets | T-06 Axios instance and auth service (FE) |
| Abel | T-08 AuthContext (FE) |
| Wonde | T-05 Login (BE) |
| Desalew | T-04 Register (BE) |
| Natinael | T-07 Auth page UI (FE) |
| Haymanot Bekalu | T-00 Landing page (FE) |
| Haymanot Yitewal | T-08 ProtectedRoute (FE), testing and integration |

---

## Milestone 2 — Questions & Answers

| Person | Backend | Frontend |
|---|---|---|
| Hana | T-18 AI Answer Fit | T-14 Dashboard |
| Yabets | T-11a Semantic search | T-16 Question detail |
| Abel | T-09 Create question + embedding | T-13a Layout shell (Layout, Sidebar) |
| Wonde | T-10b Get single question | T-21 My Questions page |
| Desalew | T-11b Similar questions | T-20 Answer form + AI Fit panel |
| Natinael | T-10a List questions | Landing page |
| Haymanot Bekalu | T-17 AI Draft Coach | T-15 Post Question page |
| Haymanot Yitewal | T-12 Create answer | T-13b Navbar and Footer |

---

## Milestone 3 — Knowledge Base (RAG)

| Person | Task |
|---|---|
| Hana | T-24/T-25 RAG Documents page (FE, with Desalew) |
| Yabets | T-22 Upload and process a PDF (BE) |
| Abel | T-23a Search inside a document (BE) |
| Wonde | T-24c Stream the PDF file (BE) |
| Desalew | T-23b Ask the PDF (BE); RAG Documents page (FE, with Hana) |
| Natinael | T-24a List my documents (BE) |
| Haymanot Bekalu | T-24d Delete a document (BE) |
| Haymanot Yitewal | T-24b Document details + the shared ownership check (BE) |

---

## Milestone 4 — Extra Features

### AI Chat Assistant

| Person | Backend | Frontend |
|---|---|---|
| Hana | The chat service: parallel search, privacy lock, citation check; the Gemini answer prompt; the chat rate limit | — |
| Abel | Route, controller and validation; keyword fallback; building the sources | `chat.api.js`; sending messages in the chat window |
| Haymanot Bekalu | — | The chat window: messages, citation badges, source chips |

### Discussion Rooms

One endpoint per person:

| Person | Endpoint (BE) | Frontend |
|---|---|---|
| Hana | `POST /api/rooms/:roomId/messages`, and the shared rate limiter | The room page (views, 15-second polling), message bubbles |
| Abel | `POST /api/rooms/:roomId/members` (join) | Join card and join buttons |
| Wonde | `GET /api/rooms/:roomId/messages`, and the access checks (404 / 403) | Rooms routes and the sidebar link |
| Haymanot Bekalu | `GET /api/rooms` | The rooms list page, the About sidebar |
| Haymanot Yitewal | `GET /api/rooms/:roomId`, the rooms tables, room id validation | `rooms.api.js` |

---

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how we work together: branches, commits and pull requests.
