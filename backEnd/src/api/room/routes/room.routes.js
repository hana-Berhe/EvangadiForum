import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { createUserRateLimit } from "../../../middleware/user-rate-limit.js";
import { roomIdParamValidation } from "../validations/room.validation.js";
import { postMessageValidation } from "../validations/room.validation.js";
import { requireRoomExists } from "../middleware/room.access.js";
import { requireMember } from "../middleware/room.access.js";
import { listRoomsController } from "../controller/room.controller.js";
import { getRoomController } from "../controller/room.controller.js";
import { joinRoomController } from "../controller/membership.controller.js";
import { listMessagesController } from "../controller/message.controller.js";
import { postMessageController } from "../controller/message.controller.js";

const roomRouter = express.Router();

// Every room route needs a logged-in user.
roomRouter.use(authenticateUser);
//how many routes are there for rooms? 5 routes
//1. GET /api/rooms - List every room, newest activity first
//2. GET /api/rooms/:roomId - Get one room
//3. POST /api/rooms/:roomId/members - Join the room (201). Already a member: 200
//4. GET /api/rooms/:roomId/messages - The latest 50 messages
//5. POST /api/rooms/:roomId/messages - Post one message (1 to 2000 characters)

// One user must not flood a room.
const postMessageRateLimit = createUserRateLimit({
  max: Number(process.env.ROOM_MESSAGE_LIMIT_PER_MIN) || 30,
  what: "messages",
});

/**
 * @route GET /api/rooms
 * @desc List every room, newest activity first
 * @access Protected
 * SELECT ALL ROOMS BY USER ID, ORDER BY LAST ACTIVITY DESCENDING, THEN ROOM ID DESCENDING
 */
roomRouter.get("/", listRoomsController);

/**
 * @route GET /api/rooms/:roomId
 * @desc Get one room
 * @access Protected
 */
roomRouter.get("/:roomId", roomIdParamValidation, getRoomController);

/**
 * @route POST /api/rooms/:roomId/members
 * @desc Join the room (201). Already a member: 200
 * @access Protected
 */
roomRouter.post(
  "/:roomId/members",
  roomIdParamValidation,
  requireRoomExists,
  joinRoomController,
);

/**
 * @route GET /api/rooms/:roomId/messages
 * @desc The latest 50 messages
 * @access Protected. Members only (403 otherwise)
 */
roomRouter.get(
  "/:roomId/messages",
  roomIdParamValidation,
  requireRoomExists,
  requireMember,
  listMessagesController,
);

/**
 * @route POST /api/rooms/:roomId/messages
 * @desc Post one message (1 to 2000 characters)
 * @access Protected. Members only (403 otherwise)
 */
roomRouter.post(
  "/:roomId/messages",
  postMessageRateLimit,
  postMessageValidation,
  requireRoomExists,
  requireMember,
  postMessageController,
);

export { roomRouter };
