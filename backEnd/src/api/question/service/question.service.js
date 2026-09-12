import crypto from "crypto";
import { safeExecute } from "../../../../schema/db.config.js";


const generateQuestionHash = () => crypto.randomBytes(8).toString("hex");
