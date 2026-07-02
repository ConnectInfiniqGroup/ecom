import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Dashboard from "./Pages/UserDashboard";

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


function AdminPrivateRoute({ handleLogout }) {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        if (isMounted) {
          setAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        // Try to get user data to verify token is valid
        const res = await api.get("/auth/user");
        
        if (isMounted && res.data) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Only clear storage if it's a 401 error
        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_name");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
        }
        setAuthenticated(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return authenticated ? (
    <Dashboard handleLogout={handleLogout} />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default AdminPrivateRoute;