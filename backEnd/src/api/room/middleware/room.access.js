// Who may do what inside ONE room. Every route with :roomId uses these, so
// the access rules live in one place.
//
// Order in a route:
//   authenticateUser -> roomIdParamValidation -> loadRoom -> (a rule below)
//
// The order of the checks matters: membership is checked BEFORE the room
// status. A user who is not a member always gets 403, never "the room is
// closed", so an outsider learns nothing about the room.

import { safeExecute } from "../../../../schema/db.config.js";
import { ForbiddenError } from "../../../utility/errors/errors.js";
import { NotFoundError } from "../../../utility/errors/errors.js";
import { isAdminUser } from "../../../middleware/admin.js";

// Is this user a member of this room?
const isRoomMember = async (roomId, userId) => {
  const rows = await safeExecute(
    "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? LIMIT 1",
    [roomId, userId],
  );
  return rows.length > 0;
};


/**
 * Loads the room of :roomId into req.room = { id, status }, or answers 404.
 */
const loadRoom = async (req, res, next) => {
  try {
    const rows = await safeExecute(
      "SELECT room_id, status FROM rooms WHERE room_id = ? LIMIT 1",
      [req.params.roomId],
    );
    if (rows.length === 0) {
      throw new NotFoundError("Room not found");
    }
    req.room = { id: rows[0].room_id, status: rows[0].status };
    next();
  } catch (error) {
    next(error);
  }
};


/**
 * For actions only a member may do (posting a message). An admin who is not
 * a member does NOT pass: admins read, they do not post.
 */
const requireMember = async (req, res, next) => {
  try {
    if (!(await isRoomMember(req.room.id, req.user.id))) {
      throw new ForbiddenError("Join this room first.");
    }
    next();
  } catch (error) {
    next(error);
  }
};


/**
 * For reading (messages, members): a member passes, and an admin passes
 * without joining. The admin check runs only when the user is not a member,
 * so a normal member costs one query, not two.
 */
const requireMemberOrAdmin = async (req, res, next) => {
  try {
    const isMember = await isRoomMember(req.room.id, req.user.id);
    if (!isMember && !(await isAdminUser(req.user.id))) {
      throw new ForbiddenError("Join this room first.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { isRoomMember, loadRoom, requireMember, requireMemberOrAdmin };
