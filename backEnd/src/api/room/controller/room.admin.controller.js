import { StatusCodes } from "http-status-codes";
import { matchedData } from "express-validator";
import { listRoomsService } from "../service/room.service.js";
import { closeRoomService } from "../service/room.service.js";

/**
 * Every room for the admin dashboard, with an optional status filter.
 */
export const adminListRoomsController = async (req, res, next) => {
  try {
    const { status } = matchedData(req, { locations: ["query"] });
    const rooms = await listRoomsService(req.user.id, { status });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Rooms",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};
