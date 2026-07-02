import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";
import FallbackImage, { FALLBACK_IMAGE } from "../Components/FallbackImage";

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


const Cart = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const loadInitialCart = () => {
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        setCart(guestCart);
      } else {
        const cachedCart = JSON.parse(
          localStorage.getItem("cached_cart") || "[]"
        );
        setCart(cachedCart);
      }
    };

    loadInitialCart();
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setError("");

    try {
      if (!token) {
        const guestCart = JSON.parse(
          localStorage.getItem("guest_cart") || "[]"
        );

        if (guestCart.length === 0) {
          return;
        }

        const { data: allProducts } = await api.get("/products");

        const enrichedGuestCart = guestCart.map((item) => {
          const product = allProducts.find((p) => p.id === item.id);

          if (!product) return item;

          return {
            ...item,
            productname: product.productname,
            pro_price: product.pro_price,
            images: product.images,
          };
        });

        setCart(enrichedGuestCart);
        return;
      }

      const res = await api.get("/cart/view");
      const cartData = res.data || [];

      setCart(cartData);
      localStorage.setItem("cached_cart", JSON.stringify(cartData));
    } catch (err) {
      setError("Failed to load cart. Please try again.");
    }
  };

  const updateQuantity = async (productId, change) => {
    const item = cart.find(
      (i) => i.product_id === productId || i.id === productId
    );

    const currentQuantity = item?.pro_quantity || item?.quantity || 0;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) => {
      if (item.product_id === productId || item.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          pro_quantity: newQuantity,
        };
      }

      return item;
    });

    setCart(updatedCart);

    try {
      if (!token) {
        localStorage.setItem(
          "guest_cart",
          JSON.stringify(
            updatedCart.map(({ productname, pro_price, images, ...rest }) => rest)
          )
        );
        return;
      }

      await api.put(`/cart/${productId}/update`, { quantity: newQuantity });
      localStorage.setItem("cached_cart", JSON.stringify(updatedCart));
    } catch (err) {
      setCart(cart);
      alert("Failed to update quantity.");
    }
  };

  const removeFromCart = async (productId) => {
    const previousCart = [...cart];

    const updatedCart = cart.filter(
      (item) => item.id !== productId && item.product_id !== productId
    );

    setCart(updatedCart);

    try {
      if (!token) {
        localStorage.setItem(
          "guest_cart",
          JSON.stringify(
            updatedCart.map(({ productname, pro_price, images, ...rest }) => rest)
          )
        );
        return;
      }

      await api.delete(`/cart/${productId}/remove`);
      localStorage.setItem("cached_cart", JSON.stringify(updatedCart));
    } catch (err) {
      setCart(previousCart);
      alert("Failed to remove item.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Add items before checkout.");
      return;
    }

    navigate("/checkout");
  };

  const formatImageUrl = (images) => {
    if (!images || images.length === 0) return FALLBACK_IMAGE;

    const firstImage = images[0];

    if (!firstImage) return FALLBACK_IMAGE;

    if (typeof firstImage === "string") {
      return firstImage.startsWith("http")
        ? firstImage
        : `${import.meta.env.VITE_API_URL || ""}${firstImage}`;
    }

    if (firstImage.imgurl) {
      return firstImage.imgurl.startsWith("http")
        ? firstImage.imgurl
        : `${import.meta.env.VITE_API_URL || ""}${firstImage.imgurl}`;
    }

    return FALLBACK_IMAGE;
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numericPrice)}`;
  };

  const numericTotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.pro_price) || 0;
    const qty = item.pro_quantity || item.quantity || 0;
    return sum + price * qty;
  }, 0);

  const gstIncluded = numericTotal * 0.18; // 18% GST included or breakdown

  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
      <PageHeader title="Shopping Cart" path="Home / Cart" />

      <div className="container py-5 text-start">
        {error && (
          <div className="alert alert-warning text-center rounded-3 shadow-sm mb-4">
            {error} Showing cached data.
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center bg-white border rounded-3 p-5 shadow-sm">
            <div className="mb-4">
              <i className="bi bi-cart-x text-muted" style={{ fontSize: "4rem" }}></i>
            </div>
            <h4 className="fw-bold text-dark">Your cart is empty!</h4>
            <p className="text-muted mb-4">Add products to your cart to see them here.</p>
            <Link to="/shop" className="btn btn-primary px-5 py-3 rounded-pill">
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Cart Items */}
            <div className="col-lg-8">
              {/* Desktop Table View */}
              <div className="d-none d-md-block bg-white border rounded-3 shadow-sm p-4 mb-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="text-uppercase text-muted small fw-bold">
                        <th className="border-0 px-4 py-3">Product</th>
                        <th className="border-0 py-3">Price</th>
                        <th className="border-0 py-3">Quantity</th>
                        <th className="border-0 py-3">Total</th>
                        <th className="border-0 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => {
                        const productId = item.product_id || item.id;
                        const quantity = item.pro_quantity || item.quantity || 0;
                        const price = parseFloat(item.pro_price || 0);
                        const itemTotal = price * quantity;

                        return (
                          <tr key={`${productId}-${item.size || "default"}`}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="border rounded bg-white p-1" style={{ width: "70px", height: "70px" }}>
                                  <FallbackImage
                                    src={formatImageUrl(item.images)}
                                    alt={item.productname || "Product"}
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                  />
                                </div>
                                <div>
                                  <span className="fw-bold text-dark d-block" style={{ fontSize: "14px" }}>
                                    {item.productname || "Product"}
                                  </span>
                                  {item.size && (
                                    <span className="text-muted small">Size: {item.size}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="fw-bold text-dark">{formatPrice(price)}</td>
                            <td>
                              <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-3 d-inline-flex">
                                <button
                                  className="btn btn-sm bg-transparent border-0 p-0"
                                  onClick={() => updateQuantity(productId, -1)}
                                  disabled={quantity <= 1}
                                >
                                  <i className="bi bi-dash text-dark fs-5"></i>
                                </button>
                                <span className="fw-bold text-dark">{quantity}</span>
                                <button
                                  className="btn btn-sm bg-transparent border-0 p-0"
                                  onClick={() => updateQuantity(productId, 1)}
                                >
                                  <i className="bi bi-plus text-dark fs-5"></i>
                                </button>
                              </div>
                            </td>
                            <td className="fw-bold text-primary">{formatPrice(itemTotal)}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-light rounded-circle text-danger p-2 hover-lift"
                                style={{ width: "38px", height: "38px" }}
                                onClick={() => removeFromCart(productId)}
                                title="Remove item"
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile List View */}
              <div className="d-block d-md-none">
                {cart.map((item) => {
                  const productId = item.product_id || item.id;
                  const quantity = item.pro_quantity || item.quantity || 0;
                  const price = parseFloat(item.pro_price || 0);
                  const itemTotal = price * quantity;

                  return (
                    <div
                      key={`${productId}-${item.size || "default"}`}
                      className="bg-white border rounded-3 shadow-sm p-3 mb-3"
                    >
                      <div className="d-flex gap-3">
                        <div className="border rounded bg-white p-1" style={{ width: "80px", height: "80px" }}>
                          <FallbackImage
                            src={formatImageUrl(item.images)}
                            alt={item.productname || "Product"}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
                            {item.productname || "Product"}
                          </h6>
                          <div className="text-muted small mb-1">Price: {formatPrice(price)}</div>
                          <div className="fw-bold text-primary mb-2">Total: {formatPrice(itemTotal)}</div>

                          <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                            <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-3">
                              <button
                                className="btn btn-sm bg-transparent border-0 p-0"
                                onClick={() => updateQuantity(productId, -1)}
                                disabled={quantity <= 1}
                              >
                                <i className="bi bi-dash text-dark fs-5"></i>
                              </button>
                              <span className="fw-bold text-dark">{quantity}</span>
                              <button
                                className="btn btn-sm bg-transparent border-0 p-0"
                                onClick={() => updateQuantity(productId, 1)}
                              >
                                <i className="bi bi-plus text-dark fs-5"></i>
                              </button>
                            </div>
                            <button
                              className="btn btn-light rounded-circle text-danger p-2"
                              style={{ width: "36px", height: "36px" }}
                              onClick={() => removeFromCart(productId)}
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Back to Shop Link */}
              <div className="mt-3">
                <Link to="/shop" className="btn btn-outline-primary px-4 py-2">
                  <i className="bi bi-arrow-left me-2"></i> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-4">
              <div className="bg-white border rounded-3 p-4 shadow-sm">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                  Order Summary
                </h5>

                {/* Free Shipping Progress Indicator */}
                <div className="mb-4 p-3 bg-light rounded-3 text-start">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small fw-semibold text-dark">
                      {numericTotal >= 5000 ? (
                        <span className="text-success fw-bold"><i className="bi bi-truck me-1"></i> You qualify for Free Shipping!</span>
                      ) : (
                        <span>Add <span className="fw-bold">{formatPrice(5000 - numericTotal)}</span> more for Free Shipping!</span>
                      )}
                    </span>
                  </div>
                  <div className="free-shipping-progress-container mt-1">
                    <div
                      className={`free-shipping-progress-bar ${numericTotal >= 5000 ? 'free-shipping-success-bar' : ''}`}
                      style={{ width: `${Math.min(100, (numericTotal / 5000) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex justify-content-between text-muted">
                    <span>Subtotal</span>
                    <span className="fw-semibold text-dark">{formatPrice(numericTotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Shipping</span>
                    <span className="text-success fw-bold">Free</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>GST (18% included)</span>
                    <span>{formatPrice(gstIncluded)}</span>
                  </div>
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="fw-bold text-dark">Total</span>
                    <span className="fs-3 fw-bold" style={{ color: "var(--brand-primary)" }}>
                      {formatPrice(numericTotal)}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 py-3 mb-3"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  style={{ fontSize: "15px" }}
                >
                  Proceed to Checkout <i className="bi bi-arrow-right ms-2"></i>
                </button>

                {/* Secure checkout assurances */}
                <div className="mt-4 pt-4 border-top text-center">
                  <p className="text-muted small mb-3">
                    <i className="bi bi-shield-lock-fill text-success me-2"></i> Secure & SSL Protected Checkout
                  </p>
                  <FallbackImage
                    src="https://themes.pixelstrap.com/multikart/assets/images/product-details/payments.png"
                    alt="Payment Options"
                    className="img-fluid opacity-75"
                    style={{ maxHeight: "30px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;