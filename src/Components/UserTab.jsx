import React, { useEffect } from "react";
import { Link } from "react-router-dom";

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


const UserTab = ({ user, orders = [], addresses = [], notifications = [], onTabChange }) => {
  // Skeleton Component
  const SkeletonPill = ({ width = 80, height = 28, className = "" }) => (
    <span
      className={`rounded-3 px-2 ${className}`}
      style={{
        width,
        height,
        display: "inline-block",
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)",
        backgroundSize: "400% 100%",
        animation: "shine 1.4s ease infinite",
      }}
      aria-hidden="true"
    />
  );

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.user) return;
      try {
        await api.get("/user/reviews");
      } catch (err) {
        // quiet fail
      }
    };
    fetchReviews();
  }, [user]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numericPrice)}`;
  };

  const recentOrders = orders.slice(0, 3);
  const unreadAlerts = notifications.filter((n) => n.status === "unread").length;

  return (
    <>
      <style>{`
        @keyframes shine {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
        .stat-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>

      {/* Welcome Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1" style={{ color: "var(--brand-primary)" }}>
          Hello,{" "}
          {user?.user ? (
            `${user.user.firstname} ${user.user.lastname} 👋`
          ) : (
            <SkeletonPill width={160} height={20} />
          )}
        </h3>
        <p className="text-muted small">
          Welcome to your TechStore Account Dashboard. Here you can view a snapshot of your recent activity, manage shipping addresses, and edit profile details.
        </p>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-lg-3">
          <div className="stat-card p-3 bg-white h-100 d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary" style={{ width: "45px", height: "45px", backgroundColor: "#eff6ff", color: "#3b82f6" }}>
              <i className="bi bi-cart3 fs-5" style={{ color: "var(--brand-primary)" }}></i>
            </div>
            <div>
              <span className="text-muted small d-block fw-semibold text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Total Orders</span>
              <span className="fs-4 fw-bold text-dark">{orders.length}</span>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card p-3 bg-white h-100 d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px", backgroundColor: "#fef2f2", color: "#dc2626" }}>
              <i className="bi bi-bell fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block fw-semibold text-uppercase tracking-wider" style={{ fontSize: "10px" }}>New Alerts</span>
              <span className="fs-4 fw-bold text-dark">{unreadAlerts}</span>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card p-3 bg-white h-100 d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px", backgroundColor: "#f0fdf4", color: "#16a34a" }}>
              <i className="bi bi-geo-alt fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block fw-semibold text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Addresses</span>
              <span className="fs-4 fw-bold text-dark">{addresses.length}</span>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card p-3 bg-white h-100 d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px", backgroundColor: "#faf5ff", color: "#7c3aed" }}>
              <i className="bi bi-gift fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block fw-semibold text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Reward Points</span>
              <span className="fs-4 fw-bold text-dark">120 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mb-5 bg-white border rounded-3 p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold text-dark mb-0" style={{ color: "var(--brand-primary)" }}>Recent Orders</h5>
          {onTabChange && orders.length > 0 && (
            <button 
              onClick={() => onTabChange("orders")}
              className="btn btn-link text-primary text-decoration-none fw-semibold p-0 small"
            >
              View All Orders <i className="bi bi-arrow-right ms-1"></i>
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            <i className="bi bi-inbox fs-2 d-block mb-2 text-muted opacity-50"></i>
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small fw-bold text-uppercase">
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold text-dark font-monospace" style={{ fontSize: "14px" }}>
                      {order.id}
                    </td>
                    <td className="text-muted small">
                      {order.date}
                    </td>
                    <td>
                      <span className={`badge ${
                        (order.status === "paid" || order.status === "Completed") ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                      } px-2.5 py-1 text-uppercase fw-semibold`} style={{ fontSize: "11px" }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-dark">
                      {formatPrice(order.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Info Details */}
      <div className="bg-white border rounded-3 p-4 shadow-sm mb-3">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold text-dark mb-0" style={{ color: "var(--brand-primary)" }}>Account Information</h5>
          {user?.user && (
            <Link to="/user-profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 text-decoration-none">
              <i className="bi bi-pencil-square me-1"></i> Edit Profile
            </Link>
          )}
        </div>

        <div className="row g-4 text-start">
          <div className="col-md-6">
            <span className="text-muted small d-block">Full Name</span>
            <span className="fw-semibold text-dark fs-6">
              {user?.user ? `${user.user.firstname} ${user.user.lastname}` : <SkeletonPill width={160} height={14} />}
            </span>
          </div>

          <div className="col-md-6">
            <span className="text-muted small d-block">Email Address</span>
            <span className="fw-semibold text-dark fs-6">
              {user?.user ? user.user.email : <SkeletonPill width={200} height={14} />}
            </span>
          </div>

          <div className="col-md-6">
            <span className="text-muted small d-block">Phone Number</span>
            <span className="fw-semibold text-dark fs-6">
              {user?.user ? user.user.phone : <SkeletonPill width={140} height={14} />}
            </span>
          </div>

          <div className="col-md-6">
            <span className="text-muted small d-block">Primary Address</span>
            <span className="fw-semibold text-dark fs-6">
              {user?.billing ? (
                `${user.billing.address}, ${user.billing.suburb}, ${user.billing.postcode}`
              ) : (
                <span className="text-muted italic small">No billing address saved</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTab;