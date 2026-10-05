import express from "express";
import { getTagsController } from "../controller/tag.controller.js";
import { authenticateUser } from "../../../middleware/authentication.js";

const tagRouter = express.Router();

tagRouter.get("/", authenticateUser, getTagsController);

export { tagRouter };
