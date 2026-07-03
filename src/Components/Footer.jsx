import Logo from "../Assets/Images/logo.png";
import React from "react";

import GlobalButton from "./Button";

const Footer = () => {
  return (
    <>
      <div className="footer bg-white mt-5">
        <div className="container">
          <div className="row align-items-center py-5 border-top border-bottom border-light">
            <div className="col-lg-6 text-center text-md-start mb-4 mb-lg-0">
              <h4 className="fw-bold heading mb-2 text-dark">KNOW IT ALL FIRST!</h4>
              <p className="text-muted m-0 fs-6">
                Never Miss Anything From TechStore By Signing Up To Our Newsletter.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="input-group input-group-lg gap-2 shadow-sm rounded-pill p-1 border border-light bg-tertiary">
                <input
                  type="email"
                  className="form-control border-0 bg-transparent rounded-pill px-4 shadow-none"
                  placeholder="Enter your email address"
                />
                <GlobalButton className="rounded-pill px-5 shadow-sm hover-lift">Subscribe</GlobalButton>
              </div>
            </div>
          </div>

          <hr />

          <div className="row py-5 text-center text-md-start">
            <div className="col-lg-3 col-md-12 col-sm-12 pb-3 d-flex flex-column align-items-center align-items-md-start">
              <div className="d-flex align-items-center mb-3">
                <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "100px", objectFit: "contain" }} />
              </div>
              <p className="text-secondary fw-semibold lh-base">
                Protect what matters most with reliable security solutions
                designed for homes and businesses. From smart alarms to 24/7
                monitoring, we deliver safety, peace of mind, and dependable
                protection you can trust.
              </p>
              {/* <div className="social-icons d-flex gap-3">
                <a href="#" className="text-dark">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
                <a href="#" className="text-dark">
                  <i className="bi bi-google fs-5"></i>
                </a>
                <a href="#" className="text-dark">
                  <i className="bi bi-twitter-x fs-5"></i>
                </a>
                <a href="#" className="text-dark">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
                <a href="#" className="text-dark">
                  <i className="bi bi-tiktok fs-5"></i>
                </a>
              </div> */}
            </div>

            <div className="col-lg-3 col-md-4 col-sm-12 pb-3">
              <h5 className="text-uppercase mb-4 fw-bold heading">
                Quick Links
              </h5>
              <ul className="list-unstyled small footer-links text-uppercase lh-lg">
                <li className="mb-2 fw-semibold">
                  <a
                    href="/about"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    About Us
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/categories"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Categories
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/shop"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Shop
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/faq"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    FAQ
                  </a>
                </li>
                <li className="fw-semibold">
                  <a
                    href="/contact"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-12 pb-3">
              <h5 className="text-uppercase mb-4 fw-bold heading">
                why we choose
              </h5>
              <ul className="list-unstyled small footer-links text-uppercase lh-lg">
                <li className="mb-2 fw-semibold">
                  <a
                    href="/services"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    24/7 Monitoring
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/services"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Professional Installation
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/services"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Smart Security Solutions
                  </a>
                </li>
                <li className="mb-2 fw-semibold">
                  <a
                    href="/support"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Reliable Support
                  </a>
                </li>
                <li className="fw-semibold">
                  <a
                    href="/contact"
                    className="text-secondary position-relative text-decoration-none"
                  >
                    Get a Free Quote
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-12 pb-4 d-flex flex-column align-items-center align-items-md-start">
              <h5 className="text-uppercase mb-4 fw-bold heading">
                store information
              </h5>

              <div className="d-flex align-items-start fw-semibold text-secondary mb-3">
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                <a
                  href="https://maps.app.goo.gl/DZEoqEVyhkkHZLoP7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary text-decoration-none"
                >
                  123 Demo Street, Demo City, Demo Country 12345{" "}
                </a>
              </div>

              <div className="d-flex align-items-start fw-semibold text-secondary mb-3">
                <i className="bi bi-envelope-fill text-primary me-2"></i>
                <a
                  href="mailto:demo@example.com"
                  className="text-secondary text-decoration-none"
                >
                  demo@example.com
                </a>
              </div>

              <div className="d-flex align-items-start fw-semibold text-secondary">
                <i className="bi bi-telephone-fill text-primary me-2"></i>
                <a
                  href="tel:0433172345"
                  className="text-secondary text-decoration-none"
                >
                  +1 234 567 8900
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <div className="container border-top py-3">
            <div className="row align-items-center text-center text-md-start">
              <div className="col-md-6">
                <p className="mb-0">
                  All rights reserved. {new Date().getFullYear()} &copy;{" "}
                  <strong>TechStore Shop.</strong> Web solution by{" "}
                  <a
                    href="https://adada.com.au/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-dark"
                    aria-label="ADADA Digital website"
                  >
                    ADADA Digital
                  </a>
                </p>
              </div>

              <div className="col-md-6 mt-2 mt-md-0 d-flex justify-content-center justify-content-md-end">
                <div className="social-icons d-flex gap-3">
                  <a
                    href="https://www.facebook.com/p/TechStore-alarms-100071267801808/"
                    className="text-dark"
                  >
                    <i className="bi bi-facebook fs-5"></i>
                  </a>
                  {/* <a href="#" className="text-dark">
                    <i className="bi bi-google fs-5"></i>
                  </a>
                  <a href="#" className="text-dark">
                    <i className="bi bi-twitter-x fs-5"></i>
                  </a> */}
                  <a href="#" className="text-dark">
                    <i className="bi bi-instagram fs-5"></i>
                  </a>
                  <a href="#" className="text-dark">
                    <i className="bi bi-tiktok fs-5"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
