import { StatusCodes } from "http-status-codes";
import { getTagsService } from "../service/tag.service.js";

const getTagsController = async (req, res, next) => {
  try {
    const data = await getTagsService();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Tags fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export { getTagsController };
