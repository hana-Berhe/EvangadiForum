import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ChatWidget from "../ChatWidget/ChatWidget";
import styles from "./Layout.module.css";
import { ProfileProvider } from "../../context/ProfileProvider";

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ProfileProvider>
      <div
        className={`${styles.appLayout}${isSidebarCollapsed ? ` ${styles.sidebarCollapsed}` : ""}`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />

        <div className={styles.appMain}>
          <Navbar />

          <main className={styles.pageContent}>
            <Outlet />
          </main>

          <Footer />
        </div>

        <ChatWidget />
      </div>
    </ProfileProvider>
  );
}
