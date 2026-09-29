import { StatusCodes } from "http-status-codes";
import { listMessagesService } from "../service/message.service.js";
import { postMessageService } from "../service/message.service.js";

/**
 * Returns the latest 50 messages. Members only.
 */
export const listMessagesController = async (req, res, next) => {
  try {
    const messages = await listMessagesService(req.params.roomId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Room messages",
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Posts one message. Members only.
 */
export const postMessageController = async (req, res, next) => {
  try {
    const message = await postMessageService({
      roomId: req.params.roomId,
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
