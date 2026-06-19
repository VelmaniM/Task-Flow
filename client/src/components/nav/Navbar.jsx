import { useNavigate, useLocation } from "react-router-dom";
import { FaTasks, FaPlus } from "react-icons/fa";
import { BsLayoutSidebar, BsListTask, BsKanban } from "react-icons/bs";
import { RxExit } from "react-icons/rx";
import "./Navbar.css";

const Navbar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <button className="logout-btn" onClick={handleLogout}>
          <RxExit className="sidebar-link-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
