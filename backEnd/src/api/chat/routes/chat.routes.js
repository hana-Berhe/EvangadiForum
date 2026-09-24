import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { chatRateLimit } from "../middleware/chat.rate-limit.js";
import { chatMessageValidation } from "../validations/chat.validation.js";
import { chatController } from "../controller/chat.controller.js";

const chatRouter = express.Router();

// The chat searches the user's own PDFs, so nothing here is public.
chatRouter.use(authenticateUser);

/**
 * @route POST /api/chat
 * @desc Answer a message using only forum threads and the user's own PDFs
 * @access Protected
 */
chatRouter.post("/", chatRateLimit, chatMessageValidation, chatController);

export { chatRouter };
