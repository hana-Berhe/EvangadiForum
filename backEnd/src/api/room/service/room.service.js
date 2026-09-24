import { safeExecute } from "../../../../schema/db.config.js";
import { NotFoundError } from "../../../utility/errors/errors.js";


const ROOM_SELECT = `
  SELECT
    r.room_id, r.name, r.description, r.status, r.created_at, r.closed_at,
    r.created_by, cu.first_name AS creator_first_name, cu.last_name AS creator_last_name,
    r.closed_by, xu.first_name AS closer_first_name, xu.last_name AS closer_last_name,
    (SELECT COUNT(*) FROM room_members m WHERE m.room_id = r.room_id) AS member_count,
    (SELECT COUNT(*) FROM room_messages g WHERE g.room_id = r.room_id) AS message_count,
    COALESCE(
      (SELECT MAX(g2.created_at) FROM room_messages g2 WHERE g2.room_id = r.room_id),
      r.created_at
    ) AS last_activity_at,
    EXISTS(
      SELECT 1 FROM room_members me WHERE me.room_id = r.room_id AND me.user_id = ?
    ) AS is_member
  FROM rooms r
  LEFT JOIN users cu ON cu.user_id = r.created_by
  LEFT JOIN users xu ON xu.user_id = r.closed_by`;

 

const toRoom = (row) => ({
  id: row.room_id,
  name: row.name,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  createdBy: toPerson(
    row.created_by,
    row.creator_first_name,
    row.creator_last_name,
  ),
  closedAt: row.closed_at,
  closedBy: toPerson(
    row.closed_by,
    row.closer_first_name,
    row.closer_last_name,
  ),
  memberCount: Number(row.member_count),
  messageCount: Number(row.message_count),
  lastActivityAt: row.last_activity_at,
  isMember: Boolean(row.is_member),
});

/**
 * Every room, newest activity first. Open and closed together, or only one
 * status (the admin dashboard filter).
 * @param {number} userId - The user who is asking (for isMember).
 * @param {{ status?: "open" | "closed" }} [filter]
 * @returns {Promise<Array<Object>>}
 */
const listRoomsService = async (userId, { status } = {}) => {
  const where = status ? "WHERE r.status = ?" : "";
  const params = status ? [userId, status] : [userId];
  const rows = await safeExecute(
    `${ROOM_SELECT}
  ${where}
  ORDER BY last_activity_at DESC, r.room_id DESC`,
    params,
  );
  return rows.map(toRoom);
};

/**
 * One room by id.
 * @param {{ roomId: number, userId: number }} param
 * @returns {Promise<Object>}
 * @throws {NotFoundError} If the room does not exist.
 */
const getRoomService = async ({ roomId, userId }) => {
  const rows = await safeExecute(
    `${ROOM_SELECT}
  WHERE r.room_id = ?`,
    [userId, roomId],
  );
  if (rows.length === 0) {
    throw new NotFoundError("Room not found");
  }
  return toRoom(rows[0]);
};
/**
 * Closes a room for ever. Members can still read it, nobody can post or join.
 * There is no reopen and no delete in V1.
 *
 * The UPDATE only matches an OPEN room, so two admins who close at the same
 * moment cannot both win: the second one changes 0 rows and gets 409, and
 * closed_by and closed_at are never overwritten.
 *
 * @param {{ roomId: number, adminId: number }} param
 * @returns {Promise<Object>} The closed room.
 * @throws {ConflictError} If the room is already closed.
 */
const closeRoomService = async ({ roomId, adminId }) => {
  const result = await safeExecute(
    `UPDATE rooms
     SET status = 'closed', closed_at = CURRENT_TIMESTAMP, closed_by = ?
     WHERE room_id = ? AND status = 'open'`,
    [adminId, roomId],
  );
  if (result.affectedRows === 0) {
    throw new ConflictError("This room is already closed.");
  }
  return getRoomService({ roomId, userId: adminId });
};

export {
  listRoomsService,
  getRoomService,
  getRoomService,

};