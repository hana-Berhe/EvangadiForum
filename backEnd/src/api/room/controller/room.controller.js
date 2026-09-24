import { StatusCodes } from "http-status-codes";
import { listRoomsService } from "../service/room.service.js";
import { createRoomService } from "../service/room.service.js";

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
// [Rooms B - Haymanot Y.] Create a room.
/**
 * Creates a room. The creator becomes its first member.
 * Only name and description are read from the body. Anything else
 * (for example "role" or "created_by") is ignored.
 */
export const createRoomController = async (req, res, next) => {
  try {
    const room = await createRoomService({
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Room created",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
