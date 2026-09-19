import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";

// Imports for your task: add them here, one per line.
// On a merge conflict in the imports, keep BOTH lines.

const ragRouter = express.Router();

// Every document belongs to one user, so nothing here is public.
ragRouter.use(authenticateUser);

// Register each route between its own markers. Keep this order.

// ---- T-22 (Yabets): POST /documents ----
// ---- end T-22 ----

// ---- T-24a (Natinael): GET /documents ----
// ---- end T-24a ----

// ---- T-23a (Abel): GET /documents/:documentId/search ----
// ---- end T-23a ----

// ---- T-24c (Wonde): GET /documents/:documentId/file ----
// ---- end T-24c ----

// ---- T-23b (Desalew): POST /documents/:documentId/query ----
// ---- end T-23b ----

// ---- T-24b (Haymanot Y.): GET /documents/:documentId ----
// ---- end T-24b ----

// ---- T-24d (Haymanot B.): DELETE /documents/:documentId ----
// ---- end T-24d ----

export { ragRouter };
