import axios from "axios";
import { useState, useEffect } from "react";
import "./Newproject.css";
import { useNavigate } from "react-router-dom";

const NewProject = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const [add, setAdd] = useState({
    taskname: "",
    description: "",
    process: "Inprogress",
    priority: "",
    dueDate: "",
  });

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAdd((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!add.taskname || !add.description || !add.priority || !add.dueDate) {
      alert("Please fill in all fields.");
      return;
    }

    if (!user) {
      alert("You must be logged in to create a task.");
      return;
    }

    const taskPayload = { ...add, userId: user.email };

    axios.post("http://localhost:3001/data", taskPayload).then((res) => {
      navigate("/");
    }).catch(err => {
      console.error("Failed to add task", err);
      alert("Failed to add task.");
    });
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <h1>Create New Task</h1>
        <p>Add a new task to your list to stay organized.</p>
      </div>

      <div className="premium-form-card">
        <div className="form-group">
          <label>Task Name</label>
          <input
            type="text"
            name="taskname"
            className="form-input"
            value={add.taskname}
            onChange={handleAddChange}
            placeholder="e.g. Design Landing Page"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className="form-textarea"
            value={add.description}
            onChange={handleAddChange}
            rows={4}
            placeholder="Provide a detailed description of the task..."
            required
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Priority</label>
            <select
              name="priority"
              className="form-select"
              value={add.priority}
              onChange={handleAddChange}
              required
            >
              <option value="" disabled>Select priority level</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              className="form-input"
              value={add.dueDate}
              onChange={handleAddChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="back-btn" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleAdd}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
