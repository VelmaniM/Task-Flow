import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTasks, FaPlus, FaCog } from "react-icons/fa";
import { BsLayoutSidebar, BsListTask, BsKanban } from "react-icons/bs";
import { RxExit } from "react-icons/rx";
import "./Navbar.css";

const Navbar = ({ isSidebarOpen, onOpenSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen to local storage changes or just load once
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Custom event listener if we dispatch updates
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("taskflow_user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    
    // We can poll or just rely on re-renders, but since Navbar is outside main routes often, let's keep it simple
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location]); // Reload user on route change as a simple update mechanism

  const handleLogout = () => {
    localStorage.removeItem("taskflow_user");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <div className={`sidebar ${!isSidebarOpen ? "closed" : ""}`}>
      <div className="sidebar-header" onClick={() => navigate("/")}>
        <FaTasks className="sidebar-logo-icon" />
        <h2>TaskFlow</h2>
      </div>

      <div className="sidebar-menu">
        <button className={isActive("/dashboard")} onClick={() => navigate("/dashboard")}>
          <BsLayoutSidebar className="sidebar-link-icon" />
          <span className="link-text">Dashboard</span>
        </button>

        <button className={isActive("/board")} onClick={() => navigate("/board")}>
          <BsKanban className="sidebar-link-icon" />
          <span className="link-text">Board</span>
        </button>

        <button className={isActive("/")} onClick={() => navigate("/")}>
          <BsListTask className="sidebar-link-icon" />
          <span className="link-text">Task List</span>
        </button>

        <button className={isActive("/add")} onClick={() => navigate("/add")}>
          <FaPlus className="sidebar-link-icon" />
          <span className="link-text">Add Task</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={onOpenSettings} style={{marginBottom: "0.5rem"}}>
          <FaCog className="sidebar-link-icon" />
          <span className="link-text">Settings</span>
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <RxExit className="sidebar-link-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
