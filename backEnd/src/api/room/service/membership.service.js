// Room membership: join.

import { safeExecute } from "../../../../schema/db.config.js";
import { getRoomService } from "./room.service.js";

/**
 * Joins a room. Any logged-in user can join any room.
 *
 * The UNIQUE key (room_id, user_id) makes a second join impossible, even if
 * two requests arrive at the same moment. A second join is not an error:
 * it just changes nothing.
 *
 * @param {{ roomId: number, userId: number }} param
 * @returns {Promise<{ joined: boolean, room: Object }>} joined is false when
 *   the user was already a member.
 */
const joinRoomService = async ({ roomId, userId }) => {
  let joined = true;
  try {
    await safeExecute(
      "INSERT INTO room_members (room_id, user_id) VALUES (?, ?)",
      [roomId, userId],
    );
  } catch (error) {
    // Already a member: the UNIQUE key refused a second row.
    if (error.code !== "ER_DUP_ENTRY") throw error;
    joined = false;
  }

  return { joined, room: await getRoomService({ roomId, userId }) };
};

export { joinRoomService };
