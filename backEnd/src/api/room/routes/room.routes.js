import { listRoomsController } from "../controller/room.controller.js";
import { authenticateUser } from "../../../middleware/authentication.js";
roomRouter.use(authenticateUser);
/*
 * @route GET /api/rooms
 * @desc List every room, newest activity first
 * @access Protected
 */
roomRouter.get("/", listRoomsController);