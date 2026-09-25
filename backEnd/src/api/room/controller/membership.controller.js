import { StatusCodes } from "http-status-codes";
import { joinRoomService } from "../service/membership.service.js";
import { leaveRoomService } from "../service/membership.service.js";
import { listMembersService } from "../service/membership.service.js";

/**
 * Joins the room. 201 for a new membership, 200 when already a member.
 */
export const joinRoomController = async (req, res, next) => {
  try {
    const { joined, room } = await joinRoomService({
      roomId: req.room.id,
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

/**
 * Leaves the room.
 */
export const leaveRoomController = async (req, res, next) => {
  try {
    const { left, room } = await leaveRoomService({
      roomId: req.room.id,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: left ? "You left the room" : "You were not a member",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lists the members. Only for members, and for admins.
 */
export const listMembersController = async (req, res, next) => {
  try {
    const members = await listMembersService(req.room.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Room members",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};
