import styles from "./LoadingSpinner.module.css";
import ui from "../../styles/pageStates.module.css";
export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className={styles.loadingState}>
      <div className={ui.spinner} />
      <p>{label}</p>
    </div>
  );
}
