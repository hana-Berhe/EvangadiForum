import { StatusCodes } from "http-status-codes";
import { matchedData } from "express-validator";
import { listMessagesService } from "../service/message.service.js";
import { postMessageService } from "../service/message.service.js";

/**
 * Reads one page of messages. For members, and for admins.
 * roomStatus is sent too, so a page that is polling learns that the room was
 * closed without asking again.
 */
export const listMessagesController = async (req, res, next) => {
  try {
    // matchedData gives the validated and converted query values
    // (before / after as numbers). In Express 5 req.query is read-only.
    const { before, after } = matchedData(req, { locations: ["query"] });

    const page = await listMessagesService({
      roomId: req.room.id,
      before,
      after,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Room messages",
      data: { ...page, roomStatus: req.room.status },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Posts one message. Only for members, only in an open room.
 */
export const postMessageController = async (req, res, next) => {
  try {
    const message = await postMessageService({
      roomId: req.room.id,
      userId: req.user.id,
      content: req.body.content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Message posted",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
