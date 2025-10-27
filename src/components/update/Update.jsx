import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./Update.css";

const Update = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [update, setUpdate] = useState({
    taskname: "",
    description: "",
    process: "",
    priority: "",
  });

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    axios.put(`http://localhost:3001/data/${id}`, update).then((res) => {
      console.log(res.data);
      navigate("/");
    });
  };

  useEffect(() => {
    axios.get(`http://localhost:3001/data/${id}`).then((res) => {
      setUpdate(res.data);
    });
  }, [id]);

  return (
    <>
      <h1>Edit task</h1>
      <div className="container">
        <div className="Form">
          <div className="input">
            <label> Enter Task name: </label>
            <input
              type="text"
              name="taskname"
              value={update.taskname}
              onChange={handleUpdateChange}
            />
          </div>

          <div className="desc">
            <label>Enter the description</label>
            <textarea
              name="description"
              value={update.description}
              onChange={handleUpdateChange}
              rows={5}
              placeholder="Enter the description"
            ></textarea>
          </div>

          <select
            id="select"
            className="priority"
            name="priority"
            value={update.priority}
            onChange={handleUpdateChange}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <div className="dash-btn">
            <button className="update-btn" onClick={handleUpdate}>
              Update
            </button>

            <button
              className="back"
              onClick={() => {
                navigate("/");
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Update;
