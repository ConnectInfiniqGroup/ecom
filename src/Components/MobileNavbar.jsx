import React from "react";
import { Link, useLocation } from "react-router-dom";

const MobileNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isLoggedIn = true; // Hardcoded to true for demo
  const accountLink = "/dashboard";

  const navItems = [
    {
      label: "Home",
      path: "/",
      iconOutline: "bi-house",
      iconFilled: "bi-house-fill"
    },
    {
      label: "Shop",
      path: "/shop",
      iconOutline: "bi-bag",
      iconFilled: "bi-bag-fill"
    },
    {
      label: "Categories",
      path: "/categories",
      iconOutline: "bi-grid",
      iconFilled: "bi-grid-fill"
    },
    {
      label: "Cart",
      path: "/cart",
      iconOutline: "bi-cart",
      iconFilled: "bi-cart-fill"
    },
    {
      label: "Account",
      path: accountLink,
      iconOutline: "bi-person",
      iconFilled: "bi-person-fill",
      // Match active for /dashboard, /user-profile or /login
      matchPaths: ["/dashboard", "/user-profile", "/login"]
    }
  ];

  const isTabActive = (item) => {
    if (item.matchPaths) {
      return item.matchPaths.some(p => currentPath.startsWith(p));
    }
    return currentPath === item.path;
  };

  return (
    <>
      <style>{`
        .mobile-navbar-shim {
          height: 65px;
        }
        .mobile-tab-btn {
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          flex: 1;
          transition: color 0.15s ease-in-out;
        }
        .mobile-tab-btn i {
          font-size: 1.25rem;
        }
        .mobile-tab-btn.active {
          color: var(--brand-primary);
          font-weight: 700;
        }
      `}</style>

      {/* Bottom navbar fixed position */}
      <nav className="fixed-bottom bg-white border-top shadow d-flex justify-content-around align-items-center py-2 d-md-none" style={{ zIndex: 1030 }}>
        {navItems.map((item, idx) => {
          const active = isTabActive(item);
          return (
            <Link
              key={idx}
              to={item.path}
              className={`mobile-tab-btn ${active ? "active" : ""}`}
              onClick={() => {
                if (item.label === "Account") {
                  localStorage.setItem("dashboardActiveTab", "dashboard");
                }
              }}
            >
              <i className={`bi ${active ? item.iconFilled : item.iconOutline}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Spacer shim at the bottom so page content isn't covered */}
      <div className="mobile-navbar-shim d-md-none" />
    </>
  );
};

export default MobileNavbar;
