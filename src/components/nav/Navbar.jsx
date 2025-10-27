import { useNavigate } from "react-router-dom";
import { FaTasks } from "react-icons/fa";
import "./Navbar.css";
import { RxExit } from "react-icons/rx";
import { BsLayoutSidebar } from "react-icons/bs";
import { MdOutlineEdit } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="Nav-main">
        <div className="nav-content">
          <div
            className="icon"
            onClick={() => {
              navigate("/");
            }}
          >
            <FaTasks className="logo" />
            <p>TaskFlow</p>
          </div>
          <div className="buttons">
            <button
              className="nav-buttons"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              <BsLayoutSidebar className="btnlogo" /> Dashboard
            </button>
            <button
              className="nav-buttons"
              onClick={() => {
                navigate("/add");
              }}
            >
              <FaTasks className="btnlogo" /> Add Task
            </button>
            <button
              className="nav-buttons"
              onClick={() => {
                navigate("/update/:id");
              }}
            >
              <MdOutlineEdit className="btnlogo" /> Update
            </button>
          </div>
        </div>
        <div className="logout">
          <p
            onClick={() => {
              navigate("/login");
            }}
          >
            LogOut
          </p>
          <RxExit />
        </div>
      </div>
    </>
  );
};

export default Navbar;
