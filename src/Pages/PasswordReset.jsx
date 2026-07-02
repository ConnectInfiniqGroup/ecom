import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";

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

// import Logo from "../Assets/Images/image.jpeg";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Track if form has been submitted to show validation errors
  const [formSubmitted, setFormSubmitted] = useState(false);

  // State for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dynamic email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Get email validation message
  const getEmailValidationMessage = (email) => {
    if (!email) return "Email is required";

    const parts = email.split("@");

    if (parts.length !== 2) {
      return "Email must contain exactly one @ symbol";
    }

    const [localPart, domain] = parts;

    if (!localPart) {
      return "Email must have characters before @";
    }

    if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
      return "Username part can only contain letters, numbers, dots, underscores, %, +, and -";
    }

    if (!domain) {
      return "Email must have a domain after @";
    }

    const domainParts = domain.split(".");
    if (domainParts.length < 2) {
      return "Domain must have at least one dot (.)";
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Top-level domain (TLD) must be at least 2 characters";
    }

    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      return "Top-level domain (TLD) must contain only letters";
    }

    const domainName = domainParts.slice(0, -1).join(".");
    if (domainName && !/^[a-zA-Z0-9.-]+$/.test(domainName)) {
      return "Domain name can only contain letters, numbers, dots, and hyphens";
    }

    return "";
  };

  // Function to hide success message after 5 seconds
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess("");
    }, 5000);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate email only when form is submitted
    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(getEmailValidationMessage(email));
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/forgot-password", { email });

      if (response.data.status === 200) {
        setToken(response.data.token);
        setFormSubmitted(false); // Reset form submitted state on success
        setStep(2);
        showSuccessMessage(
          "OTP sent to your email address. Check your spam folder if not received.",
        );
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      let errorMessage = "Failed to process your request. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Email not found. Please check your email address.";
      } else if (error.response?.status === 422) {
        errorMessage =
          "Invalid email format. Please enter a valid email address.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setStep(3);
    showSuccessMessage("OTP verified! Please set your new password.");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/reset-password", {
        email,
        otp,
        token,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (response.data.status === 200) {
        showSuccessMessage(
          "Password reset successfully! Redirecting to login...",
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      let errorMessage = "Failed to reset password";

      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          errorMessage = Object.values(validationErrors).flat().join(", ");
        }
      }

      if (error.response?.status === 400) {
        errorMessage = "Invalid OTP or token. Please try again.";
      } else if (error.response?.status === 422) {
        errorMessage =
          errorMessage || "Validation failed. Please check your input.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/forgot-password", { email });

      if (response.data.status === 200) {
        setToken(response.data.token);
        showSuccessMessage("OTP resent successfully. Check your email.");
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Custom error display component
  const ValidationError = ({ message }) => {
    if (!message) return null;
    return <div className="text-danger small mt-1">{message}</div>;
  };

  return (
    <div className="container-fluid px-0 text-start" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <PageHeader title="Password Reset" path="Home / Password Reset" />

      <div className="container py-5 mt-4" style={{ minHeight: "70vh" }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border rounded-3 p-4 p-md-5 shadow-sm bg-white">
              {/* Card Header with Branding */}
              <div className="text-center mb-4 pb-2 border-bottom">
                <span
                  className="mb-3 d-inline-block fw-bold"
                  style={{ height: "50px", lineHeight: "50px" }}
                >
                  Demo Logo
                </span>
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle text-danger bg-light mb-2" style={{ width: "60px", height: "60px" }}>
                  <i className="bi bi-shield-lock fs-2"></i>
                </div>
                <h4 className="fw-bold heading text-dark mt-2">Password Recovery</h4>
                <p className="text-secondary small mb-0">Recover your account credentials securely</p>
              </div>

              {/* Status Notifications */}
              {error && !formSubmitted && (
                <div className="alert alert-danger border-0 py-2 px-3 mb-3 small rounded-3 d-flex align-items-center gap-2">
                  <i className="bi bi-x-circle-fill"></i>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success border-0 py-2 px-3 mb-3 small rounded-3 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{success}</span>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <form onSubmit={handleEmailSubmit} noValidate>
                  <div className="form-group mb-4">
                    <label htmlFor="email" className="form-label fw-bold text-dark small mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-control ${error && formSubmitted ? "is-invalid" : ""}`}
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formSubmitted) {
                          setFormSubmitted(false);
                          setError("");
                        }
                      }}
                      disabled={isLoading}
                    />
                    {error && formSubmitted && (
                      <ValidationError message={error} />
                    )}
                    <small className="text-muted mt-2 d-block small" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                      We will send a 6-digit verification OTP (One Time Password) to this email address to confirm your identity.
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 fw-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none small p-0 text-muted"
                      onClick={() => navigate("/login")}
                    >
                      <i className="bi bi-arrow-left"></i> Return to Login
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Verify OTP */}
              {step === 2 && (
                <form onSubmit={handleOtpSubmit} noValidate>
                  <div className="form-group mb-4">
                    <label htmlFor="otp" className="form-label fw-bold text-dark small mb-1">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      id="otp"
                      className={`form-control text-center tracking-widest fw-bold fs-5 ${error ? "is-invalid" : ""}`}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      placeholder="• • • • • •"
                      required
                      disabled={isLoading}
                    />
                    {error && <ValidationError message={error} />}
                    <small className="text-muted mt-2 d-block text-center small" style={{ fontSize: "0.8rem" }}>
                      Please enter the 6-digit code sent to your email.
                    </small>
                  </div>

                  <div className="d-flex gap-3 mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50 py-2.5 fw-bold"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary w-50 py-2.5 fw-bold"
                      disabled={isLoading || otp.length !== 6}
                    >
                      Verify
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none small p-0 fw-semibold"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Didn't receive OTP? Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {step === 3 && (
                <form onSubmit={handlePasswordSubmit} noValidate>
                  {/* New Password */}
                  <div className="form-group mb-3">
                    <label htmlFor="newPassword" className="form-label fw-bold text-dark small mb-1">
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        required
                        minLength={8}
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light text-muted"
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        style={{ borderColor: "#ced4da" }}
                      >
                        <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-bold text-dark small mb-1">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-secondary border-start-0 bg-light text-muted"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ borderColor: "#ced4da" }}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {error && <ValidationError message={error} />}
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50 py-2.5 fw-bold"
                      onClick={() => setStep(2)}
                      disabled={isLoading}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary w-50 py-2.5 fw-bold"
                      disabled={
                        isLoading ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                      }
                    >
                      {isLoading ? "Saving..." : "Save Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;