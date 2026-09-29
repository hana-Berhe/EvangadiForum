// Who may do what inside ONE room.
//
// Order in a route:
//   authenticateUser -> roomIdParamValidation -> requireRoomExists -> requireMember

import { safeExecute } from "../../../../schema/db.config.js";
import { ForbiddenError } from "../../../utility/errors/errors.js";
import { NotFoundError } from "../../../utility/errors/errors.js";

/**
 * Lets the request pass only if the room of :roomId exists.
 * Otherwise answers 404.
 */
const requireRoomExists = async (req, res, next) => {
  try {
    const rows = await safeExecute(
      "SELECT room_id FROM rooms WHERE room_id = ? LIMIT 1",
      [req.params.roomId],
    );
    if (rows.length === 0) {
      throw new NotFoundError("Room not found");
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Lets only members of the room pass. Everyone else gets 403.
 * 403 and not 401: the user IS logged in, they just have not joined.
 * (The front end logs the user out on any 401.)
 */
const requireMember = async (req, res, next) => {
  try {
    const rows = await safeExecute(
      "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? LIMIT 1",
      [req.params.roomId, req.user.id],
    );
    if (rows.length === 0) {
      throw new ForbiddenError("Join this room first.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { requireRoomExists, requireMember };
