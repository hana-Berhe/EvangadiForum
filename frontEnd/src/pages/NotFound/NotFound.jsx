import { Link } from "react-router-dom";
import btn from "../../styles/buttons.module.css";
import ui from "../../styles/pageStates.module.css";

export default function NotFound() {
  return (
    <div className={ui.screenCenter}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className={btn.primaryButton}>
        Go Home
      </Link>
    </div>
  );
}
