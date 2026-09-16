import styles from "./ErrorMessage.module.css";
export default function ErrorMessage({ message }) {
  return (
    <div className={styles.errorMessage} role="alert">
      {message}
    </div>
  );
}
