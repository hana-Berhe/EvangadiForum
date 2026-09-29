import { StatusCodes } from "http-status-codes";
import { joinRoomService } from "../service/membership.service.js";

/**
 * Joins the room. 201 for a new membership, 200 when already a member.
 */
export const joinRoomController = async (req, res, next) => {
  try {
    const { joined, room } = await joinRoomService({
      roomId: req.params.roomId,
      userId: req.user.id,
    });

    res.status(joined ? StatusCodes.CREATED : StatusCodes.OK).json({
      success: true,
      message: joined ? "You joined the room" : "You are already a member",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
