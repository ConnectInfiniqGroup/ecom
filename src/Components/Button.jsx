import React from "react";
import { Link } from "react-router-dom";

const GlobalButton = ({ to, onClick, className, children, ...props }) => {
  const defaultClass = "btn btn-primary";
  const finalClass = className ? `${defaultClass} ${className}` : defaultClass;

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={finalClass}
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={finalClass}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlobalButton;