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
import TaskBoard from "./components/board/TaskBoard";
import Settings from "./components/settings/Settings";
import ForgotPassword from "./components/login/ForgotPassword";

const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem("taskflow_user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const user = sessionStorage.getItem("taskflow_user");
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Layout = ({ children, isDarkMode, setIsDarkMode }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsDefaultView, setSettingsDefaultView] = useState("main");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("taskflow_sidebar");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("taskflow_sidebar", isSidebarOpen);
  }, [isSidebarOpen]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read user on mount
    const storedUser = sessionStorage.getItem("taskflow_user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // Listen for changes
    const handleStorageChange = () => {
      const updatedUser = sessionStorage.getItem("taskflow_user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openSettings = (view = "main") => {
    setSettingsDefaultView(view);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar isSidebarOpen={isSidebarOpen} onOpenSettings={() => openSettings("main")} />
      <div className={`main-content-area ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)" }}>
          <button className="global-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <BsLayoutSidebar />
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="global-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
            {user && (
              <img 
                src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.email} 
                alt="Profile" 
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", cursor: "pointer", border: "2px solid var(--primary-color)" }}
                onClick={() => openSettings("edit-profile")}
                title="View Profile"
              />
            )}
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
      {isSettingsModalOpen && (
        <Settings 
          onClose={() => setIsSettingsModalOpen(false)} 
          defaultView={settingsDefaultView}
        />
      )}
    </div>
  );
};


function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("taskflow_theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("taskflow_theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("taskflow_theme", "light");
    }
  }, [isDarkMode]);

  // Disable right-click globally for safety
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <BrowserRouter>
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
          path="/forgot-password" 
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Task />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/board" 
          element={
            <ProtectedRoute>
              <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <TaskBoard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add" 
          element={
            <ProtectedRoute>
              <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <NewProject />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/update/:id" 
          element={
            <ProtectedRoute>
              <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
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
