import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.appLayout}>
      <Sidebar />

      <div className={styles.appMain}>
        <Navbar />

        <main className={styles.pageContent}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}