import { useRef, useState } from "react";
import {
  Bold,
  Code2,
  Eye,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import styles from "./MarkdownEditor.module.css";
import ui from "../../styles/pageStates.module.css";

function wrapSelection(
  value,
  start,
  end,
  before,
  after = before,
  placeholder = "text",
) {
  const selected = value.slice(start, end) || placeholder;
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  const selectionStart = start + before.length;
  const selectionEnd = selectionStart + selected.length;
  return { next, selectionStart, selectionEnd };
}

function prefixLines(value, start, end, prefixFactory) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const nextNewline = value.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? value.length : nextNewline;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const transformed = lines
    .map((line, index) => `${prefixFactory(index)}${line}`)
    .join("\n");
  return {
    next: `${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + transformed.length,
  };
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 12,
  minLength = 0,
  ariaLabel = "Rich text editor",
}) {
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(false);

  function applyResult(result) {
    onChange(result.next);

    requestAnimationFrame(() => {
      const element = textareaRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function applyWrap(before, after = before, placeholder = "text") {
    const element = textareaRef.current;
    if (!element) return;
    applyResult(
      wrapSelection(
        value,
        element.selectionStart,
        element.selectionEnd,
        before,
        after,
        placeholder,
      ),
    );
  }

  function applyPrefix(prefixFactory) {
    const element = textareaRef.current;
    if (!element) return;
    applyResult(
      prefixLines(
        value,
        element.selectionStart,
        element.selectionEnd,
        prefixFactory,
      ),
    );
  }

  function applyCode() {
    const element = textareaRef.current;
    if (!element) return;
    const selected = value.slice(element.selectionStart, element.selectionEnd);

    if (selected.includes("\n")) {
      applyWrap("```\n", "\n```", "your code here");
    } else {
      applyWrap("`", "`", "code");
    }
  }

  function applyLink() {
    const element = textareaRef.current;
    if (!element) return;
    const selected =
      value.slice(element.selectionStart, element.selectionEnd) || "link text";
    const url = window.prompt("Paste the URL:", "https://");
    if (!url) return;

    const before = value.slice(0, element.selectionStart);
    const after = value.slice(element.selectionEnd);
    const inserted = `[${selected}](${url})`;
    onChange(`${before}${inserted}${after}`);

    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (!target) return;
      const caret = element.selectionStart + inserted.length;
      target.focus();
      target.setSelectionRange(caret, caret);
    });
  }

  const toolbarButton = (label, icon, action, active = false) => (
    <button
      type="button"
      className={`${styles.editorTool}${active ? ` ${styles.active}` : ""}`}
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action}
    >
      {icon}
    </button>
  );

  return (
    <div className={ui.editorShell}>
      <div
        className={styles.editorToolbar}
        role="toolbar"
        aria-label="Text formatting"
      >
        <div className={styles.editorToolsLeft}>
          {toolbarButton("Bold", <Bold size={16} />, () =>
            applyWrap("**", "**", "bold text"),
          )}
          {toolbarButton("Italic", <Italic size={16} />, () =>
            applyWrap("*", "*", "italic text"),
          )}
          {toolbarButton("Code", <Code2 size={16} />, applyCode)}
          {toolbarButton("Link", <LinkIcon size={16} />, applyLink)}
          {toolbarButton("Bulleted list", <List size={16} />, () =>
            applyPrefix(() => "- "),
          )}
          {toolbarButton("Numbered list", <ListOrdered size={16} />, () =>
            applyPrefix((index) => `${index + 1}. `),
          )}
          {toolbarButton("Quote", <Quote size={16} />, () =>
            applyPrefix(() => "> "),
          )}
          {toolbarButton(
            preview ? "Edit" : "Preview",
            <Eye size={16} />,
            () => setPreview((current) => !current),
            preview,
          )}
        </div>

        <span className={styles.editorCharacterCount}>
          {value.length} character{value.length === 1 ? "" : "s"}
        </span>
      </div>

      {preview ? (
        <div className={`${styles.markdownPreview} ${ui.proseContent}`}>
          {value.trim() ? (
            <MarkdownContent>{value}</MarkdownContent>
          ) : (
            <p className={ui.muted}>Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          minLength={minLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      )}
    </div>
  );
}
