import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaClock, FaCheckCircle } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("taskflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }

    const handleStorageChange = () => {
      const latestUser = sessionStorage.getItem("taskflow_user");
      if (latestUser) {
        setUser(JSON.parse(latestUser));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks(user.email);
    }
  }, [user]);

  const fetchTasks = async (email) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data?userId=${email}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const pendingCount = tasks.filter((t) => t.process === "Inprogress" || t.process === "To Do").length;
  const completeCount = tasks.filter((t) => t.process === "Complete").length;
  const recentTasks = [...tasks].reverse().slice(0, 5); // Show last 5 tasks

  // Data for Charts
  const statusData = [
    { name: "Completed", value: completeCount },
    { name: "Pending", value: pendingCount }
  ];
  const COLORS = ["#10B981", "#F59E0B"];

  const highCount = tasks.filter((t) => t.priority === "High").length;
  const mediumCount = tasks.filter((t) => t.priority === "Medium").length;
  const lowCount = tasks.filter((t) => t.priority === "Low").length;

  const priorityData = [
    { name: "High", count: highCount, fill: "#EF4444" },
    { name: "Medium", count: mediumCount, fill: "#F59E0B" },
    { name: "Low", count: lowCount, fill: "#10B981" }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <img 
            src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.email} 
            alt="Profile" 
            style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-color)" }} 
          />
        )}
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.taskname || user?.name || user?.email?.split('@')[0] || "User"} 👋. Here is an overview of your tasks and productivity. Use this section to get a high-level summary of your project's progress and identify what needs attention.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FaClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completeCount}</span>
          </div>
        </div>
      </div>

      <div className="recent-tasks-section" style={{ marginTop: "1rem" }}>
        <div className="recent-tasks-header">
          <h3>Recent Tasks</h3>
          <button className="view-all-btn" onClick={() => navigate("/")}>
            View All
          </button>
        </div>
        <div className="recent-tasks-list">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div className="task-item" key={task.id}>
                <div className="task-item-info">
                  <h4>{task.taskname}</h4>
                  <p>{task.created}</p>
                </div>
                <span className={`task-status-badge status-${task.process}`}>
                  {task.process === "Complete" ? "Completed" : "In Progress"}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No tasks found. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
