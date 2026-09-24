import express from "express";
import { listRoomsController } from "../controller/room.controller.js";
import { authenticateUser } from "../../../middleware/authentication.js";

const roomRouter = express.Router();
roomRouter.use(authenticateUser);
/*
 * @route GET /api/rooms
 * @desc List every room, newest activity first
 * @access Protected
 */


roomRouter.get("/", listRoomsController);

export { roomRouter };