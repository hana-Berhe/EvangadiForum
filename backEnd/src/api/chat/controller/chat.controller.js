import { StatusCodes } from "http-status-codes";
import { chatService } from "../service/chat.service.js";

/**
 * Handles one chat message and sends back the assistant's reply.
 */
export const chatController = async (req, res, next) => {
  try {
    const data = await chatService({
      userId: req.user.id,
      firstName: req.user.firstName,
      message: req.body.message,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Assistant reply",
      data,
    });
  } catch (error) {
    next(error);
  }
};
