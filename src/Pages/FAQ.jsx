import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import { faqData } from "../Constants/Data";

const FAQ = () => {
  const [openFaqId, setOpenFaqId] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Toggle FAQ function
  const toggleFaq = (idx) => {
    setOpenFaqId((prev) => (prev === idx ? null : idx));
  };

  const filteredFaqs = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.answer && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>Frequently Asked Questions | TechStore Alarm Systems</title>
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

      <PageHeader title="Frequently Asked Questions" path="Home / FAQ" />

      <div className="container py-5 text-start" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "80vh" }}>
        <div className="row g-4 mt-2">
          {/* Left Column: Accordion Questions */}
          <div className="col-lg-8">
            <h4 className="fw-bold heading text-dark mb-4 pb-2 border-bottom">
              Help Center & FAQs
            </h4>

            {/* Search Input Bar matching mockup */}
            <div className="mb-4">
              <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-2.5 ps-2 fs-6"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenFaqId(0);
                  }}
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>

            <div className="accordion">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item, index) => (
                  <div 
                    key={index} 
                  className="bg-white border rounded-3 mb-3 overflow-hidden shadow-sm"
                  style={{ transition: "all 0.3s ease" }}
                >
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-100 border-0 bg-white d-flex justify-content-between align-items-center px-4 py-3 text-start"
                    aria-expanded={openFaqId === index}
                    aria-controls={`faq-panel-${index}`}
                    style={{ outline: "none" }}
                  >
                    <span className="fw-bold text-dark" style={{ fontSize: "1.05rem" }}>
                      {item.question}
                    </span>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary"
                      style={{ width: "32px", height: "32px", transition: "all 0.3s ease" }}
                    >
                      <i className={`bi ${openFaqId === index ? "bi-dash-lg" : "bi-plus-lg"} fs-6`}></i>
                    </div>
                  </button>

                  {/* Answer */}
                  {openFaqId === index && (
                    <div
                      id={`faq-panel-${index}`}
                      className="px-4 pb-4 pt-2 border-top bg-white"
                    >
                      {item.answer && (
                        <p
                          className="text-secondary small mb-0"
                          style={{ whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "0.92rem" }}
                        >
                          {item.answer}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted bg-white border rounded-3 shadow-sm">
                <i className="bi bi-question-circle fs-2 mb-2 d-block text-secondary"></i>
                No matching questions found.
              </div>
            )}
            </div>
          </div>

          {/* Right Column: Still Have Questions Box */}
          <div className="col-lg-4">
            <div className="bg-white border rounded-3 p-4 shadow-sm text-center sticky-top" style={{ top: "100px" }}>
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-primary" 
                style={{ width: "72px", height: "72px", backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              >
                <i className="bi bi-headset fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Still have questions?</h5>
              <p className="text-secondary small mb-4" style={{ lineHeight: "1.5" }}>
                If you cannot find the answer to your questions in our FAQ, you can always contact our professional support team. We're here to help you 24/7.
              </p>
              <button 
                onClick={() => navigate("/contact")} 
                className="btn btn-primary w-100 py-2.5 fw-bold"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
