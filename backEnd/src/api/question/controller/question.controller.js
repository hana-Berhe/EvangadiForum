import { StatusCodes } from "http-status-codes";
import {
  generateQuestionDraftCoachService,

} from "../service/geminiTextCoach.service.js";
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
export { generateQuestionDraftCoachController };