import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { Send } from "lucide-react";
import { Sparkles } from "lucide-react";
import { X } from "lucide-react";
import { sendChatMessage } from "../../api/chat.api";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/data";
import styles from "./ChatWidget.module.css";

const MAX_MESSAGE_CHARS = 500; // same limit as the server
const MIN_MESSAGE_CHARS = 2;

const SUGGESTIONS = [
  "What is Node.js?",
  "How does JWT login work?",
  "What is RAG?",
];

// A PDF title is a file name and can be long. Keep the chip short.
const shorten = (text, max = 28) =>
  text && text.length > max ? `${text.slice(0, max - 1)}…` : text;

const makeWelcome = (firstName) => ({
  role: "assistant",
  kind: "chat",
  content: `Hi ${firstName || "there"}! Ask me about the questions and answers in the forum, or about your own PDFs. I answer only from those, and I show you my sources.`,
});

/** Text with the [1] or [1, 2] markers turned into small badges. */
function TextWithCitations({ text }) {
  return text.split(/(\[\d+(?:\s*,\s*\d+)*\])/g).map((part, index) => {
    const marker = part.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/);
    if (!marker) return part;
    return marker[1].split(",").map((ref) => (
      <sup key={`${index}-${ref.trim()}`} className={styles.citation}>
        {ref.trim()}
      </sup>
    ));
  });
}

/**
 * The assistant's text. It is always shown as plain text, never as HTML,
 * so text written by a forum user can never run in the page.
 * A ``` fence becomes a code block.
 */
function MessageText({ text }) {
  // Splitting on a pattern with one capture group gives: text, code, text...
  // so every odd item is the inside of a ``` fence.
  const pieces = text.split(/```[\w+-]*\n?([\s\S]*?)```/g);

  return pieces.map((piece, index) => {
    if (index % 2 === 1) {
      return (
        <pre key={index} className={styles.code}>
          <code>{piece.trim()}</code>
        </pre>
      );
    }
    if (!piece.trim()) return null;
    return (
      <p key={index}>
        <TextWithCitations text={piece.trim()} />
      </p>
    );
  });
}

/** One source as a small link. Orange = forum thread, blue = your PDF. */
function SourceChip({ source, showRef, onNavigate }) {
  const isDocument = source.type === "document";
  const page = isDocument && source.page ? ` · p.${source.page}` : "";

  return (
    <Link
      to={source.url}
      className={`${styles.chip} ${isDocument ? styles.chipDoc : styles.chipThread}`}
      onClick={onNavigate}
      title={`${source.title}${page}`}
    >
      {isDocument ? <BookOpen size={12} /> : <MessageSquare size={12} />}
      <span>
        {showRef ? `[${source.ref}] ` : ""}
        {shorten(source.title)}
        {page}
      </span>
    </Link>
  );
}

/**
 * Floating chat button and chat window. It is mounted once in Layout, so it
 * is on every page after login. The messages live in React state: closing the
 * window keeps them, and logging out removes them (Layout unmounts).
 *
 * The server sends a "kind" with every reply:
 *   chat     -> greeting, plain text
 *   answer   -> answered, with source chips
 *   related  -> not answered, related threads + "Ask the community"
 *   notfound -> nothing in our data, "Ask the community"
 */
export default function ChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // A discussion room has its own composer and Send button at the bottom.
  // There the closed chat button moves out of the way (see the CSS).
  const onRoomPage = /^\/rooms\/[^/]+/.test(pathname);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    makeWelcome(user?.firstName),
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the newest message in view.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the window.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function send(event, preset) {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (text.length < MIN_MESSAGE_CHARS || busy) return;

    setMessages((previous) => [...previous, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await sendChatMessage(text);
      const data = reply?.data ?? {};
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          kind: data.kind,
          content: data.answer || "",
          sources: data.sources || [],
          related: data.related || [],
          asked: text,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          kind: "error",
          content: getErrorMessage(
            error,
            "Sorry, I could not answer right now.",
          ),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setMessages([makeWelcome(user?.firstName)]);
    setInput("");
  }

  function askCommunity() {
    setOpen(false);
    navigate("/questions/ask");
  }

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={`${styles.bubble}${open ? ` ${styles.bubbleOpen}` : ""}${
          onRoomPage && !open ? ` ${styles.bubbleOnRoomPage}` : ""
        }`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <section
          className={styles.window}
          role="dialog"
          aria-label="Forum assistant"
        >
          <header className={styles.header}>
            <Sparkles size={18} />
            <div>
              <strong>Ask the forum</strong>
              <small>Answers from threads and your own PDFs</small>
            </div>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={startOver}
              aria-label="Start over"
              title="Start over"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={close}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </header>

          <div className={styles.list} ref={listRef} aria-live="polite">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const canAskCommunity =
                message.kind === "related" || message.kind === "notfound";

              return (
                <div
                  key={index}
                  className={`${styles.row} ${isUser ? styles.rowUser : styles.rowBot}`}
                >
                  <div
                    className={`${styles.msg} ${isUser ? styles.msgUser : styles.msgBot}${
                      message.kind === "error" ? ` ${styles.msgError}` : ""
                    }`}
                  >
                    <MessageText text={message.content} />

                    {message.sources?.length > 0 && (
                      <div className={styles.sources}>
                        {message.sources.map((source) => (
                          <SourceChip
                            key={source.ref}
                            source={source}
                            showRef
                            onNavigate={close}
                          />
                        ))}
                      </div>
                    )}

                    {message.related?.length > 0 && (
                      <div className={styles.sources}>
                        {message.related.map((source) => (
                          <SourceChip
                            key={source.ref}
                            source={source}
                            onNavigate={close}
                          />
                        ))}
                      </div>
                    )}

                    {canAskCommunity && (
                      <button
                        type="button"
                        className={styles.askBtn}
                        onClick={askCommunity}
                      >
                        Ask the community →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {messages.length === 1 && !busy && (
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => send(null, question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {busy && (
              <div className={`${styles.row} ${styles.rowBot}`}>
                <div
                  className={`${styles.msg} ${styles.msgBot} ${styles.typing}`}
                  aria-label="The assistant is thinking"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form className={styles.inputRow} onSubmit={send}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the forum or your PDFs..."
              aria-label="Your message"
              maxLength={MAX_MESSAGE_CHARS}
              disabled={busy}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={busy || input.trim().length < MIN_MESSAGE_CHARS}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
