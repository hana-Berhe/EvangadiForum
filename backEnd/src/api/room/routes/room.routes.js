// ROOMS FEATURE OWNERSHIP: A = Browse & view rooms (Haymanot B.), B = Create room (Haymanot Y.), C = Membership & access (Abel), D = Messages (Hana). Admin routes (E) are in room.admin.routes.js. Search "[Rooms X" (your letter) to find your parts.
import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { createUserRateLimit } from "../../../middleware/user-rate-limit.js";
import { roomIdParamValidation } from "../validations/room.validation.js";
import { listRoomsController } from "../controller/room.controller.js";
import { getRoomController } from "../controller/room.controller.js";
import { listRoomsController } from "../controller/room.controller.js";
import { authenticateUser } from "../../../middleware/authentication.js";
import { roomIdParamValidation } from "../validations/room.validation.js";

const roomRouter = express.Router();
roomRouter.use(authenticateUser);
/*
 * @route GET /api/rooms
 * @desc List every room, newest activity first
 * @access Protected
 */


roomRouter.get("/", listRoomsController);

/**
 * @route GET /api/rooms/:roomId
 * @desc Get one room
 * @access Protected
 */
roomRouter.get("/:roomId", roomIdParamValidation, getRoomController);

export { roomRouter };


// Rooms cannot be deleted, so one user must not create hundreds of them.
// [Rooms B - Haymanot Y.] Rate limit for creating rooms.
const createRoomRateLimit = createUserRateLimit({
  max: Number(process.env.ROOM_CREATE_LIMIT_PER_MIN) || 5,
  what: "new rooms",
});

