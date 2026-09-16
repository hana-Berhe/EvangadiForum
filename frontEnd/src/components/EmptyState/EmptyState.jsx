import styles from "./EmptyState.module.css";
export default function EmptyState({ title, message, action }) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
