import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";

const ContactForm = () => {
  const contactDetails = [
    {
      icon: "bi bi-telephone",
      title: "Phone Number",
      text: "043 317 2345",
      link: "tel:0433172345",
      isExternal: false,
    },
    {
      icon: "bi bi-envelope",
      title: "Email Address",
      text: "info@TechStoregroup.biz",
      link: "mailto:info@TechStoregroup.biz",
      isExternal: false,
    },
    {
      icon: "bi bi-geo-alt",
      title: "Office Address",
      text: "15/51 Meacher Street, Mt. Druitt 2770, NSW",
      link: "https://www.google.com/maps?q=15/51+Meacher+Street,+Mount+Druitt+NSW+2770,+Australia",
      isExternal: true,
    },
    {
      icon: "bi bi-clock",
      title: "Working Hours",
      text: "Mon - Sat: 9:00 AM - 6:00 PM / Sun: Closed",
      link: "#",
      isExternal: false,
    }
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const recaptchaRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);

  const validationRules = {
    fullName: {
      pattern: /^[a-zA-Z\s]{3,50}$/,
      message: "Name should be 3-50 letters and spaces only",
    },
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email address",
    },
    phone: {
      pattern: /^\d{10}$/,
      message: "Phone number must be 10 digits",
    },
    subject: {
      pattern: /^.{3,100}$/,
      message: "Subject must be 3-100 characters",
    },
    message: {
      pattern: /^.{10,500}$/,
      message: "Message must be 10-500 characters",
    },
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    if (validationRules[id] && !validationRules[id].pattern.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: validationRules[id].message,
      }));
    } else {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.recaptcha;
      return newErrors;
    });
  };

  const handleMessageFocus = () => {
    setShowRecaptcha(true);
  };

  useEffect(() => {
    if (
      showRecaptcha &&
      window.grecaptcha &&
      recaptchaRef.current &&
      recaptchaWidgetIdRef.current === null
    ) {
      recaptchaWidgetIdRef.current = window.grecaptcha.render(
        recaptchaRef.current,
        {
          sitekey: "6LcthwgtAAAAAJp86Y-2ILTgCRHRQcRkAerMs5J4",
          callback: handleRecaptchaChange,
        },
      );
    }
  }, [showRecaptcha]);

  useEffect(() => {
    if (window.grecaptcha) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "This field is required";
      } else if (
        validationRules[key] &&
        !validationRules[key].pattern.test(formData[key])
      ) {
        newErrors[key] = validationRules[key].message;
      }
    });

    if (showRecaptcha && !recaptchaValue) {
      newErrors.recaptcha = "Please complete the reCAPTCHA";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert("Form submitted successfully!");

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setErrors({});
    setRecaptchaValue(null);
    setShowRecaptcha(false);

    if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
      window.grecaptcha.reset(recaptchaWidgetIdRef.current);
      recaptchaWidgetIdRef.current = null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | TechStore Alarm Systems</title>
        <meta
          name="description"
          content="TECHSTORE is a premier Australian security company specializing in Electronic Security, Home Automation, Audio Visual, Data Cabling, and Ducted Vacuum systems. ASIAL accredited with 20+ years of experience delivering integrated, hassle-free solutions."
        />
        <meta
          name="keywords"
          content="TECHSTORE, TechStore Alarm System, security companies Australia, electronic security Sydney, home automation Australia, audio visual installation, data cabling contractors, ducted vacuum systems, ASIAL Silver Member, security license holders, integrated security solutions, Dynalite certified, commercial security, residential automation, access control, CCTV installation Australia"
        />
        <meta name="author" content="TECHSTORE Alarm Systems Australia" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shop.TechStorealarm.com.au/contact" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="TECHSTORE Alarm Systems | Electronic Security & Automation Experts"
        />
        <meta
          property="og:description"
          content="Since 2008, TECHSTORE has delivered premium integrated solutions including security, automation, and AV. Fully licensed and ASIAL accredited."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://shop.TechStorealarm.com.au/contact"
        />
        <meta property="og:site_name" content="TECHSTORE Alarm Systems" />

        {/* Social Links */}
        <meta
          property="og:see_also"
          content="https://www.instagram.com/TechStorealarm/"
        />
        <meta
          property="og:see_also"
          content="https://www.facebook.com/p/TechStore-alarms-100071267801808/"
        />
      </Helmet>

      <div className="container-fluid p-0 text-start" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <PageHeader title="Contact Us" path="Home / Contact Us" />

        <div className="container py-5 mt-4">
          <div className="row g-5 justify-content-center">
            {/* Left Column: Get In Touch Card and Detail Badges */}
            <div className="col-lg-5">
              <div className="mb-4">
                <span className="text-danger fw-bold text-uppercase tracking-wider small d-block mb-2">Connect With Us</span>
                <h3 className="fw-bold heading mb-3" style={{ fontSize: "2.2rem" }}>Get In Touch</h3>
                <p className="text-secondary mb-4" style={{ fontSize: "1.02rem" }}>
                  We're here to help! Reach out to us with any questions, feedback, or custom installation inquiries, and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="d-flex flex-column gap-3">
                {contactDetails.map((item, index) => (
                  <a
                    href={item.link}
                    target={item.isExternal ? "_blank" : "_self"}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="d-flex bg-white border rounded-3 p-3 align-items-center text-decoration-none text-dark shadow-sm hover-translate"
                    key={index}
                    aria-label={item.title}
                    style={{ transition: "all 0.2s" }}
                  >
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                      style={{ 
                        width: "52px", 
                        height: "52px", 
                        backgroundColor: "rgba(0, 43, 116, 0.05)",
                        flexShrink: 0 
                      }}
                    >
                      <i className={`${item.icon} fs-4`}></i>
                    </div>

                    <div className="ms-3 overflow-hidden">
                      <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "0.95rem" }}>{item.title}</h6>
                      <p className="text-muted small mb-0 text-truncate" style={{ fontSize: "0.85rem" }}>{item.text}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column: Contact Form Card */}
            <div className="col-lg-7">
              <div className="bg-white border rounded-3 p-4 p-md-5 shadow-sm">
                <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">Send Us A Message</h4>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label fw-bold text-dark small mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                      id="fullName"
                      placeholder="Enter Your Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback d-block">{errors.fullName}</div>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-bold text-dark small mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        id="email"
                        placeholder="Enter Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-bold text-dark small mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        id="phone"
                        placeholder="Enter Your 10-Digit Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                      {errors.phone && (
                        <div className="invalid-feedback d-block">{errors.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label fw-bold text-dark small mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                      id="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                    {errors.subject && (
                      <div className="invalid-feedback d-block">{errors.subject}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-bold text-dark small mb-1">
                      Your Message
                    </label>
                    <textarea
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      id="message"
                      rows="4"
                      placeholder="Write your detailed query here..."
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={handleMessageFocus}
                      required
                    />
                    {errors.message && (
                      <div className="invalid-feedback d-block">{errors.message}</div>
                    )}
                  </div>

                  {showRecaptcha && (
                    <div className="mb-4">
                      <div ref={recaptchaRef}></div>
                      {errors.recaptcha && (
                        <div className="text-danger small mt-1">{errors.recaptcha}</div>
                      )}
                    </div>
                  )}

                  <GlobalButton type="submit" className="w-100 py-2.5 fw-bold btn-primary">
                    Send Message
                  </GlobalButton>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="border-top overflow-hidden">
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3317.0174901083697!2d150.8269488!3d-33.7602139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129a4ff0e259f1%3A0xc61942d43fc0457!2sUnit%2015%2F51%20Meacher%20St%2C%20Mount%20Druitt%20NSW%202770%2C%20Australia!5e0!3m2!1sen!2slk!4v1771153737036!5m2!1sen!2slk"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
