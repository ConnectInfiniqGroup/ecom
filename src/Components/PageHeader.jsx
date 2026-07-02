import React from "react";

const PageHeader = ({ title, path }) => {
  return (
    <div className="bg-tertiary border-bottom border-light" style={{ padding: '60px 0 40px' }}>
      <div className="container d-flex flex-column justify-content-center align-items-center text-center">
        <h1 className="fw-bold heading display-5 text-dark mb-3">{title}</h1>
        <div className="d-flex align-items-center bg-white shadow-sm rounded-pill px-4 py-2 border border-light">
          <span className="text-secondary small fw-semibold letter-spacing-wide text-uppercase">{path}</span>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
