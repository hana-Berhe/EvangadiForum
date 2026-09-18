import { StatusCodes } from "http-status-codes";
import {
  createAnswerService,
  getAnswersService,
  updateAnswerService,
  deleteAnswerService,
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

/**
 * Handles updating an answer. Only its author can update it.
 */
const updateAnswerController = async (req, res, next) => {
  try {
    const answer = await updateAnswerService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
      content: req.body.content,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answer updated successfully.",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles deleting an answer. Only its author can delete it.
 */
const deleteAnswerController = async (req, res, next) => {
  try {
    await deleteAnswerService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answer deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createAnswerController,
  getAnswersController,
  updateAnswerController,
  deleteAnswerController,
};
