import React from "react";
import { Helmet } from "react-helmet-async";
import PageHeader from "../Components/PageHeader";
import Ad1 from "../Assets/Images/ad1.png";
import Profile from "../Assets/Images/profile.jpg";
import { whyChooseUsData } from "../Constants/Data";

const About = () => {
  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>About Us | TechStore Alarm Systems</title>
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
        <link rel="canonical" href="https://shop.TechStorealarm.com.au/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="TECHSTORE Alarm Systems | Electronic Security & Automation Experts"
        />
        <meta
          property="og:description"
          content="Since 2008, TECHSTORE has delivered premium integrated solutions including security, automation, and AV. Fully licensed (Master License No: 000101930) and ASIAL accredited."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shop.TechStorealarm.com.au/" />
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
        <PageHeader title="About Us" path="Home / About Us" />

        {/* Split Hero Section */}
        <div className="container py-5 mt-4">
          <div className="row g-5 align-items-center">
            {/* Left Column: Image */}
            <div className="col-lg-6">
              <div className="position-relative">
                <div 
                  className="position-absolute bg-danger rounded-3" 
                  style={{ 
                    top: "-15px", 
                    left: "-15px", 
                    width: "100px", 
                    height: "100px", 
                    zIndex: 0,
                    opacity: 0.15
                  }}
                />
                <img 
                  src={Ad1} 
                  alt="TechStore Office Building" 
                  className="img-fluid rounded-3 shadow-lg position-relative w-100"
                  style={{ zIndex: 1, objectFit: "cover", minHeight: "360px" }}
                />
              </div>
            </div>

            {/* Right Column: Content Checkmarks */}
            <div className="col-lg-6">
              <span className="text-danger fw-bold text-uppercase tracking-wider small d-block mb-2">Who We Are</span>
              <h2 className="fw-bold heading mb-3" style={{ fontSize: "2.5rem" }}>
                Your Security, Our Priority
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: "1.05rem" }}>
                Founded in 2008 as a privately owned Security Alarm company, we've grown into a provider of integrated solutions. We prioritize customer satisfaction, cultivating enduring, long-term relationships with our valued clientele.
              </p>

              {/* Checkmark Bullets */}
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: "36px", height: "36px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--brand-secondary)", flexShrink: 0 }}>
                    <i className="bi bi-check-lg fs-5 fw-bold"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Quality Products & Services</h5>
                    <p className="text-muted small mb-0">We believe all our customers should receive premium value and security solutions.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: "36px", height: "36px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--brand-secondary)", flexShrink: 0 }}>
                    <i className="bi bi-check-lg fs-5 fw-bold"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">24/7 Expert Support</h5>
                    <p className="text-muted small mb-0">Round-the-clock monitoring and emergency technical support for constant peace of mind.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: "36px", height: "36px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--brand-secondary)", flexShrink: 0 }}>
                    <i className="bi bi-check-lg fs-5 fw-bold"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Trusted by Thousands</h5>
                    <p className="text-muted small mb-0">Delivering integrated, hassle-free residential and commercial security since 2008.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Statistics Counters */}
        <div className="bg-white border-top border-bottom py-5 my-5">
          <div className="container">
            <div className="row g-4 text-center">
              {[
                { number: "10+", label: "Years Experience", icon: "bi-patch-check" },
                { number: "5000+", label: "Happy Customers", icon: "bi-emoji-smile" },
                { number: "100+", label: "Expert Technicians", icon: "bi-people" },
                { number: "24/7", label: "Monitoring Support", icon: "bi-headset" }
              ].map((stat, idx) => (
                <div className="col-6 col-lg-3" key={idx}>
                  <div className="p-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-danger"
                         style={{ width: "60px", height: "60px", backgroundColor: "rgba(220, 38, 38, 0.08)" }}>
                      <i className={`bi ${stat.icon} fs-3`}></i>
                    </div>
                    <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: "2.5rem" }}>{stat.number}</h2>
                    <p className="text-muted mb-0 fw-semibold small">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="container py-4 my-5">
          <div className="text-center mb-5">
            <span className="text-danger fw-bold text-uppercase tracking-wider small d-block mb-2">Our Standards</span>
            <h3 className="heading fw-bold">Industry Credentials</h3>
            <p className="text-secondary max-w-md mx-auto">Fully certified and licensed to provide professional security services across Australia.</p>
          </div>

          <div className="row g-4">
            {[
              { title: "ASIAL Corporate Member", desc: "Australian Security Industry Association Ltd - Silver Corporate Membership No: C8339", icon: "bi-award" },
              { title: "Licensed Security Professionals", desc: "Police Security Master License No: 000101930 (Licensed & compliant)", icon: "bi-shield-check" },
              { title: "Cabling Certification", desc: "Fully certified data cabling and audio visual engineers and technicians", icon: "bi-hdd-network" },
              { title: "$20 Million Liability Insurance", desc: "Comprehensive public liability coverage for secure onsite installations", icon: "bi-check2-square" },
              { title: "Workers Compensation", desc: "Full coverage and safety compliance for all technicians and team members", icon: "bi-file-earmark-medical" },
              { title: "Dynalite Certified", desc: "Licensed home automation integrators and Dynalite systems certification", icon: "bi-cpu" }
            ].map((cred, index) => (
              <div className="col-md-6 col-lg-4" key={index}>
                <div className="bg-white border rounded-3 p-4 h-100 shadow-sm d-flex gap-3 align-items-start hover-translate"
                     style={{ transition: "transform 0.2s, box-shadow 0.2s" }}>
                  <div className="rounded-3 p-2 bg-light text-primary" style={{ flexShrink: 0 }}>
                    <i className={`bi ${cred.icon} fs-4`}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-2">{cred.title}</h6>
                    <p className="text-muted small mb-0" style={{ lineHeight: "1.4" }}>{cred.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white border-top border-bottom py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-danger fw-bold text-uppercase tracking-wider small d-block mb-2">Why Choose Us</span>
              <h3 className="heading fw-bold">Delivering Safe & Smarter Living</h3>
              <p className="text-secondary">With great power comes great productivity and reliable peace of mind.</p>
            </div>

            <div className="row g-4 text-center">
              {whyChooseUsData.map((item, index) => (
                <div className="col-12 col-md-6 col-lg-3" key={index}>
                  <div className="bg-light border rounded-3 p-4 h-100 shadow-sm" style={{ transition: "all 0.2s" }}>
                    <div className="mb-3 d-inline-block p-3 bg-white rounded-circle shadow-sm">
                      <img
                        src={item.icon}
                        alt={item.title}
                        style={{
                          width: "44px",
                          height: "44px",
                          objectFit: "contain",
                          filter: "invert(18%) sepia(64%) saturate(2200%) hue-rotate(200deg) brightness(90%) contrast(95%)",
                        }}
                      />
                    </div>
                    <h6 className="fw-bold heading text-dark mb-2">{item.title}</h6>
                    <p className="text-muted small mb-0" style={{ lineHeight: "1.5" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-5 my-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-danger fw-bold text-uppercase tracking-wider small d-block mb-2">Testimonials</span>
              <h3 className="heading fw-bold">What Clients Say</h3>
              <p className="text-secondary">Read actual reviews from our commercial and residential customers.</p>
            </div>

            <div className="row g-4 justify-content-center">
              {[
                {
                  name: "Residential Client",
                  role: "Home Security",
                  text: "Professional installation and a clean setup. The 24hr back-to-base monitoring gives us real peace of mind at home. Highly recommended!",
                  rating: 5
                },
                {
                  name: "Business Client",
                  role: "CCTV & Access Control",
                  text: "Great CCTV coverage and reliable access control. The team also helped with structured cabling and ongoing maintenance. Excellent customer service.",
                  rating: 5
                },
              ].map((t, index) => (
                <div className="col-lg-5 col-md-6" key={index}>
                  <div className="bg-white border rounded-3 p-4 h-100 shadow-sm position-relative d-flex flex-column justify-content-between">
                    <div className="mb-4">
                      {/* Quote Icon */}
                      <i className="bi bi-quote fs-1 text-danger opacity-20 position-absolute" style={{ top: "15px", right: "20px" }}></i>
                      {/* Rating Stars */}
                      <div className="text-warning mb-3">
                        {[...Array(t.rating)].map((_, i) => (
                          <i className="bi bi-star-fill me-1" key={i}></i>
                        ))}
                      </div>
                      <p className="text-secondary italic mb-0" style={{ fontSize: "0.95rem", fontStyle: "italic" }}>
                        “{t.text}”
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-3 pt-3 border-top">
                      <img
                        src={Profile}
                        alt="Profile Placeholder"
                        className="rounded-circle border p-1 bg-light"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <h6 className="heading fw-bold m-0 text-dark" style={{ fontSize: "0.95rem" }}>
                          {t.name}
                        </h6>
                        <span className="text-muted small d-block">{t.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Highlight Banner */}
        <div className="bg-white border-top border-bottom py-5">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="d-flex gap-3 align-items-start p-3">
                  <div className="text-danger flex-shrink-0 bg-light p-3 rounded-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -117 679.99892 679"
                      width="48"
                      height="48"
                      fill="currentColor"
                    >
                      <path d="m12.347656 378.382812h37.390625c4.371094 37.714844 36.316407 66.164063 74.277344 66.164063 37.96875 0 69.90625-28.449219 74.28125-66.164063h241.789063c4.382812 37.714844 36.316406 66.164063 74.277343 66.164063 37.96875 0 69.902344-28.449219 74.285157-66.164063h78.890624c6.882813 0 12.460938-5.578124 12.460938-12.460937v-352.957031c0-6.882813-5.578125-12.464844-12.460938-12.464844h-432.476562c-6.875 0-12.457031 5.582031-12.457031 12.464844v69.914062h-105.570313c-4.074218.011719-7.890625 2.007813-10.21875 5.363282l-68.171875 97.582031-26.667969 37.390625-9.722656 13.835937c-1.457031 2.082031-2.2421872 4.558594-2.24999975 7.101563v121.398437c-.09765625 3.34375 1.15624975 6.589844 3.47656275 9.003907 2.320312 2.417968 5.519531 3.796874 8.867187 3.828124zm111.417969 37.386719c-27.527344 0-49.851563-22.320312-49.851563-49.847656 0-27.535156 22.324219-49.855469 49.851563-49.855469 27.535156 0 49.855469 22.320313 49.855469 49.855469 0 27.632813-22.21875 50.132813-49.855469 50.472656zm390.347656 0c-27.53125 0-49.855469-22.320312-49.855469-49.847656 0-27.535156 22.324219-49.855469 49.855469-49.855469 27.539063 0 49.855469 22.320313 49.855469 49.855469.003906 27.632813-22.21875 50.132813-49.855469 50.472656zm140.710938-390.34375v223.34375h-338.375c-6.882813 0-12.464844 5.578125-12.464844 12.460938 0 6.882812 5.582031 12.464843 12.464844 12.464843h338.375v79.761719h-66.421875c-4.382813-37.710937-36.320313-66.15625-74.289063-66.15625-37.960937 0-69.898437 28.445313-74.277343 66.15625h-192.308594v-271.324219h89.980468c6.882813 0 12.464844-5.582031 12.464844-12.464843 0-6.882813-5.582031-12.464844-12.464844-12.464844h-89.980468v-31.777344zm-531.304688 82.382813h99.703125v245.648437h-24.925781c-4.375-37.710937-36.3125-66.15625-74.28125-66.15625-37.960937 0-69.90625 28.445313-74.277344 66.15625h-24.929687v-105.316406l3.738281-5.359375h152.054687c6.882813 0 12.460938-5.574219 12.460938-12.457031v-92.226563c0-6.882812-5.578125-12.464844-12.460938-12.464844h-69.796874zm-30.160156 43h74.777344v67.296875h-122.265625z" />
                    </svg>
                  </div>
                  <div>
                    <h6 className="fw-bold heading text-dark mb-1" style={{ fontSize: "1rem" }}>24HR BACK-TO-BASE</h6>
                    <p className="text-muted small mb-0">Burglar alarm monitoring for faster response & peace of mind.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 border-start-desktop">
                <div className="d-flex gap-3 align-items-start p-3">
                  <div className="text-danger flex-shrink-0 bg-light p-3 rounded-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 480 480"
                      width="48"
                      height="48"
                      fill="currentColor"
                    >
                      <path d="M472,432h-24V280c-0.003-4.418-3.588-7.997-8.006-7.994c-2.607,0.002-5.05,1.274-6.546,3.41l-112,160 c-2.532,3.621-1.649,8.609,1.972,11.14c1.343,0.939,2.941,1.443,4.58,1.444h104v24c0,4.418,3.582,8,8,8s8-3.582,8-8v-24h24 c4.418,0,8-3.582,8-8S476.418,432,472,432z M432,432h-88.64L432,305.376V432z M328,464h-94.712l88.056-103.688c0.2-0.238,0.387-0.486,0.56-0.744c16.566-24.518,11.048-57.713-12.56-75.552 c-28.705-20.625-68.695-14.074-89.319,14.631C212.204,309.532,207.998,322.597,208,336c0,4.418,3.582,8,8,8s8-3.582,8-8 c-0.003-26.51,21.486-48.002,47.995-48.005c10.048-0.001,19.843,3.151,28.005,9.013c16.537,12.671,20.388,36.007,8.8,53.32 l-98.896,116.496c-2.859,3.369-2.445,8.417,0.924,11.276c1.445,1.226,3.277,1.899,5.172,1.9h112c4.418,0,8-3.582,8-8 S332.418,464,328,464z M216.176,424.152c0.167-4.415-3.278-8.129-7.693-8.296C104.11,411.982,20.341,328.363,16.28,224H48c4.418,0,8-3.582,8-8s-3.582-8-8-8H16.28C20.283,103.821,103.82,20.287,208,16.288V40c0,4.418,3.582,8,8,8s8-3.582,8-8V16.288c102.754,3.974,185.686,85.34,191.616,188l-31.2-31.2c-3.178-3.07-8.242-2.982-11.312,0.196c-2.994,3.1-2.994,8.015,0,11.116l44.656,44.656c0.841,1.018,1.925,1.807,3.152,2.296c0.313,0.094,0.631,0.172,0.952,0.232c0.549,0.198,1.117,0.335,1.696,0.408h0.456c0.609-0.046,1.211-0.164,1.792-0.352c0.329-0.04,0.655-0.101,0.976-0.184c1.083-0.385,2.069-1.002,2.888-1.808l45.264-45.248c3.069-3.178,2.982-8.242-0.196-11.312c-3.1-2.994-8.015-2.994-11.116,0l-31.976,31.952C425.933,90.37,331.38,0.281,216.568,0.112C216.368,0.104,216.2,0,216,0s-0.368,0.104-0.568,0.112C96.582,0.275,0.275,96.582,0.112,215.432C0.112,215.632,0,215.8,0,216s0.104,0.368,0.112,0.568c0.199,115.917,91.939,210.97,207.776,215.28h0.296C212.483,431.847,216.013,428.448,216.176,424.152z M323.48,108.52c-3.124-3.123-8.188-3.123-11.312,0L226.2,194.48c-6.495-2.896-13.914-2.896-20.408,0l-40.704-40.704c-3.178-3.069-8.243-2.981-11.312,0.197c-2.994,3.1-2.994,8.015,0,11.115l40.624,40.624c-5.704,11.94-0.648,26.244,11.293,31.947c9.165,4.378,20.095,2.501,27.275-4.683c7.219-7.158,9.078-18.118,4.624-27.256l85.888-85.888C326.603,116.708,326.603,111.644,323.48,108.52z M221.658,221.654c-3.164,3.025-8.148,3.025-11.312,0c-3.125-3.124-3.125-8.189-0.002-11.314c3.124-3.125,8.189-3.125,11.314-0.002C224.781,213.464,224.781,218.53,221.658,221.654z" />
                    </svg>
                  </div>
                  <div>
                    <h6 className="fw-bold heading text-dark mb-1" style={{ fontSize: "1rem" }}>CCTV SURVEILLANCE</h6>
                    <p className="text-muted small mb-0">Reliable camera solutions for homes, offices & commercial sites.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 border-start-desktop">
                <div className="d-flex gap-3 align-items-start p-3">
                  <div className="text-danger flex-shrink-0 bg-light p-3 rounded-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -14 512.00001 512"
                      width="48"
                      height="48"
                      fill="currentColor"
                    >
                      <path d="m136.964844 308.234375c4.78125-2.757813 6.417968-8.878906 3.660156-13.660156-2.761719-4.777344-8.878906-6.417969-13.660156-3.660157-4.78125 2.761719-6.421875 8.882813-3.660156 13.660157 2.757812 4.78125 8.878906 6.421875 13.660156 3.660156zm0 0 M95.984375 377.253906 50.359375 87.230469c10.867188 18.84375 35.3125 25.820313 54.644531 14.644531 19.128907-11.054687 25.703125-35.496094 14.636719-54.640625l-30-51.96875 25.980469-15c4.78125-2.765625 6.421875-8.878906 3.660156-13.660156l-13.003906-22.523437c1.550781-.300782 11.746093-2.300782 191.539062-37.570313 22.226563-1.207031 35.542969-25.515625 24.316407-44.949219l-33.234376-57.5625 21.238282-32.167968c2.085937-3.164063 2.210937-7.230469.316406-10.511719l-20-34.640625c-1.894531-3.28125-5.492188-5.203125-9.261719-4.980469l-38.472656 2.308594-36.894531-63.90625c-5.34375-9.257813-14.917969-14.863281-25.605469-14.996094-.128906-.003906-.253906-.003906-.382813-.003906-10.328124 0-19.703124 5.140625-25.257812 13.832031l-130.632812 166.414062-84.925782 49.03125c-33.402344 19.277344-44.972656 62.128907-25.621094 95.621094 17.679688 30.625 54.953126 42.671875 86.601563 30zm102.324219 57.238282c5.523437 9.554687 2.253906 21.78125-7.328125 27.316406-9.613281 5.558594-21.855469 2.144531-27.316407-7.320313l-50-86.613281 34.640626-20c57.867187 100.242188 49.074218 85.011719 50.003906 86.617188zm-22.683594-79.296876-10-17.320312 17.320312-10 10 17.320312zm196.582031-235.910156 13.820313 23.9375-12.324219 18.664063-23.820313-41.261719zm-104.917969-72.132812c2.683594-4.390625 6.941407-4.84375 8.667969-4.796875 1.707031.019531 5.960938.550781 8.527344 4.996093l116.3125 201.464844c3.789063 6.558594-.816406 14.804688-8.414063 14.992188-1.363281.03125-1.992187.277344-5.484374.929687l-123.035157-213.105469c2.582031-3.320312 2.914063-3.640624 3.425781-4.480468zm-16.734374 21.433594 115.597656 200.222656-174.460938 34.21875-53.046875-91.878906zm-223.851563 268.667968c-4.390625-7.597656-6.710937-16.222656-6.710937-24.949218 0-17.835938 9.585937-34.445313 25.011718-43.351563l77.941406-45 50 86.601563-77.941406 45.003906c-23.878906 13.78125-54.515625 5.570312-68.300781-18.304688zm0 0 M105.984375 314.574219c-2.761719-4.78125-8.878906-6.421875-13.660156-3.660157l-17.320313 10c-4.773437 2.757813-10.902344 1.113282-13.660156-3.660156-2.761719-4.78125-8.878906-6.421875-13.660156-3.660156s-6.421875 8.878906-3.660156 13.660156c8.230468 14.257813 26.589843 19.285156 40.980468 10.980469l17.320313-10c4.78125-2.761719 6.421875-8.875 3.660156-13.660156zm0 0 M497.136719 43.746094-55.722657 31.007812c-4.824218 2.6875-6.5625 8.777344-3.875 13.601563 2.679688 4.820312 8.765626 6.566406 13.601563 3.875l55.71875-31.007813c4.828125-2.6875 6.5625-8.777344 3.875-13.601562-2.683594-4.828125-8.773437-6.5625-13.597656-3.875zm0 0 M491.292969 147.316406-38.636719-10.351562c-5.335938-1.429688-10.820312 1.734375-12.25 7.070312-1.429688 5.335938 1.738281 10.816406 7.074219 12.246094l38.640625 10.351562c5.367187 1.441407 10.824218-1.773437 12.246094-7.070312 1.429687-5.335938-1.738282-10.820312-7.074219-12.246094zm0 0 M394.199219 7.414062-10.363281 38.640626c-1.429688 5.335937 1.734374 10.816406 7.070312 12.25 5.332031 1.425781 10.816406-1.730469 12.25-7.070313l10.359375-38.640625c1.429687-5.335938-1.734375-10.820312-7.070313-12.25-5.332031-1.429688-10.816406 1.734375-12.246093 7.070312zm0 0" />
                    </svg>
                  </div>
                  <div>
                    <h6 className="fw-bold heading text-dark mb-1" style={{ fontSize: "1rem" }}>INTEGRATED SOLUTIONS</h6>
                    <p className="text-muted small mb-0">Intercom, access control, automation, AV & cabling solutions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;

