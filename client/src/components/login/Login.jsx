import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiUser, FiPhone, FiBriefcase, FiAlignLeft } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle state
  
  // Registration optional fields
  const [taskname, setTaskname] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/login`, {
        email,
        password,
        taskname: isSignUp ? taskname : undefined,
        phone: isSignUp ? phone : undefined,
        jobTitle: isSignUp ? jobTitle : undefined,
        bio: isSignUp ? bio : undefined
      });

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("taskflow_user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left side brand banner */}
      <div className="login-left">
        <div className="login-left-content">
          <h1>Streamline your daily workflow.</h1>
          <p>
            An intuitive platform designed to manage tasks, collaborate with team members, and track project progress in real-time.
          </p>
          
          {/* Animated 3D Character Illustration */}
          <div className="login-illustration-container">
            <img 
              src={`${import.meta.env.BASE_URL}login-character.png`} 
              className="login-illustration" 
              alt="Task Management Character" 
            />
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="login-right">
        <div className={`login-form-wrapper ${isSignUp ? "signup-mode" : ""}`}>
          
          {/* Brand Logo & Name */}
          <div className="brand-logo-container">
            <svg className="logo-icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13"></path>
              <path d="M8 12h13"></path>
              <path d="M8 18h13"></path>
              <path d="M3 6h.01"></path>
              <path d="M3 12h.01"></path>
              <path d="M3 18h.01"></path>
            </svg>
            <span className="brand-name">TaskFlow</span>
          </div>

          <div className="login-header">
            <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p>{isSignUp ? "Sign up to start organizing your work" : "Enter your credentials to access your dashboard"}</p>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-grid">
              
              {/* Optional Registration Fields at the TOP */}
              {isSignUp && (
                <>
                  <div className="input-group">
                    <label htmlFor="taskname">Display Name *</label>
                    <div className="input-with-icon-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        id="taskname"
                        name="taskname"
                        className="premium-input with-icon"
                        placeholder="Enter your name"
                        value={taskname}
                        onChange={(e) => setTaskname(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-with-icon-wrapper">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="premium-input with-icon"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Core Credentials Fields */}
              <div className="input-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-with-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="premium-input with-icon"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password *</label>
                <div className="input-with-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="premium-input with-icon password-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="forgot-password-link-container">
                    <span 
                      className="forgot-password-link"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot Password?
                    </span>
                  </div>
                )}
              </div>

              {/* Remaining Optional Registration Fields */}
              {isSignUp && (
                <>
                  <div className="input-group">
                    <label htmlFor="jobTitle">Job Title</label>
                    <div className="input-with-icon-wrapper">
                      <FiBriefcase className="input-icon" />
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        className="premium-input with-icon"
                        placeholder="e.g. Developer, Designer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        autoComplete="organization-title"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="bio">Bio</label>
                    <div className="input-with-icon-wrapper">
                      <FiAlignLeft className="input-icon" />
                      <input
                        type="text"
                        id="bio"
                        name="bio"
                        className="premium-input with-icon"
                        placeholder="Tell us about yourself"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="login-footer">
              <span 
                className="toggle-auth-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(""); // Clear error when toggling
                }}
              >
                {isSignUp ? "Sign in instead" : "Create account"}
              </span>
              
              <button 
                type="submit" 
                className="login-btn" 
                disabled={loading}
              >
                {loading ? (isSignUp ? "Creating..." : "Next...") : (isSignUp ? "Sign Up" : "Next")}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="login-footer-links">
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Conditions</a>
            <span className="divider">•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
