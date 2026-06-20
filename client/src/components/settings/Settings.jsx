import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaPalette, FaTrashAlt, FaCheckDouble, FaDownload, FaDatabase, FaCamera, FaEdit, FaArrowLeft, FaPhone, FaBriefcase, FaIdCard, FaSave } from "react-icons/fa";
import "./Settings.css";

const Settings = ({ onClose, defaultView = "main" }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem("taskflow_theme") || "light");
  
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarMsg, setAvatarMsg] = useState("");
  const [showAvatarViewer, setShowAvatarViewer] = useState(false);

  // Sub-view state — initialized from prop so profile pic click opens edit directly
  const [view, setView] = useState(defaultView); // "main" or "edit-profile"
  const [editTaskname, setEditTaskname] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAvatarUrl(parsedUser.avatarUrl || "");
      setEditTaskname(parsedUser.taskname || parsedUser.name || "");
      setEditPhone(parsedUser.phone || "");
      setEditJobTitle(parsedUser.jobTitle || "");
      setEditBio(parsedUser.bio || "");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("taskflow_theme", newTheme);
    if (newTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("File size exceeds 2MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/avatar`, {
          email: user.email,
          avatarUrl: base64String
        });
        
        const serverAvatarUrl = response.data.user.avatarUrl;
        const updatedUser = { ...user, avatarUrl: serverAvatarUrl };
        localStorage.setItem("taskflow_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setAvatarUrl(serverAvatarUrl);
        
        window.dispatchEvent(new Event('storage'));
        
        setAvatarMsg("Profile picture updated successfully!");
        setTimeout(() => setAvatarMsg(""), 3000);
      } catch (err) {
        setAvatarMsg("Failed to update profile picture.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!avatarUrl) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/avatar`, {
        email: user.email,
        avatarUrl: ""
      });
      const updatedUser = { ...user, avatarUrl: "" };
      localStorage.setItem("taskflow_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarUrl("");
      window.dispatchEvent(new Event('storage'));
      setAvatarMsg("Profile photo removed.");
      setTimeout(() => setAvatarMsg(""), 3000);
    } catch (err) {
      setAvatarMsg("Failed to remove photo.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/profile`, {
        email: user.email,
        taskname: editTaskname,
        phone: editPhone,
        jobTitle: editJobTitle,
        bio: editBio
      });
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem("taskflow_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => {
        setProfileMsg("");
        setView("main");
      }, 1500);
    } catch (err) {
      setProfileMsg("Failed to update profile details.");
    }
  };

  const handleClearCompleted = async () => {
    if (window.confirm("Are you sure you want to delete all completed tasks?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/completed?userId=${user.email}`);
        alert("Completed tasks cleared successfully.");
        window.location.reload(); // Refresh to update UI
      } catch (err) {
        alert("Failed to clear tasks.");
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL tasks? This action cannot be undone.")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/all?userId=${user.email}`);
        alert("All tasks deleted successfully.");
        window.location.reload(); // Refresh to update UI
      } catch (err) {
        alert("Failed to delete tasks.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== user.email) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/account`, {
        data: { email: user.email }
      });
      localStorage.removeItem("taskflow_user");
      navigate("/login");
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data?userId=${user.email}`);
      const tasks = res.data;
      if (tasks.length === 0) {
        alert("No tasks to export.");
        return;
      }
      
      const headers = ["Task Name", "Description", "Status", "Priority", "Date", "Created At"];
      const csvRows = [];
      csvRows.push(headers.join(","));
      
      tasks.forEach(task => {
        const values = [
          `"${task.taskname || ''}"`,
          `"${task.description || ''}"`,
          `"${task.process || ''}"`,
          `"${task.priority || ''}"`,
          `"${task.createdDate || ''}"`,
          `"${task.created || ''}"`
        ];
        csvRows.push(values.join(","));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "taskflow_backup.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export data", err);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close-btn" onClick={onClose}>&times;</button>
        
        <div className="settings-modal-header">
          {view === "edit-profile" ? (
            <button className="back-settings-btn" onClick={() => setView("main")}>
              <FaArrowLeft /> Back
            </button>
          ) : (
            <h2>Settings</h2>
          )}
        </div>

        <div className="settings-modal-body">
          {view === "main" ? (
            <>
              {/* Profile Section Centered */}
              <div className="settings-profile-section">
                <div className="profile-image-container" onClick={() => setShowAvatarViewer(true)} title="View Profile Picture">
                  <img 
                    src={avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.email || "User")} 
                    alt="Profile" 
                    className="settings-profile-pic"
                  />
                  <div className="camera-overlay">
                    <FaCamera />
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                
                <div className="profile-info-center">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <h3>{user?.taskname || user?.name || "TaskFlow User"}</h3>
                    <button className="edit-profile-btn" onClick={() => setView("edit-profile")} title="Edit Details">
                      <FaEdit />
                    </button>
                  </div>
                  <p>{user?.email}</p>
                  {user?.jobTitle && <p className="profile-subtext">{user.jobTitle}</p>}
                  {avatarMsg && <div className="avatar-msg">{avatarMsg}</div>}
                </div>
              </div>

              <div className="settings-list-group">
                <div className="settings-list-item">
                  <div className="settings-item-left">
                    <div className="settings-icon theme-icon"><FaPalette /></div>
                    <div>
                      <h4>Appearance</h4>
                      <p>Choose your theme</p>
                    </div>
                  </div>
                  <div className="settings-item-right">
                    <select 
                      value={theme} 
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="settings-select"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                </div>

                <div className="settings-list-item">
                  <div className="settings-item-left">
                    <div className="settings-icon danger-icon"><FaTrashAlt /></div>
                    <div>
                      <h4>Clear Completed</h4>
                      <p>Remove all finished tasks</p>
                    </div>
                  </div>
                  <div className="settings-item-right">
                    <button className="settings-action-btn danger-outline" onClick={handleClearCompleted}>Clear</button>
                  </div>
                </div>

                <div className="settings-list-item">
                  <div className="settings-item-left">
                    <div className="settings-icon danger-icon"><FaCheckDouble /></div>
                    <div>
                      <h4>Clear All Data</h4>
                      <p>Delete every task permanently</p>
                    </div>
                  </div>
                  <div className="settings-item-right">
                    <button className="settings-action-btn danger-solid" onClick={handleClearAll}>Clear All</button>
                  </div>
                </div>

                <div className="settings-list-item">
                  <div className="settings-item-left">
                    <div className="settings-icon export-icon"><FaDownload /></div>
                    <div>
                      <h4>Export Data</h4>
                      <p>Download tasks as CSV</p>
                    </div>
                  </div>
                  <div className="settings-item-right">
                    <button className="settings-action-btn primary-outline" onClick={handleExportCSV}>Export</button>
                  </div>
                </div>
              </div>

              <div className="settings-list-group danger-zone">
                <div className="settings-list-item delete-account-item">
                  <div className="settings-item-left">
                    <div className="settings-icon danger-icon"><FaDatabase /></div>
                    <div>
                      <h4>Delete Account</h4>
                      <p>Permanently remove your account</p>
                    </div>
                  </div>
                  <div className="delete-account-form">
                    <input 
                      type="email" 
                      placeholder="Type email to confirm" 
                      value={deleteEmailConfirm}
                      onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                      className="premium-input settings-input"
                    />
                    <button 
                      className="settings-action-btn danger-solid" 
                      onClick={handleDeleteAccount}
                      disabled={deleteEmailConfirm !== user?.email}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <h3>Edit Profile Details</h3>
              <p className="form-desc">Provide your display name and contact details.</p>
              
              <div className="input-group">
                <label><FaUserCircle style={{marginRight: "0.4rem"}} /> Display Name</label>
                <input 
                  type="text" 
                  value={editTaskname}
                  onChange={(e) => setEditTaskname(e.target.value)}
                  className="premium-input"
                  required
                />
              </div>

              <div className="input-group">
                <label><FaPhone style={{marginRight: "0.4rem"}} /> Phone Number</label>
                <input 
                  type="tel" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="premium-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="input-group">
                <label><FaBriefcase style={{marginRight: "0.4rem"}} /> Job Title</label>
                <input 
                  type="text" 
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  className="premium-input"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="input-group">
                <label><FaIdCard style={{marginRight: "0.4rem"}} /> Bio</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="premium-input settings-textarea"
                  placeholder="Write a brief bio about yourself"
                  rows="3"
                />
              </div>

              {profileMsg && <p className="success-message" style={{color: "var(--success-color)"}}>{profileMsg}</p>}

              <button type="submit" className="premium-btn settings-save-btn">
                <FaSave style={{marginRight: "0.5rem"}} /> Save Details
              </button>
            </form>
          )}
        </div>
      </div>

      {showAvatarViewer && (
        <div className="avatar-viewer-overlay" onClick={() => setShowAvatarViewer(false)}>
          <div className="avatar-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="viewer-close-btn" onClick={() => setShowAvatarViewer(false)}>&times;</button>
            
            <img 
              src={avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.email || "User")} 
              alt="Full Profile" 
              className="viewer-img"
            />
            
            <div className="viewer-actions">
              <button 
                className="viewer-btn change-btn" 
                onClick={() => {
                  fileInputRef.current.click();
                  setShowAvatarViewer(false);
                }}
              >
                Change Photo
              </button>
              {avatarUrl && (
                <button 
                  className="viewer-btn delete-btn" 
                  onClick={() => {
                    handleRemovePhoto();
                    setShowAvatarViewer(false);
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Settings;
