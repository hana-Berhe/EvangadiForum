import { useState } from "react";
import styles from "./RagAnswerBody.module.css";

/** One code block from the answer, with a Copy button. */
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is blocked (old browser or no permission). The user can
      // still select the text by hand.
    }
  }

  return (
    <div className={styles.codeBlock}>
      <button type="button" className={styles.copyButton} onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Text with the [1], [2] markers turned into small badges. */
function TextWithCitations({ text }) {
  return text.split(/(\[\d+\])/g).map((part, index) => {
    const marker = part.match(/^\[(\d+)\]$/);
    if (!marker) return part;

    return (
      <sup
        key={index}
        className={styles.citation}
        title="From a chunk of this document"
      >
        {marker[1]}
      </sup>
    );
  });
}

/**
 * Renders a grounded answer and the excerpts it was built from.
 *
 * The model is asked for plain prose that cites excerpts inline as [1], [2],
 * and for code inside ``` fences. The markers become badges so a reader can
 * match a claim to its source, and the fences become code blocks.
 */
export default function RagAnswerBody({ answer = "", citations = [] }) {
  const text = typeof answer === "string" ? answer : "";
  if (!text.trim()) return null;

  // Splitting on a pattern with one capture group gives: text, code, text...
  // so every odd item is the inside of a ``` fence.
  const pieces = text.split(/```[\w+-]*\n?([\s\S]*?)```/g);

  return (
    <div className={styles.answer}>
      {pieces.map((piece, pieceIndex) => {
        if (pieceIndex % 2 === 1) {
          return <CodeBlock key={pieceIndex} code={piece.trim()} />;
        }

        return piece
          .split(/\n{2,}/)
          .filter((block) => block.trim())
          .map((paragraph, blockIndex) => (
            <p key={`${pieceIndex}-${blockIndex}`} className={styles.body}>
              <TextWithCitations text={paragraph.trim()} />
            </p>
          ));
      })}

      {citations.length > 0 && (
        <div className={styles.sources}>
          <span className={styles.sourcesLabel}>Sources in this document</span>
          <ul className={styles.sourceList}>
            {citations.map((citation) => (
              <li key={citation.ref}>
                <span className={styles.sourceRef}>{citation.ref}</span>
                <span>
                  chunk {citation.chunkIndex + 1}
                  {citation.pageStart ? ` · page ${citation.pageStart}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
