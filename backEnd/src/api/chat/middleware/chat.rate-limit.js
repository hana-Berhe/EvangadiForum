// Per-user rate limit for the chat. Every chat message can cost Gemini calls,
// so one user must not be able to spend the whole team quota.
// The counting itself lives in middleware/user-rate-limit.js, which the
// discussion rooms use too.
// Use it AFTER authenticateUser, because it needs req.user.id.

import { createUserRateLimit } from "../../../middleware/user-rate-limit.js";

export const chatRateLimit = createUserRateLimit({
  max: Number(process.env.CHAT_RATE_LIMIT_PER_MIN) || 10,
  what: "messages",
});
