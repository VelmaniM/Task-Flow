import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import NewProject from "./components/addtask/Newproject";
import Update from "./components/update/Update";
import Task from "./components/tasklist/Task";
import Navbar from "./components/nav/Navbar";
import Login from "./components/login/Login";

function App() {
  return (
    <>
      <div className="app-container">
        <BrowserRouter>
          <div className="nav">
            <Navbar />
          </div>
          <div className="content">
            <Routes>
              <Route path="/" element={<Task />}></Route>
              <Route path="/dashboard" element={<Dashboard />}></Route>
              <Route path="/add" element={<NewProject />}></Route>
              <Route path="/update/:id" element={<Update />}></Route>
              <Route path="/login" element={<Login />}></Route>
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
