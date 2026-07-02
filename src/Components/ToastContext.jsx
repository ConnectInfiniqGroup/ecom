import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", imageUrl = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type, imageUrl }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Global Toast Container */}
      <div 
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1100, maxWidth: "380px" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`TechStore-toast d-flex align-items-center p-3 mb-2 border-0 bg-white rounded-3 shadow-lg`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {toast.imageUrl ? (
              <div 
                className="flex-shrink-0 border rounded overflow-hidden bg-light me-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
              >
                <img 
                  src={toast.imageUrl} 
                  alt="Toast item" 
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="flex-shrink-0 me-3">
                {toast.type === "success" && (
                  <i className="bi bi-check-circle-fill text-success fs-3"></i>
                )}
                {toast.type === "error" && (
                  <i className="bi bi-x-circle-fill text-danger fs-3"></i>
                )}
                {toast.type === "info" && (
                  <i className="bi bi-info-circle-fill text-info fs-3"></i>
                )}
              </div>
            )}
            
            <div className="flex-grow-1 text-start">
              <p className="mb-0 fw-semibold text-dark small">{toast.message}</p>
            </div>
            
            <button
              type="button"
              className="btn-close ms-2 p-1"
              style={{ fontSize: "10px" }}
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            ></button>
            
            {/* Countdown line */}
            <div className="TechStore-toast-progress"></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
