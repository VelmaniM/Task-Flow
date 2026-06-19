import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BsLayoutSidebar } from "react-icons/bs";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import Dashboard from "./components/dashboard/Dashboard";
import NewProject from "./components/addtask/Newproject";
import Update from "./components/update/Update";
import Task from "./components/tasklist/Task";
import Navbar from "./components/nav/Navbar";
import Login from "./components/login/Login";
import KanbanBoard from "./components/board/KanbanBoard";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("taskflow_user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const user = localStorage.getItem("taskflow_user");
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <Navbar isSidebarOpen={isSidebarOpen} />
      <div className={`main-content-area ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="top-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <button className="global-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <BsLayoutSidebar />
          </button>
          
          <button className="global-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
          </button>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter basename="/Task-Flow/">
      <Routes>
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Task />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/board" 
          element={
            <ProtectedRoute>
              <Layout>
                <KanbanBoard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add" 
          element={
            <ProtectedRoute>
              <Layout>
                <NewProject />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/update/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <Update />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
