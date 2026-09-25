// Room membership: join, leave, list the members.

import { safeExecute } from "../../../../schema/db.config.js";
import { ConflictError } from "../../../utility/errors/errors.js";
import { isRoomMember } from "../middleware/room.access.js";
import { getRoomService } from "./room.service.js";

/**
 * Joins a room.
 *
 * One statement does the check and the write together: the row is inserted
 * only while the room is open. So "join" and "close" cannot slip past each
 * other. The UNIQUE key (room_id, user_id) makes a second join impossible.
 *
 * @param {{ roomId: number, userId: number }} param
 * @returns {Promise<{ joined: boolean, room: Object }>} joined is false when
 *   the user was already a member (nothing changed).
 * @throws {ConflictError} If the room is closed and the user is not in it.
 */
const joinRoomService = async ({ roomId, userId }) => {
  let joined = false;
  try {
    const result = await safeExecute(
      `INSERT INTO room_members (room_id, user_id)
       SELECT r.room_id, ? FROM rooms r
       WHERE r.room_id = ? AND r.status = 'open'`,
      [userId, roomId],
    );
    joined = result.affectedRows === 1;
  } catch (error) {
    // Already a member: joining again is fine and changes nothing.
    if (error.code !== "ER_DUP_ENTRY") throw error;
  }

  // Nothing was inserted and there was no duplicate: the room is closed.
  // A member of a closed room still gets a calm 200.
  if (!joined && !(await isRoomMember(roomId, userId))) {
    throw new ConflictError("This room is closed. Nobody can join it.");
  }

  return { joined, room: await getRoomService({ roomId, userId }) };
};

/**
 * Leaves a room. The user's old messages stay. Leaving a room you are not in
 * changes nothing and is not an error. Leaving works in a closed room too.
 * @param {{ roomId: number, userId: number }} param
 * @returns {Promise<{ left: boolean, room: Object }>}
 */
const leaveRoomService = async ({ roomId, userId }) => {
  const result = await safeExecute(
    "DELETE FROM room_members WHERE room_id = ? AND user_id = ?",
    [roomId, userId],
  );
  return {
    left: result.affectedRows === 1,
    room: await getRoomService({ roomId, userId }),
  };
};

/**
 * The members of a room, first joined first.
 * @param {number} roomId
 * @returns {Promise<Array<{ id: number, firstName: string, lastName: string, joinedAt: Date }>>}
 */
const listMembersService = async (roomId) => {
  const rows = await safeExecute(
    `SELECT u.user_id, u.first_name, u.last_name, m.joined_at
     FROM room_members m
     JOIN users u ON u.user_id = m.user_id
     WHERE m.room_id = ?
     ORDER BY m.joined_at ASC, m.room_member_id ASC`,
    [roomId],
  );
  return rows.map((row) => ({
    id: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    joinedAt: row.joined_at,
  }));
};

export { joinRoomService, leaveRoomService, listMembersService };
