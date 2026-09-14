import { StatusCodes } from "http-status-codes";
import { createQuestionWithVectorService,searchQuestionsSemanticService} from "../service/question.service.js";
import {generateQuestionDraftCoachService,} from "../service/geminiTextCoach.service.js";// syntax error solved here
/**
 * Handles creating a new question.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 * @returns {Promise<void>}
 */
const createQuestionController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const result = await createQuestionWithVectorService({
      userId: req.user.id, // author id (authenticated user)
      title,
      content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question posted successfully.",
      data: result.question,
    });
  } catch (error) {
    next(error);
  }
};// syntax error solved here
/**
 * Handles AI coaching for a question draft (title + body).
 */




const generateQuestionDraftCoachController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const data = await generateQuestionDraftCoachService({ title, content });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Draft suggestions generated.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createQuestionController,
  generateQuestionDraftCoachController
};
export { generateQuestionDraftCoachController };
