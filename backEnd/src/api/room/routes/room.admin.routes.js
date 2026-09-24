import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { requireAdmin } from "../../../middleware/admin.js";
import { roomIdParamValidation } from "../validations/room.validation.js";
import { adminRoomsQueryValidation } from "../validations/room.validation.js";
import { loadRoom } from "../middleware/room.access.js";
import { adminListRoomsController } from "../controller/room.admin.controller.js";
import { closeRoomController } from "../controller/room.admin.controller.js";

const roomAdminRouter = express.Router();

// Both checks run for EVERY route below, before anything else. A member gets
// 403 even for a room that does not exist, so nothing leaks.
// The role comes from MySQL on every request (middleware/admin.js).
roomAdminRouter.use(authenticateUser);
roomAdminRouter.use(requireAdmin);

/**
 * @route GET /api/admin/rooms
 * @desc Every room. ?status=open or ?status=closed filters the list
 * @access Admin
 */
roomAdminRouter.get("/", adminRoomsQueryValidation, adminListRoomsController);
