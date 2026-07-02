import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FallbackImage from "../Components/FallbackImage";

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


function OrderSummary() {
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const orderId = localStorage.getItem("latest_order_id");

        if (!orderId) {
          navigate("/");
          return;
        }

        const response = await api.get(`/orders/${orderId}/summary`);

        if (response.data.success && response.data.order_summary) {
          const summary = response.data.order_summary;
          setOrderSummary(summary);
        } else {
          setError("Failed to load order summary");
        }
      } catch (err) {
        let errorMessage =
          "Failed to load order details. Please try again later.";

        if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, [navigate]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numericPrice)}`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm rounded-3 d-inline-block px-5 py-4">
          <i className="bi bi-exclamation-triangle-fill fs-2 d-block mb-3"></i>
          <h5 className="fw-bold">{error}</h5>
          <Link to="/shop" className="btn btn-primary mt-3 px-4 rounded-pill">Back to Shop</Link>
        </div>
      </div>
    );
  }

  if (!orderSummary) {
    return (
      <div className="container py-5 text-center style-block">
        <p className="text-muted">No order details available</p>
        <Link to="/shop" className="btn btn-primary mt-3">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = orderSummary.items.reduce(
    (acc, item) => acc + parseFloat(item.unit_price) * item.quantity,
    0
  );

  const deliveryFee = parseFloat(orderSummary.delivery_fee) || 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      <div className="container-fluid py-5" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container py-4 text-center">
          {/* Success Status Card */}
          <div className="bg-white border rounded-3 p-5 shadow-sm mx-auto mb-5 text-center" style={{ maxWidth: "700px" }}>
            <div 
              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="bi bi-check-lg" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h1 className="fw-bold tracking-tight text-dark mb-2">Order Confirmed!</h1>
            <p className="text-muted fs-5 mb-4">
              Thank you for your purchase. Your payment was processed successfully.
            </p>
            <div className="bg-light p-3 rounded-3 d-flex flex-column flex-sm-row justify-content-around gap-2 text-start">
              <div>
                <span className="text-muted small d-block">Order ID</span>
                <span className="fw-bold text-dark">{orderSummary.order_id}</span>
              </div>
              <div className="border-start d-none d-sm-block"></div>
              <div>
                <span className="text-muted small d-block">Order Date</span>
                <span className="fw-bold text-dark">{new Date(orderSummary.order_date).toLocaleDateString()}</span>
              </div>
              <div className="border-start d-none d-sm-block"></div>
              <div>
                <span className="text-muted small d-block">Status</span>
                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold text-uppercase">{orderSummary.order_status}</span>
              </div>
            </div>
          </div>

          <div className="row g-4 text-start">
            {/* Left Column: Items Table */}
            <div className="col-lg-7">
              <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                  Order Details
                </h5>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-muted small fw-bold text-uppercase">
                        <th>Product</th>
                        <th>Name</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderSummary.items.map((item) => (
                        <tr key={item.product_id}>
                          <td className="py-3">
                            <div className="border rounded bg-white p-1" style={{ width: "60px", height: "60px" }}>
                              <FallbackImage
                                src={item.image}
                                alt={item.product_name || "Product"}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            </div>
                          </td>
                          <td className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                            {item.product_name}
                          </td>
                          <td className="text-center text-muted fw-semibold">
                            {item.quantity}
                          </td>
                          <td className="text-end fw-bold text-dark">
                            {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Fees */}
                <div className="bg-light p-3 rounded-3 mt-4">
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Subtotal</span>
                    <span className="fw-semibold text-dark">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Delivery Fee</span>
                    <span className="fw-semibold text-dark">{deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="fw-bold text-dark">Total Amount Paid</span>
                    <span className="fs-4 fw-bold" style={{ color: "var(--brand-primary)" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Customer & Delivery Info */}
            <div className="col-lg-5">
              <div className="bg-white border rounded-3 p-4 shadow-sm h-100 d-flex flex-column">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                  Delivery & Payment Summary
                </h5>

                <div className="row g-4 flex-grow-1">
                  {/* Shipping Address */}
                  <div className="col-12">
                    <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">Shipping Address</h6>
                    {orderSummary.shipping_address ? (
                      <div className="bg-light p-3 rounded-3">
                        <p className="mb-1 fw-semibold text-dark">{orderSummary.shipping_address.address}</p>
                        <p className="mb-0 text-muted small">
                          {orderSummary.shipping_address.suburb}, {orderSummary.shipping_address.state} {orderSummary.shipping_address.postcode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted small">No shipping address available</p>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="col-12">
                    <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">Customer Details</h6>
                    {orderSummary.user_details ? (
                      <div className="bg-light p-3 rounded-3">
                        <p className="mb-1 fw-semibold text-dark">{orderSummary.user_details.name}</p>
                        <p className="mb-1 text-muted small">Email: {orderSummary.user_details.email}</p>
                        <p className="mb-0 text-muted small">Phone: {orderSummary.user_details.phone}</p>
                      </div>
                    ) : (
                      <p className="text-muted small">No customer details available</p>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="col-12">
                    <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">Payment Details</h6>
                    <div className="bg-light p-3 rounded-3">
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Method:</span>
                        <span className="fw-semibold text-dark text-uppercase">{orderSummary.payment_method || "N/A"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Status:</span>
                        <span className="badge bg-success-subtle text-success">{orderSummary.payment_status || "Completed"}</span>
                      </div>
                      {orderSummary.payment_details && (
                        <>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">Transaction ID:</span>
                            <span className="text-dark font-monospace text-truncate" style={{ maxWidth: "150px" }} title={orderSummary.payment_details.payment_id}>
                              {orderSummary.payment_details.payment_id}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between small">
                            <span className="text-muted">Payment Date:</span>
                            <span className="text-dark">{orderSummary.payment_details.payment_date}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <Link to="/shop" className="btn btn-primary w-100 py-3 rounded-3 fw-bold">
                    <i className="bi bi-cart3 me-2"></i> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSummary;