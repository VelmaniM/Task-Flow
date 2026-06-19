import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../addtask/Newproject.css";

const Update = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [update, setUpdate] = useState({
    taskname: "",
    description: "",
    process: "",
    priority: "",
    createdDate: "",
    tag: "",
  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/${id}`).then((res) => {
      setUpdate(res.data);
    }).catch(err => {
      console.error("Error fetching task for update", err);
    });
  }, [id]);

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    if (!update.taskname || !update.description || !update.priority || !update.createdDate) {
      alert("Please fill in all fields.");
      return;
    }
    axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/${id}`, update).then((res) => {
      navigate("/");
    }).catch(err => {
      console.error("Failed to update task", err);
      alert("Failed to update task.");
    });
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <h1>Update Task</h1>
        <p>Modify the details of your existing task. Use this form to make changes to task descriptions, adjust priorities, or update deadlines.</p>
      </div>

      <div className="premium-form-card">
        <div className="form-group">
          <label>Task Name</label>
          <input
            type="text"
            name="taskname"
            className="form-input"
            value={update.taskname || ""}
            onChange={handleUpdateChange}
            placeholder="e.g. Design Landing Page"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className="form-textarea"
            value={update.description || ""}
            onChange={handleUpdateChange}
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
              value={update.priority || ""}
              onChange={handleUpdateChange}
              required
            >
              <option value="" disabled>Select priority level</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Date</label>
            <input
              type="date"
              name="createdDate"
              className="form-input"
              value={update.createdDate || ""}
              onChange={handleUpdateChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="back-btn" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Update;
