import express from "express";
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