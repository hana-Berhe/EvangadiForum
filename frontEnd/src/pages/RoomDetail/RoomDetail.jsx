import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getRoom, joinRoom } from "../../api/rooms.api";
import { listRoomMessages } from "../../api/rooms.api";
import { postRoomMessage } from "../../api/rooms.api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getErrorMessage, plural } from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./RoomDetail.module.css";
import ui from "../../styles/pageStates.module.css";
import MessageItem from "./MessageItem";
import JoinCard from "./JoinCard";
import RoomAbout from "./RoomAbout";

const MAX_MESSAGE = 2000; // the same limit as the server and the database
const POLL_MS = 15000; // ask for new messages every 15 seconds

/**
 * The page of one discussion room. It has three views:
 *   1. the room does not exist   -> "Room not found"
 *   2. not a member              -> room info and a Join button
 *   3. member                    -> messages and the composer
 * The server decides who may read and post. This page only decides what to
 * SHOW.
 */
export default function RoomDetail() {
  const { roomId } = useParams();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pageError, setPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [messages, setMessages] = useState([]);
  // Which "room + membership" the messages on the screen belong to.
  const [loadedKey, setLoadedKey] = useState(null);
  const [messagesError, setMessagesError] = useState("");

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const listRef = useRef(null);
  const composerRef = useRef(null);

  // Only a member can read and post. The server checks this too.
  const isMember = Boolean(room?.isMember);
  // The messages are loading until the answer for THIS room has arrived.
  const messagesKey = `${roomId}:${isMember}`;
  const loadingMessages = isMember && loadedKey !== messagesKey;

  // ---------- load the room ----------
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const reply = await getRoom(roomId);
        if (!active) return;
        setRoom(reply.data);
        setNotFound(false);
        setPageError("");
      } catch (error) {
        if (!active) return;
        const status = error.response?.status;
        // 404 = no such room. 400 = the id in the address is not a number.
        if (status === 404 || status === 400) setNotFound(true);
        else setPageError(getErrorMessage(error, "Could not load the room."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId, reloadKey]);

  // ---------- load the latest messages (members only) ----------
  useEffect(() => {
    if (!isMember) return undefined;
    let active = true;
    (async () => {
      try {
        const page = await listRoomMessages(roomId);
        if (!active) return;
        setMessages(page.data.messages);
        setMessagesError("");
      } catch (error) {
        if (active) {
          setMessagesError(
            getErrorMessage(error, "Could not load the messages."),
          );
        }
      } finally {
        if (active) setLoadedKey(`${roomId}:${isMember}`);
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId, isMember]);

  // ---------- polling: ask for the messages again every 15 seconds ----------
  useEffect(() => {
    if (!isMember) return undefined;
    let active = true;

    async function poll() {
      try {
        const page = await listRoomMessages(roomId);
        if (!active) return;
        const fresh = page.data.messages;
        // Only update the screen when a new message has arrived.
        setMessages((previous) =>
          fresh.at(-1)?.id === previous.at(-1)?.id ? previous : fresh,
        );
      } catch {
        // Stay quiet. The next poll tries again.
      }
    }

    const timer = setInterval(poll, POLL_MS);
    // Leaving the page stops the timer.
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [roomId, isMember]);

  // ---------- after the messages changed: show the newest one ----------
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function send(event) {
    event?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setSendError("");
    try {
      const reply = await postRoomMessage(roomId, content);
      // The server sends the saved message back. Add it at the end.
      setMessages((previous) => [...previous, reply.data]);
      setText("");
    } catch (error) {
      setSendError(getErrorMessage(error, "Could not send the message."));
      const status = error.response?.status;
      // 403: we are not a member. Reload the room to show the Join screen.
      if (status === 403) setReloadKey((key) => key + 1);
    } finally {
      setSending(false);
      composerRef.current?.focus();
    }
  }

  function onComposerKeyDown(event) {
    // Enter sends. Shift + Enter makes a new line. While a language keyboard
    // is still composing a character, Enter belongs to the keyboard.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      send(event);
    }
  }

  async function onJoin() {
    setJoining(true);
    setJoinError("");
    try {
      // The server sends the whole room back, now with isMember: true.
      const reply = await joinRoom(roomId);
      setRoom(reply.data);
    } catch (error) {
      setJoinError(getErrorMessage(error, "Could not join the room."));
      setReloadKey((key) => key + 1);
    } finally {
      setJoining(false);
    }
  }

  const backLink = (
    <Link to="/rooms" className={styles.back}>
      <ArrowLeft size={16} />
      Back to rooms
    </Link>
  );

  // ---------- view: loading / error / not found ----------
  if (loading) {
    return <LoadingSpinner label="Loading the room..." />;
  }

  if (notFound) {
    return (
      <div className={ui.pageStack}>
        {backLink}
        <EmptyState
          icon={<Users size={30} />}
          title="Room not found"
          message="This room does not exist. It may be a wrong link."
          action={
            <Link to="/rooms" className={btn.primaryButton}>
              See all rooms
            </Link>
          }
        />
      </div>
    );
  }

  if (pageError || !room) {
    return (
      <div className={ui.pageStack}>
        {backLink}
        <ErrorMessage message={pageError || "Could not load the room."} />
      </div>
    );
  }

  // ---------- view: not a member ----------
  if (!isMember) {
    return (
      <div className={ui.pageStack}>
        {backLink}
        <JoinCard
          room={room}
          joining={joining}
          joinError={joinError}
          onJoin={onJoin}
        />
      </div>
    );
  }

  // ---------- view: member ----------
  const memberCount = room.memberCount;

  return (
    <div className={ui.pageStack}>
      {backLink}

      <div className={styles.body}>
        {/* One card: room header, messages, composer. */}
        <section className={styles.chatCard} aria-label="Messages">
          <header className={styles.header}>
            <span className={styles.roomIcon}>
              <Users size={24} />
            </span>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>
                <h1>{room.name}</h1>
              </div>
              {room.description && <p>{room.description}</p>}
            </div>

            <span className={styles.headerCount}>
              <Users size={16} />
              {plural(memberCount, "member")}
            </span>
          </header>

          <div className={styles.list} ref={listRef}>
            {loadingMessages && messages.length === 0 && (
              <LoadingSpinner label="Loading messages..." />
            )}

            {!loadingMessages && !messagesError && messages.length === 0 && (
              <p className={styles.noMessages}>
                No messages yet. Write the first one.
              </p>
            )}

            <ul className={styles.messages} aria-live="polite">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  own={message.author.id === user.id}
                />
              ))}
            </ul>
          </div>

          {messagesError && (
            <div className={styles.cardNotice}>
              <ErrorMessage message={messagesError} />
            </div>
          )}

          <footer className={styles.cardFoot}>
            <form className={styles.composer} onSubmit={send}>
              <label htmlFor="roomComposer" className={styles.srOnly}>
                Your message
              </label>
              <textarea
                id="roomComposer"
                ref={composerRef}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setSendError("");
                }}
                onKeyDown={onComposerKeyDown}
                maxLength={MAX_MESSAGE}
                rows={2}
                placeholder="Write a message to the room..."
                // readOnly, not disabled: a disabled field loses the focus,
                // and the writer would have to click again after each send.
                readOnly={sending}
              />
              <button
                type="submit"
                className={btn.primaryButton}
                // Only "sending" disables it, so it keeps the real orange.
                // An empty message is simply not sent (see send()).
                disabled={sending}
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send"}
              </button>
              <small className={styles.composerHint}>
                Enter sends. Shift + Enter makes a new line.
              </small>
              {sendError && (
                <p className={styles.sendError} role="alert">
                  {sendError}
                </p>
              )}
            </form>
          </footer>
        </section>

        {/* The right column: about the room. */}
        <RoomAbout
          room={room}
          messageCount={Math.max(room.messageCount, messages.length)}
        />
      </div>
    </div>
  );
}
