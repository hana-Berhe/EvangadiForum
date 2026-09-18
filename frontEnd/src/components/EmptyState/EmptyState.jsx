import styles from "./EmptyState.module.css";
export default function EmptyState({ title, message, action, icon }) {
  return (
    <div className={styles.emptyState}>
      {icon}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
