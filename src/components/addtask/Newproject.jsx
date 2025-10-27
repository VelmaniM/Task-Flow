import axios from "axios";
import { useState } from "react";
import "./Newproject.css";
import { useNavigate } from "react-router-dom";
import { BsLayoutSidebar } from "react-icons/bs";

const NewProject = () => {
  const navigate = useNavigate();

  const [add, setAdd] = useState({
    taskname: "",
    description: "",
    process: "",
    priority: "",
  });

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAdd((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    axios.post("http://localhost:3001/data", add).then((res) => {
      console.log(res.data);
      navigate("/");
    });
  };

  return (
    <>
   
      <div className="container">
        <div className="Form">
          <div className="input">
            <label>Enter the Taskname</label>
            <input
              type="text"
              name="taskname"
              value={add.taskname}
              onChange={handleAddChange}
              placeholder="Enter the TaskName"
            />
          </div>

          <div className="desc">
            <label>Enter the description</label>
            <textarea
              id="desc"
              name="description"
              value={add.description}
              onChange={handleAddChange}
              rows={5}
              placeholder="Enter the description"
            ></textarea>
          </div>

          <div>
            <label>select the priority</label>
            <select
              id="select"
              className="priority"
              name="priority"
              value={add.priority}
              onChange={handleAddChange}
            >
              <option> select the priorioty</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <button className="add" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </>
  );
};

export default NewProject;
