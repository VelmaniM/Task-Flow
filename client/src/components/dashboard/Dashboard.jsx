import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaClock, FaCheckCircle } from "react-icons/fa";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks(user.email);
    }
  }, [user]);

  const fetchTasks = async (email) => {
    try {
      const res = await axios.get(`http://localhost:3001/data?userId=${email}`);
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
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "User"} 👋</h1>
        <p>Here is an overview of your tasks and productivity.</p>
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

      <div className="charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div className="chart-card" style={{ backgroundColor: "var(--surface-color)", padding: "1rem 1.5rem", borderRadius: "var(--border-radius-lg)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "1rem" }}>Task Status</h3>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" style={{ backgroundColor: "var(--surface-color)", padding: "1rem 1.5rem", borderRadius: "var(--border-radius-lg)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "1rem" }}>Task Priorities</h3>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={priorityData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fill: "var(--text-secondary)"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: "var(--text-secondary)"}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
