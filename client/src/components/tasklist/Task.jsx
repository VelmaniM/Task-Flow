import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import "./Task.css";

const Task = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [info, setInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

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
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = () => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data?userId=${user.email}`).then((res) => {
      setInfo(res.data);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/${id}`).then(() => {
        setInfo(info.filter((item) => item.id !== id));
      });
    }
  };

  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === "Complete" ? "Inprogress" : "Complete";
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/${id}`, {
        process: newStatus,
      });
      setInfo(
        info.map((item) =>
          item.id === id ? { ...item, process: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const isOverdue = (createdDate, status) => {
    if (status === "Complete" || !createdDate) return false;
    return new Date(createdDate) < new Date(new Date().toDateString());
  };

  const isNewTask = (createdStr) => {
    if (!createdStr) return false;
    const createdDate = new Date(createdStr);
    const now = new Date();
    const diffHours = (now - createdDate) / (1000 * 60 * 60);
    return diffHours < 2;
  };

  // Filter and search logic
  const filteredTasks = info.filter((item) => {
    const matchesSearch = item.taskname.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterType === "All" || item.process === filterType;
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = info.filter((e) => e.process === "Inprogress").length;
  const completeCount = info.filter((e) => e.process === "Complete").length;

  return (
    <div className="task-page-container">
      <div className="task-page-header">
        <h1>Task List</h1>
        <p>Manage and track all your tasks efficiently. Use this list view to search, filter, and perform bulk actions on your tasks in a structured format.</p>
      </div>

      <div className="task-controls">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="priority-filter-wrapper" style={{marginLeft: "1rem"}}>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="premium-input"
            style={{padding: "0.5rem 1rem", minWidth: "120px", cursor: "pointer"}}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === "All" ? "active" : ""}`}
            onClick={() => setFilterType("All")}
          >
            All <span>{info.length}</span>
          </button>
          <button 
            className={`filter-tab ${filterType === "Inprogress" ? "active" : ""}`}
            onClick={() => setFilterType("Inprogress")}
          >
            Pending <span>{pendingCount}</span>
          </button>
          <button 
            className={`filter-tab ${filterType === "Complete" ? "active" : ""}`}
            onClick={() => setFilterType("Complete")}
          >
            Complete <span>{completeCount}</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="premium-table">
            <thead>
              <tr>
                <th width="5%"></th>
                <th width="20%">Task Name</th>
                <th width="25%">Description</th>
                <th width="12%">Priority</th>
                <th width="13%">Create Date</th>
                <th width="10%">Status</th>
                <th width="15%">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((item) => {
                  const overdue = isOverdue(item.createdDate, item.process);
                  return (
                    <tr key={item.id} className={`${item.process === "Complete" ? "completed-row" : ""} ${overdue ? "overdue-row" : ""}`}>
                      <td>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={item.process === "Complete"}
                          onChange={() => handleComplete(item.id, item.process)}
                        />
                      </td>
                      <td>
                        <strong>{item.taskname}</strong>
                        {item.process !== "Complete" && isNewTask(item.created) && (
                          <span className="new-badge-small" style={{
                            backgroundColor: "var(--danger-color)", color: "white", padding: "0.15rem 0.4rem", 
                            borderRadius: "4px", fontSize: "0.6rem", fontWeight: "bold", marginLeft: "0.5rem", 
                            verticalAlign: "middle"
                          }}>NEW</span>
                        )}
                      </td>
                      <td>
                        {item.description}
                        {item.tag && (
                          <div style={{marginTop: "0.5rem"}}>
                            <span style={{backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary-color)", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "600"}}>
                              {item.tag}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge priority-${item.priority?.toLowerCase() || 'low'}`}>
                          {item.priority || "Low"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem" }}>{item.created || "-"}</span>
                        {item.edited && (
                          <span style={{ 
                            fontSize: "0.7rem", color: "var(--text-secondary)", 
                            fontStyle: "italic", display: "block", marginTop: "2px"
                          }}>
                            (Edited)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge status-${item.process?.toLowerCase() || 'inprogress'}`}>
                          {item.process === "Complete" ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="icon-btn edit" 
                            onClick={() => navigate(`/update/${item.id}`)}
                            title="Edit Task"
                          >
                            <MdOutlineEdit />
                          </button>
                          <button 
                            className="icon-btn delete" 
                            onClick={() => handleDelete(item.id)}
                            title="Delete Task"
                          >
                            <FaRegTrashCan />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      {searchQuery ? "No tasks match your search criteria." : "No tasks found. Create one to get started!"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Task;
