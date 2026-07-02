import React, { useState, useEffect, useCallback, memo } from "react";
import { Helmet } from "react-helmet-async";
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


// Password strength indicator component
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[!@#$%^&*]/.test(pass)) strength += 1;
    return strength;
  };

  const getStrengthText = (strength) => {
    switch(strength) {
      case 0: return { text: "Very Weak", color: "#dc3545", width: "20%" };
      case 1: return { text: "Weak", color: "#ffc107", width: "40%" };
      case 2: return { text: "Fair", color: "#fd7e14", width: "60%" };
      case 3: return { text: "Good", color: "#20c997", width: "80%" };
      case 4: return { text: "Strong", color: "#198754", width: "90%" };
      case 5: return { text: "Very Strong", color: "#0f5132", width: "100%" };
      default: return { text: "", color: "#e9ecef", width: "0%" };
    }
  };

  if (!password) return null;

  const strength = getStrength(password);
  const strengthInfo = getStrengthText(strength);

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between mb-1">
        <small className="text-muted">Password Strength:</small>
        <small style={{ color: strengthInfo.color, fontWeight: "bold" }}>{strengthInfo.text}</small>
      </div>
      <div className="progress" style={{ height: "5px" }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: strengthInfo.width,
            backgroundColor: strengthInfo.color,
            transition: "width 0.3s ease"
          }}
          aria-valuenow={parseInt(strengthInfo.width)}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

// Validation functions
const validateField = (fieldName, value) => {
  const patterns = {
    firstname: /^[A-Za-z]+$/,
    lastname: /^[A-Za-z]+$/,
    phone: /^\d+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
  };

  const messages = {
    firstname: "First name can only contain letters",
    lastname: "Last name can only contain letters",
    phone: "Phone number can only contain digits",
    email: "Please enter a valid email address",
    password: "Password must be at least 6 characters with one uppercase letter, one number, and one special character (!@#$%^&*)",
  };

  if (!value && fieldName !== 'password' && fieldName !== 'new_password' && fieldName !== 'current_password') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (value && patterns[fieldName] && !patterns[fieldName].test(value)) {
    return { isValid: false, message: messages[fieldName] };
  }

  return { isValid: true, message: "" };
};

// PasswordInput component
const PasswordInput = memo(({ 
  label, 
  id, 
  placeholder, 
  value, 
  onChange, 
  showPassword, 
  setShowPassword,
  error,
  onBlur,
  showStrength = false
}) => {
  const handleToggle = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  return (
    <div className="form-group mb-3">
      <label htmlFor={id} className="form-label fw-bold text-dark small mb-1">
        {label}
      </label>
      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="off"
        />
        <button
          className="btn btn-outline-secondary border-start-0 bg-light text-muted"
          type="button"
          onClick={handleToggle}
          style={{ borderColor: "#ced4da" }}
        >
          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {showStrength && value && <PasswordStrengthIndicator password={value} />}
    </div>
  );
});

// InputField wrapper
const ValidatedInputField = memo(({ 
  label, 
  type, 
  id, 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  required,
  disabled,
  error
}) => {
  return (
    <div className="form-group mb-3">
      <label htmlFor={id} className="form-label fw-bold text-dark small mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
});

const UserProfile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [gender, setGender] = useState("male");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const validation = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: validation.message }));
  };

  const validatePasswordConfirmation = () => {
    if (formData.new_password && formData.new_password !== formData.new_password_confirmation) {
      setErrors(prev => ({ 
        ...prev, 
        new_password_confirmation: "Passwords do not match" 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, new_password_confirmation: "" }));
    return true;
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/user");
      if (response.data && response.data.user) {
        const user = response.data.user;
        setFormData({
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          phone: user.phone || "",
          email: user.email || "",
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (error) {
      let errorMessage = "Failed to fetch user profile.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "var(--brand-primary)",
      });
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }

    if (id === 'new_password' || id === 'new_password_confirmation') {
      validatePasswordConfirmation();
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    const fields = ['firstname', 'lastname', 'phone'];
    
    fields.forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsLoading(true);
    try {
      const dataToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        email: formData.email,
      };

      const response = await api.post("/profile/edit", dataToSend);

      await Swal.fire({
        title: "Success!",
        html: response.data?.message || "Profile updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setTouched({});
    } catch (error) {
      let errorMessage = "An error occurred while updating profile.";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "var(--brand-primary)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password fields
    const newErrors = {};
    if (!formData.current_password) newErrors.current_password = "Current password is required";
    
    const newPassVal = validateField('password', formData.new_password);
    if (!newPassVal.isValid) newErrors.new_password = newPassVal.message;

    if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsPasswordLoading(true);
    try {
      const dataToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation,
      };

      const response = await api.post("/profile/edit", dataToSend);

      await Swal.fire({
        title: "Success!",
        html: response.data?.message || "Password updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      }));
      setTouched({});
    } catch (error) {
      let errorMessage = "Failed to update password.";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "var(--brand-primary)",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSidebarClick = (tabId) => {
    localStorage.setItem("dashboardActiveTab", tabId);
    navigate("/dashboard");
  };

  const confirmLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--brand-primary)",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          // ignore
        }
        localStorage.clear();
        window.dispatchEvent(new CustomEvent('auth-failed'));
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Edit Profile | TechStore Alarm Systems</title>
      </Helmet>

      <PageHeader title="My Profile" path="Home / Profile" />

      <div className="container py-5 text-start" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        <div className="row g-4">
          {/* Left Column: Sidebar Navigation */}
          <div className="col-md-3">
            <div className="bg-white border rounded-3 shadow-sm overflow-hidden mb-4 mb-md-0">
              <div className="d-flex align-items-center p-3 gap-3 border-bottom bg-light">
                <div 
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                  style={{ width: "48px", height: "48px", fontSize: "18px", overflow: "hidden" }}
                >
                  <span>{formData.firstname?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "14px" }}>
                    {formData.firstname} {formData.lastname}
                  </p>
                  <p className="mb-0 text-muted small text-truncate">
                    {formData.email}
                  </p>
                </div>
              </div>

              <ul className="list-group list-group-flush m-0">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
                  { id: "notifications", label: "Notifications", icon: "bi-bell" },
                  { id: "orders", label: "My Orders", icon: "bi-bag-check" },
                  { id: "unpaidOrders", label: "Unpaid Orders", icon: "bi-bag-x" },
                  { id: "refund", label: "Refund History", icon: "bi-clock-history" },
                  { id: "addresses", label: "Addresses", icon: "bi-geo-alt" },
                  { id: "approvedReviews", label: "My Reviews", icon: "bi-star" },
                  { id: "reviews", label: "To Be Reviewed", icon: "bi-chat-left-text" },
                ].map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item border-0 py-3 px-4 d-flex align-items-center gap-3 cursor-pointer text-dark hover-bg-light"
                    onClick={() => handleSidebarClick(item.id)}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <i className={`bi ${item.icon} fs-5 text-secondary`}></i>
                    <span style={{ fontSize: "14px" }}>{item.label}</span>
                    <i className="bi bi-chevron-right text-muted ms-auto small" style={{ fontSize: "10px" }}></i>
                  </li>
                ))}
                
                <li
                  className="list-group-item border-0 py-3 px-4 d-flex align-items-center gap-3 cursor-pointer text-primary border-start border-4 border-primary bg-light fw-bold"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-person fs-5 text-primary"></i>
                  <span style={{ fontSize: "14px" }}>Account Details</span>
                  <i className="bi bi-chevron-right text-primary ms-auto small" style={{ fontSize: "10px" }}></i>
                </li>

                <li
                  className="list-group-item border-0 py-3 px-4 d-flex align-items-center gap-3 text-danger fw-semibold cursor-pointer hover-bg-light"
                  onClick={confirmLogout}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                >
                  <i className="bi bi-box-arrow-right fs-5"></i>
                  <span style={{ fontSize: "14px" }}>Logout</span>
                  <i className="bi bi-chevron-right text-danger ms-auto small" style={{ fontSize: "10px" }}></i>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Profile Content Panels */}
          <div className="col-md-9">
            <div className="row g-4">
              {/* Personal Information */}
              <div className="col-lg-6">
                <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                  <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                    Personal Information
                  </h5>
                  
                  <form onSubmit={handleProfileSubmit}>
                    <ValidatedInputField
                      label="First Name"
                      type="text"
                      id="firstname"
                      placeholder="Enter Your First Name"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('firstname')}
                      error={touched.firstname ? errors.firstname : ''}
                      required
                    />

                    <ValidatedInputField
                      label="Last Name"
                      type="text"
                      id="lastname"
                      placeholder="Enter Your Last Name"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('lastname')}
                      error={touched.lastname ? errors.lastname : ''}
                      required
                    />

                    <ValidatedInputField
                      label="Email Address"
                      type="email"
                      id="email"
                      placeholder="Enter Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      disabled
                    />

                    <ValidatedInputField
                      label="Phone Number"
                      type="text"
                      id="phone"
                      placeholder="Enter Your Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone ? errors.phone : ''}
                      required
                    />

                    <div className="form-group mb-4">
                      <label htmlFor="gender" className="form-label fw-bold text-dark small mb-1">
                        Gender
                      </label>
                      <select
                        id="gender"
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2.5 fw-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating Profile...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Change Password */}
              <div className="col-lg-6">
                <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                  <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                    Change Password
                  </h5>

                  <form onSubmit={handlePasswordSubmit}>
                    <PasswordInput
                      label="Current Password"
                      id="current_password"
                      placeholder="Enter Your Current Password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('current_password')}
                      showPassword={showCurrentPassword}
                      setShowPassword={setShowCurrentPassword}
                      error={touched.current_password ? errors.current_password : ''}
                    />

                    <PasswordInput
                      label="New Password"
                      id="new_password"
                      placeholder="Enter Your New Password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('new_password')}
                      showPassword={showNewPassword}
                      setShowPassword={setShowNewPassword}
                      error={touched.new_password ? errors.new_password : ''}
                      showStrength={true}
                    />

                    <PasswordInput
                      label="Confirm Password"
                      id="new_password_confirmation"
                      placeholder="Re-enter Your New Password"
                      value={formData.new_password_confirmation}
                      onChange={handleInputChange}
                      onBlur={() => {
                        handleBlur('new_password_confirmation');
                        validatePasswordConfirmation();
                      }}
                      showPassword={showConfirmPassword}
                      setShowPassword={setShowConfirmPassword}
                      error={touched.new_password_confirmation ? errors.new_password_confirmation : ''}
                    />

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2.5 fw-bold"
                      disabled={isPasswordLoading}
                      style={{ marginTop: "32px" }}
                    >
                      {isPasswordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;