import ui from "../../styles/pageStates.module.css";
import styles from "./RagDocuments.module.css";

// Placeholder until the RAG page (T-25) is built. It stops the three
// "Knowledge Base" links from opening the 404 page.
export default function RagDocuments() {
  return (
    <div className={`${ui.pageStack} ${styles.knowledgePage}`}>
      <section>
        <span className={ui.eyebrow}>Knowledge base</span>
        <h1>Private PDF library</h1>
        <p>This page is being built. It arrives with Milestone 3.</p>
      </section>
    </div>
  );
}
