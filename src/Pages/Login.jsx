import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";
import { useCart } from "../Components/CartContext";

const api = {
  get: async (url) => {
    console.log("Local mock GET:", url);
    if (url.includes("getcategory")) {
      return { data: [
        { category_id: 1, categoryname: "Laptops", slug: "laptops" },
        { category_id: 2, categoryname: "Smartphones", slug: "smartphones" },
        { category_id: 3, categoryname: "Accessories", slug: "accessories" }
      ] };
    }
    if (url.includes("cart/view")) {
      return { data: { data: { items: [], cart_total: 0, cart_count: 0 } } };
    }
    return { data: { data: [], products: [], items: [], cart_total: 0, cart_count: 0, average_rating: 5, total_reviews: 10 } };
  },
  post: async (url, data) => {
    console.log("Local mock POST:", url, data);
    return { data: { success: true, token: "demo_token", data: { role_id: 2, full_name: "Demo User", email: "demo@example.com" } } };
  }
};

import Logo from "../Assets/Images/logo.png";

const Login = ({ setIsLoggedIn }) => {
  const [loginInput, setLogin] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { syncGuestCartAfterLogin } = useCart();
  const from = location.state?.from || "/dashboard";

  const handleInput = (e) => {
    setLogin({ ...loginInput, [e.target.name]: e.target.value });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const loginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await api.post(`/login`, {
        email: loginInput.email,
        password: loginInput.password,
      });

      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        localStorage.setItem("role", res.data.data.role_id);
        localStorage.setItem("login_time", Date.now().toString());
        localStorage.setItem("dashboardActiveTab", "dashboard");
        
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        }
        
        if (syncGuestCartAfterLogin) {
          await syncGuestCartAfterLogin();
        }
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 404) {
        setError("Service not available. Please try again later.");
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages[0] || "Login failed");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Login" path="Home / Login" />
      
      <div className="container-fluid py-5" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        <div className="row justify-content-center align-items-center py-4">
          <div className="col-12" style={{ maxWidth: "480px" }}>
            <div className="bg-white border rounded-3 p-5 shadow-sm text-start">
              {/* Centered Logo */}
              <div className="text-center mb-4">
                <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "100px", objectFit: "contain" }} />
                <h3 className="fw-bold mt-3 mb-1 text-dark" style={{ color: "var(--brand-primary)" }}>Welcome Back 👋</h3>
                <p className="text-muted small">Enter your details to log in to your account</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3 rounded-3 text-center small" role="alert">
                  <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
                </div>
              )}

              <form onSubmit={loginSubmit}>
                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold text-dark small mb-1">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control border-start-0 py-2.5"
                      placeholder="name@example.com"
                      value={loginInput.email}
                      onChange={handleInput}
                      required
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-baseline mb-1">
                    <label htmlFor="password" className="form-label fw-bold text-dark small m-0">
                      Password
                    </label>
                    <Link
                      className="text-primary small text-decoration-none"
                      to="/reset-password"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-control border-start-0 border-end-0 py-2.5"
                      placeholder="••••••••"
                      value={loginInput.password}
                      onChange={handleInput}
                      required
                    />
                    <button
                      type="button"
                      className="btn border bg-light text-muted border-start-0 py-2.5"
                      onClick={togglePasswordVisibility}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-100 py-3 fw-bold mb-4"
                  style={{ fontSize: "15px" }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>

                {/* Social Login Placeholders */}
                <div className="text-center mb-4">
                  <div className="position-relative my-4">
                    <hr className="text-muted" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">or sign in with</span>
                  </div>
                  <div className="d-flex justify-content-center gap-3">
                    <button type="button" className="btn btn-outline-secondary py-2.5 px-3 flex-grow-1" style={{ fontSize: "14px" }}>
                      <i className="bi bi-google me-2 text-danger"></i> Google
                    </button>
                    <button type="button" className="btn btn-outline-secondary py-2.5 px-3 flex-grow-1" style={{ fontSize: "14px" }}>
                      <i className="bi bi-apple me-2 text-dark"></i> Apple
                    </button>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center mt-3 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary fw-bold text-decoration-none">
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;