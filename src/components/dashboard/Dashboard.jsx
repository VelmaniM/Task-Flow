import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import "./Dashboard.css";
import { BsLayoutSidebar } from "react-icons/bs";
import NewProject from "../addtask/Newproject";

const Dashboard = () => {
  const navigate = useNavigate();

  const [info, setInfo] = useState([]);

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

  const details = info.map((item) => (
    <tr key={item.id}>
      <td>{item.status}</td>
      <td>{item.taskname}</td>
      <td>{item.description}</td>
      <td>{item.priority}</td>
      <td>{item.created}</td>

      <td>
        {/* update buuton */}
        <button
          className="update"
          onClick={() => {
            navigate(`/update/${item.id}`);
          }}
        >
          <MdOutlineEdit />
        </button>

        {/* delete button */}
        <button className="delete" onClick={() => handleDelete(item.id)}>
          <FaRegTrashCan />
        </button>
      </td>
    </tr>
  ));
  return (
    <>
      <div className="header">
        <BsLayoutSidebar className="h-logo" />
      </div>
      <hr />
      {/* right content */}
      <div className="tsk-content">
        <div className="dash-taskcount">
          <h1>
            <label>TaskCount</label>
            <h6>{info.length}</h6>
          </h1>

          {/* count the task */}
          <h1>
            <label>Pending</label>{" "}
            <h6> {info.filter((e) => e.process === "Inprogress").length}</h6>
          </h1>
          <h1>
            <label>Complete</label>{" "}
            <h6>{info.filter((e) => e.process === "Complete").length}</h6>
          </h1>
        </div>
      </div>

      <NewProject />
    </>
  );
};

export default Dashboard;
