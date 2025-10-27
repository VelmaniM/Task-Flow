import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import axios from "axios";
import "./Task.css";
import { BsLayoutSidebar } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";

const Task = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  const fetch = () => {
    axios.get("http://localhost:3001/data").then((res) => {
      setInfo(res.data);
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3001/data/${id}`);
    setInfo(info.filter((item) => item.id !== id));
  };

  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === "Complete" ? "Inprogress" : "Complete";

    try {
      await axios.patch(`http://localhost:3001/data/${id}`, {
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

  const details = info.map((item) => (
    <tr
      key={item.id}
      className={completedTasks.includes(item.id) ? "completed" : ""}
    >
      <td>
        <input
          type="checkbox"
          checked={item.process === "Complete"}
          onChange={() => handleComplete(item.id, item.process)}
        />
      </td>
      <td>{item.taskname}</td>
      <td>{item.description}</td>
      <td>
        <p className={`priority-${item.priority.toLowerCase()}`}>
          {item.priority}
        </p>
      </td>
      <td>{item.created}</td>
      <td>
        <MdOutlineEdit
          className="update"
          onClick={() => {
            navigate(`/update/${item.id}`);
          }}
        />
        <FaRegTrashCan
          className="delete"
          onClick={() => handleDelete(item.id)}
        />
      </td>
    </tr>
  ));

  return (
    <>
      <div className="main-container">
        <div className="content-container">
          <div className="header">
            <BsLayoutSidebar className="h-logo" />
          </div>
          <hr />
          <h1>Tasks</h1>
          <p>Manage and track all your tasks</p>

          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="search" placeholder=" Search tasks..." />
          </div>

          <div className=" taskcount">
            <p className="tsk-hover">
              <label>
                All <span>{info.length}</span>
              </label>
            </p>
            <p className="tsk-hover">
              <label>
                Pending{" "}
                <span>
                  {info.filter((e) => e.process === "Inprogress").length}
                </span>
              </label>
            </p>
            <p className="tsk-hover">
              <label>
                Complete{" "}
                <span>
                  {info.filter((e) => e.process === "Complete").length}
                </span>
              </label>
            </p>
          </div>

          <div className="table">
            <table className="task-table">
              <thead>
                <tr>
                  <th className="status">Status</th>
                  <th className="title">Title</th>
                  <th className="desc">Description</th>
                  <th className="priority">Priority</th>
                  <th className="date">Created</th>
                  <th className="actionbtn">Actions</th>
                </tr>
              </thead>
              <tbody>{details}</tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Task;
