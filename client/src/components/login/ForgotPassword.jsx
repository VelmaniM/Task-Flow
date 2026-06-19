import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiHash } from "react-icons/fi";
import "./Login.css"; // Reuse login styles

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/request-otp`, { email });
      setMessage(res.data.message || "OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      setMessage("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left side brand banner */}
      <div className="login-left">
        <div className="login-left-content">
          <h1>Reset your password.</h1>
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
        <div className="login-form-wrapper">
          <button 
            onClick={() => navigate("/login")} 
            className="back-to-login-btn"
          >
            <FaArrowLeft /> Back to Login
          </button>
          
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
            <h2>Reset Password</h2>
            <p>
              {step === 1 ? "Enter your email to receive an OTP code" : "Enter the 6-digit OTP and your new password"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
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
              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message" style={{color: "var(--success-color)", fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem"}}>{message}</p>}
              <button type="submit" className="login-btn" style={{width: "100%"}} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="input-group">
                <label htmlFor="otp">6-Digit OTP</label>
                <div className="input-with-icon-wrapper">
                  <FiHash className="input-icon" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="premium-input with-icon"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-with-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    className="premium-input with-icon password-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
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
              </div>
              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message" style={{color: "var(--success-color)", fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem"}}>{message}</p>}
              <button type="submit" className="login-btn" style={{width: "100%"}} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

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

export default ForgotPassword;
