import { StatusCodes } from "http-status-codes";
import {
  createAnswerService,
  getAnswersService,
} from "../service/answer.service.js";

/**
 * Handles creating a new answer.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 * @returns {Promise<void>}
 */
const createAnswerController = async (req, res, next) => {
  try {
    const { questionId, content } = req.body;
    const answer = await createAnswerService({
      questionId,
      content,
      userId: req.user.id,
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Answer posted successfully.",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles listing answers by question with sorting. Max 100 records.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 * @returns {Promise<void>}
 */
const getAnswersController = async (req, res, next) => {
  try {
    const result = await getAnswersService({
      questionId: Number(req.query.questionId),
      sortBy: req.query.sortBy || "newest",
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answers fetched successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
export { createAnswerController, getAnswersController };
