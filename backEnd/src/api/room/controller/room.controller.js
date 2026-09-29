import { StatusCodes } from "http-status-codes";
import { listRoomsService } from "../service/room.service.js";
import { getRoomService } from "../service/room.service.js";

/**
 * Lists every room, newest activity first.
 */
export const listRoomsController = async (req, res, next) => {
  try {
    const rooms = await listRoomsService(req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Rooms",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one room.
 */
export const getRoomController = async (req, res, next) => {
  try {
    const room = await getRoomService({
      roomId: req.params.roomId,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Room",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
