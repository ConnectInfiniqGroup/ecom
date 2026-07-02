import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";
import Swal from "sweetalert2";

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

const Register = () => {
  const navigate = useNavigate();

  const [registerInput, setRegisterInput] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    error_list: {},
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e) => {
    setRegisterInput({
      ...registerInput,
      [e.target.name]: e.target.value,
    });
  };

  const registerSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const data = {
      firstname: registerInput.firstname,
      lastname: registerInput.lastname,
      email: registerInput.email,
      phone: registerInput.phone,
      password: registerInput.password,
      password_confirmation: registerInput.confirm_password,
      role_id: 2,
    };

    try {
      const res = await api.post(`/register`, data);

      if (res.status === 200) {
        localStorage.setItem("auth_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        localStorage.setItem("role", res.data.data.role_id);

        await Swal.fire({
          title: "Register Successfully!",
          text: "Your account has been created successfully.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        setRegisterInput({
          ...registerInput,
          error_list: error.response.data.errors || {},
        });

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text:
            error.response.data.message ||
            "Please check your details and try again.",
          confirmButtonColor: "var(--brand-primary)",
        });
      } else if (error.request) {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "No response from server. Please try again later.",
          confirmButtonColor: "var(--brand-primary)",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "var(--brand-primary)",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Register" path="Home / Register" />

      <div className="container-fluid py-5" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        <div className="row justify-content-center align-items-center py-4">
          <div className="col-12" style={{ maxWidth: "600px" }}>
            <div className="bg-white border rounded-3 p-5 shadow-sm text-start">
              {/* Centered Logo */}
              <div className="text-center mb-4">
                <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "100px", objectFit: "contain" }} />
                <h3 className="fw-bold mt-3 mb-1 text-dark" style={{ color: "var(--brand-primary)" }}>Create An Account 🚀</h3>
                <p className="text-muted small">Sign up for a free account to start shopping</p>
              </div>

              <form onSubmit={registerSubmit}>
                {/* Name Row */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="firstname" className="form-label fw-bold text-dark small mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="form-control py-2.5"
                      id="firstname"
                      name="firstname"
                      placeholder="John"
                      value={registerInput.firstname}
                      onChange={handleInput}
                      required
                    />
                    <span className="text-danger small">
                      {registerInput.error_list.firstname ? registerInput.error_list.firstname[0] : ""}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="lastname" className="form-label fw-bold text-dark small mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="form-control py-2.5"
                      id="lastname"
                      name="lastname"
                      placeholder="Doe"
                      value={registerInput.lastname}
                      onChange={handleInput}
                      required
                    />
                    <span className="text-danger small">
                      {registerInput.error_list.lastname ? registerInput.error_list.lastname[0] : ""}
                    </span>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="email" className="form-label fw-bold text-dark small mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control py-2.5"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      value={registerInput.email}
                      onChange={handleInput}
                      required
                    />
                    <span className="text-danger small">
                      {registerInput.error_list.email ? registerInput.error_list.email[0] : ""}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="phone" className="form-label fw-bold text-dark small mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control py-2.5"
                      id="phone"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={registerInput.phone}
                      onChange={handleInput}
                      required
                    />
                    <span className="text-danger small">
                      {registerInput.error_list.phone ? registerInput.error_list.phone[0] : ""}
                    </span>
                  </div>
                </div>

                {/* Password Row */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label htmlFor="password" className="form-label fw-bold text-dark small mb-1">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-end-0 py-2.5"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={registerInput.password}
                        onChange={handleInput}
                        required
                      />
                      <button
                        type="button"
                        className="btn border bg-light text-muted border-start-0 py-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                      </button>
                    </div>
                    <span className="text-danger small">
                      {registerInput.error_list.password ? registerInput.error_list.password[0] : ""}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="confirm_password" className="form-label fw-bold text-dark small mb-1">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-end-0 py-2.5"
                        id="confirm_password"
                        name="confirm_password"
                        placeholder="••••••••"
                        value={registerInput.confirm_password}
                        onChange={handleInput}
                        required
                      />
                      <button
                        type="button"
                        className="btn border bg-light text-muted border-start-0 py-2.5"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                      </button>
                    </div>
                    <span className="text-danger small">
                      {registerInput.error_list.password_confirmation ? registerInput.error_list.password_confirmation[0] : ""}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-100 py-3 fw-bold mb-4"
                  style={{ fontSize: "15px" }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>

                {/* Social Placeholders */}
                <div className="text-center mb-4">
                  <div className="position-relative my-4">
                    <hr className="text-muted" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">or sign up with</span>
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

                {/* Login Link */}
                <div className="text-center mt-3 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                      Log in here
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

export default Register;