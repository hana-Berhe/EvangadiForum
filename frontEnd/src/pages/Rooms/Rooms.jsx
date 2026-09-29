import { useEffect, useState } from "react";
import { Clock, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { joinRoom, listRooms } from "../../api/rooms.api";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getErrorMessage, getRelativeTime, plural } from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./Rooms.module.css";
import ui from "../../styles/pageStates.module.css";

/** One room in the list. */
function RoomCard({ room, joining, onJoin }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h2>{room.name}</h2>
        {room.isMember && <span className={styles.joinedTag}>Joined</span>}
      </div>

      <p className={styles.cardText}>{room.description || "No description."}</p>

      <div className={styles.cardMeta}>
        <span>
          <Users size={14} />
          {plural(room.memberCount, "member")}
        </span>
        <span>
          <MessageSquare size={14} />
          {plural(room.messageCount, "message")}
        </span>
        <span>
          <Clock size={14} />
          {getRelativeTime(room.lastActivityAt)}
        </span>
      </div>

      <div className={styles.cardBottom}>
        <small>Created by Evangadi Forum</small>

        {room.isMember ? (
          <Link to={`/rooms/${room.id}`} className={styles.openButton}>
            Open
          </Link>
        ) : (
          <button
            type="button"
            className={btn.primaryButton}
            onClick={() => onJoin(room)}
            disabled={joining}
          >
            {joining ? "Joining..." : "Join"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [joiningId, setJoiningId] = useState(null);

  // Loads the list when the page opens, and again when reloadKey changes.
  useEffect(() => {
    // "active" is false after the page was left: a late answer is ignored.
    let active = true;
    (async () => {
      try {
        const reply = await listRooms();
        if (!active) return;
        setRooms(reply.data);
        setError("");
      } catch (e) {
        if (active) setError(getErrorMessage(e, "Could not load the rooms."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function onJoin(room) {
    setJoiningId(room.id);
    setJoinError("");
    try {
      // The server sends the whole room back, with the new count.
      const reply = await joinRoom(room.id);
      setRooms((previous) =>
        previous.map((item) => (item.id === room.id ? reply.data : item)),
      );
    } catch (e) {
      setJoinError(getErrorMessage(e, "Could not join the room."));
      // The list may be old: load it again.
      setReloadKey((key) => key + 1);
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className={ui.pageStack}>
      <section className={styles.intro}>
        <div>
          <span className={ui.eyebrow}>Talk together</span>
          <h1>Discussion Rooms</h1>
          <p>Join a room to read its messages and to post.</p>
        </div>
      </section>

      {loading && <LoadingSpinner label="Loading rooms..." />}
      {error && <ErrorMessage message={error} />}
      {joinError && <ErrorMessage message={joinError} />}

      {!loading && !error && rooms.length === 0 && (
        <EmptyState
          icon={<Users size={30} />}
          title="No rooms yet"
          message="No rooms are available right now."
        />
      )}

      {rooms.length > 0 && (
        <div className={styles.grid}>
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              joining={joiningId === room.id}
              onJoin={onJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
