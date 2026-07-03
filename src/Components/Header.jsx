import Logo from "../Assets/Images/logo.png";
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { Container } from "react-bootstrap";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartContext";
import { useCompare } from "./CompareContext";

import GlobalButton from "./Button";
import { Offcanvas, Modal } from "bootstrap";
import FallbackImage, { FALLBACK_IMAGE } from "./FallbackImage";

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



const Header = ({ isLoggedIn }) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideTopHeader, setHideTopHeader] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const lastScrollY = useRef(0);
  const headerRef = useRef(null);
  const cartOffcanvasInstanceRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    cart,
    error,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    formatImageUrl,
    forceRefreshCart,
  } = useCart();

  const { items: compareItems } = useCompare();
  const compareCount = compareItems?.length || 0;

  const getNavLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? "text-primary" : ""}`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `nav-link fw-bold ${isActive ? "text-primary" : "text-white"}`;

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHideTopHeader(true);
      } else {
        setHideTopHeader(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/getcategory");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate(`/shop`);
    }
  };

  const measureHeader = () => {
    if (!headerRef.current) return;

    const h = headerRef.current.offsetHeight || 0;
    document.documentElement.style.setProperty("--header-height", `${h}px`);
  };

  useLayoutEffect(() => {
    measureHeader();

    const t = setTimeout(measureHeader, 0);
    window.addEventListener("resize", measureHeader);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measureHeader);
    };
  }, [hideTopHeader]);

  useEffect(() => {
    const offcanvasEl = document.getElementById("cartOffcanvas");

    if (offcanvasEl) {
      cartOffcanvasInstanceRef.current = new Offcanvas(offcanvasEl, {
        backdrop: true,
        scroll: false,
      });

      offcanvasEl.addEventListener("show.bs.offcanvas", () => {
        setCartVisible(true);
      });

      offcanvasEl.addEventListener("hide.bs.offcanvas", () => {
        setCartVisible(false);
      });
    }

    return () => {
      cartOffcanvasInstanceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      measureHeader();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const getOffcanvasInstance = () => {
    const el = document.getElementById("mobileMenu");
    if (!el) return null;

    return Offcanvas.getInstance(el) || new Offcanvas(el);
  };

  const closeMobileMenu = () => {
    const inst = getOffcanvasInstance();
    inst?.hide();
  };

  const openCompareModal = () => {
    const el = document.getElementById("compareModal");
    if (!el) return;

    Modal.getOrCreateInstance(el).show();
  };

  const toggleCart = () => {
    cartOffcanvasInstanceRef.current?.toggle();
  };

  const hideCart = () => {
    cartOffcanvasInstanceRef.current?.hide();
  };

  const handleClearCart = () => {
    if (cartCount === 0) return;

    clearCart();
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest(".account-dropdown")) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleOffcanvasClick = (e) => {
    const target = e.target.closest("a, button, [data-close-offcanvas]");

    if (!target) return;
    if (target.closest("[data-account-toggle]")) return;

    closeMobileMenu();
  };

  useEffect(() => {
    const isReturningFromCheckout =
      document.referrer.includes("/checkout") ||
      document.referrer.includes("/success");

    if (isReturningFromCheckout && location.pathname === "/") {
      forceRefreshCart();
    }
  }, [location, forceRefreshCart]);

  const formatCartTotal = () => {
    const total =
      typeof cartTotal === "string" ? parseFloat(cartTotal) : Number(cartTotal);

    if (isNaN(total)) return "0";

    if (total % 1 === 0) {
      return new Intl.NumberFormat("en-US").format(total);
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);
  };

  const handleUpdateQuantity = (productId, change) => {
    updateCartQuantity(productId, change);
  };

  const getCartItemImage = (item) => {
    if (!item) return FALLBACK_IMAGE;

    const imageSources = [
      item.formattedImage,
      item.images?.[0]?.imgurl,
      item.imgurl,
      item.image,
      item.images?.[0],
      item.images,
      item.product_image,
    ];

    for (const source of imageSources) {
      if (!source) continue;

      const formatted = formatImageUrl(source);

      if (
        formatted &&
        formatted !== FALLBACK_IMAGE &&
        !formatted.includes("undefined") &&
        !formatted.includes("null")
      ) {
        return formatted;
      }
    }

    return FALLBACK_IMAGE;
  };

  const getProductDetails = (item) => {
    const productName =
      item?.productname ||
      item?.name ||
      item?.product_name ||
      item?.title ||
      "Unknown Product";

    const quantity =
      Number(item?.pro_quantity) ||
      Number(item?.quantity) ||
      Number(item?.qty) ||
      1;

    const price =
      parseFloat(item?.pro_price) ||
      parseFloat(item?.price) ||
      parseFloat(item?.product_price) ||
      parseFloat(item?.original_price) ||
      0;

    const size = item?.size || item?.product_size || "M";
    const productId = item?.product_id || item?.id || "unknown";
    const imageUrl = getCartItemImage(item);

    return {
      id: productId,
      name: productName,
      price,
      quantity,
      size,
      image: imageUrl,
    };
  };

  const handleCheckoutClick = () => {
    hideCart();
    navigate("/checkout");
  };

  const toggleAccount = (e) => {
    e.stopPropagation();
    setAccountOpen((s) => !s);
  };

  return (
    <>
      <div
        ref={headerRef}
        className="shop-header fixed-top w-100 bg-white border-bottom shadow-sm"
        style={{ zIndex: 1040 }}
      >
        <Container>
          {/* Desktop Top Header Bar */}
          <div className="d-none d-lg-flex align-items-center justify-content-between py-3">
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "140px", objectFit: "contain" }} />
            </Link>

            <form onSubmit={handleSearchSubmit} className="d-flex flex-grow-1 mx-5" style={{ maxWidth: "500px" }}>
              <div className="input-group" style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <input
                  type="text"
                  className="form-control border-0 px-4"
                  placeholder="Search for products, categories..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  style={{ fontSize: "14px", height: "42px", outline: "none", boxShadow: "none", background: "#f8fafc" }}
                />
                <button className="btn btn-primary px-3 border-0 d-flex align-items-center justify-content-center" type="submit" style={{ backgroundColor: "var(--brand-primary)", borderRadius: "0 !important" }}>
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            <div className="d-flex align-items-center gap-4">
              <span
                onClick={openCompareModal}
                className="d-flex align-items-center gap-2 position-relative text-dark text-decoration-none fw-semibold"
                style={{ cursor: "pointer", fontSize: "14px" }}
                data-bs-toggle="modal"
                data-bs-target="#compareModal"
              >
                <i className="bi bi-shuffle fs-5" style={{ color: "var(--brand-primary)" }}></i>
                <span>Compare</span>
                {compareCount > 0 && (
                  <span className="badge bg-danger rounded-pill position-absolute" style={{ fontSize: "8px", top: "-5px", right: "-10px", padding: "2px 5px" }}>
                    {compareCount}
                  </span>
                )}
              </span>

              <Link
                to="/dashboard"
                onClick={() => {
                  localStorage.setItem("dashboardActiveTab", "wishlist");
                }}
                className="d-flex align-items-center gap-2 text-dark text-decoration-none fw-semibold"
                style={{ fontSize: "14px" }}
              >
                <i className="bi bi-heart fs-5" style={{ color: "var(--brand-primary)" }}></i>
                <span>Wishlist</span>
              </Link>

              <span
                onClick={toggleCart}
                className="d-flex align-items-center gap-2 position-relative text-dark text-decoration-none fw-semibold"
                style={{ cursor: "pointer", fontSize: "14px" }}
              >
                <i className="bi bi-cart fs-5" style={{ color: "var(--brand-primary)" }}></i>
                <span>My Cart</span>
                <span className="badge bg-danger rounded-pill" style={{ fontSize: "10px", padding: "3px 6px" }}>
                  {cartCount}
                </span>
              </span>

              <div className="dropdown account-dropdown position-relative">
                <span
                  className="d-flex align-items-center gap-1 text-dark fw-semibold"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                  onClick={toggleAccount}
                >
                  <i className="bi bi-person-circle fs-5" style={{ color: "var(--brand-primary)" }}></i>
                  <span>Account</span>
                </span>
                <ul
                  className={`dropdown-menu position-absolute end-0 mt-2 rounded shadow border-0 ${accountOpen ? "show" : ""}`}
                  style={{ zIndex: 1050, display: accountOpen ? "block" : "none", right: 0 }}
                >
                  {isLoggedIn ? (
                    <>
                      <li>
                        <Link 
                          className="dropdown-item py-2 fw-semibold" 
                          to="/dashboard" 
                          onClick={() => {
                            localStorage.setItem("dashboardActiveTab", "dashboard");
                            setAccountOpen(false);
                          }}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 fw-semibold" to="/user-profile" onClick={() => setAccountOpen(false)}>
                          Edit Profile
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item py-2 fw-semibold" to="/login" onClick={() => setAccountOpen(false)}>
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 fw-semibold" to="/register" onClick={() => setAccountOpen(false)}>
                          Register
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 fw-semibold text-success" to="/dashboard" onClick={() => setAccountOpen(false)}>
                          Dashboard (Demo)
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop Bottom Navigation Bar */}
          <div className="d-none d-lg-flex align-items-center py-2 border-top">
            <div className="dropdown">
              <button
                className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 text-white border-0 dropdown-toggle"
                type="button"
                id="categoriesDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ backgroundColor: "var(--brand-primary)", borderRadius: "6px !important", fontSize: "14px" }}
              >
                <i className="bi bi-grid-fill"></i>
                <span>All Categories</span>
              </button>
              <ul className="dropdown-menu border-0 shadow" aria-labelledby="categoriesDropdown" style={{ borderTop: "3px solid var(--brand-primary) !important" }}>
                {categories.map((cat) => (
                  <li key={cat.category_id}>
                    <Link
                      className="dropdown-item py-2"
                      to={`/shop?category=${cat.category_id}`}
                    >
                      {cat.categoryname}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="d-flex align-items-center gap-4 ms-4">
              <NavLink 
                className={({ isActive }) => `nav-link fw-bold text-uppercase px-2 ${isActive ? 'active-nav-link' : 'text-dark'}`} 
                style={{ fontSize: "13px", letterSpacing: "0.5px" }} 
                to="/" 
                end
              >
                Home
              </NavLink>
              <NavLink 
                className={({ isActive }) => `nav-link fw-bold text-uppercase px-2 ${isActive ? 'active-nav-link' : 'text-dark'}`} 
                style={{ fontSize: "13px", letterSpacing: "0.5px" }} 
                to="/shop"
              >
                Shop
              </NavLink>
              <NavLink 
                className={({ isActive }) => `nav-link fw-bold text-uppercase px-2 ${isActive ? 'active-nav-link' : 'text-dark'}`} 
                style={{ fontSize: "13px", letterSpacing: "0.5px" }} 
                to="/categories"
              >
                Categories
              </NavLink>
              <NavLink 
                className={({ isActive }) => `nav-link fw-bold text-uppercase px-2 ${isActive ? 'active-nav-link' : 'text-dark'}`} 
                style={{ fontSize: "13px", letterSpacing: "0.5px" }} 
                to="/about"
              >
                About Us
              </NavLink>
              <NavLink 
                className={({ isActive }) => `nav-link fw-bold text-uppercase px-2 ${isActive ? 'active-nav-link' : 'text-dark'}`} 
                style={{ fontSize: "13px", letterSpacing: "0.5px" }} 
                to="/contact"
              >
                Contact Us
              </NavLink>
            </div>

            <div className="ms-auto d-flex align-items-center gap-2">
              <i className="bi bi-telephone-fill" style={{ color: "var(--brand-primary)", fontSize: "18px" }}></i>
              <div className="d-flex flex-column text-start">
                <a href="tel:+911234567890" className="text-decoration-none fw-bold text-dark mb-0" style={{ fontSize: "14px", lineHeight: "1.2" }}>
                  +1 234 567 8900
                </a>
                <span className="text-muted" style={{ fontSize: "10px" }}>Mon - Sat: 9:00 - 6:00</span>
              </div>
            </div>
          </div>

          {/* Mobile Header Bar (< 992px) */}
          <div className="d-lg-none d-flex align-items-center justify-content-between py-2">
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "60px", objectFit: "contain" }} />
            </Link>

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn p-0 position-relative border-0 bg-transparent text-dark"
                data-bs-toggle="modal"
                data-bs-target="#compareModal"
                onClick={openCompareModal}
                aria-label="Open compare"
              >
                <i className="bi bi-shuffle fs-4"></i>
                {compareCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "9px" }}>
                    {compareCount}
                  </span>
                )}
              </button>

              <span
                onClick={toggleCart}
                style={{ position: "relative", cursor: "pointer" }}
                className="d-flex align-items-center text-dark"
              >
                <i className="bi bi-cart fs-4"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "9px" }}>
                    {cartCount}
                  </span>
                )}
              </span>

              <button
                className="navbar-toggler border-0"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileMenu"
                aria-controls="mobileMenu"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => setAccountOpen(false)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="cartOffcanvas">
        <div className="offcanvas-header bg-white border-bottom">
          <h5 className="offcanvas-title heading" style={{ color: "var(--brand-primary)" }}>
            My Cart ({cartCount})
            {cartCount > 0 && (
              <span className="ms-2 text-danger">• {cartCount} items</span>
            )}
          </h5>

          <button
            type="button"
            className="btn-close bg-light text-dark p-2 rounded-0"
            aria-label="Close"
            onClick={hideCart}
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body d-flex flex-column p-0">
          {cartCount === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <p>Your cart is empty.</p>

              <button
                className="btn btn-outline-primary rounded-pill mt-2"
                onClick={hideCart}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="px-3 pt-3 pb-2 border-bottom bg-light">
                <div className="d-flex justify-content-between mb-1 text-start">
                  <span className="small fw-semibold text-dark">
                    {parseFloat(cartTotal) >= 5000 ? (
                      <span className="text-success fw-bold"><i className="bi bi-truck me-1"></i> You qualify for Free Shipping!</span>
                    ) : (
                      <span>Add <span className="fw-bold">₹{5000 - Math.floor(parseFloat(cartTotal) || 0)}</span> more for Free Shipping!</span>
                    )}
                  </span>
                </div>
                <div className="free-shipping-progress-container mt-1">
                  <div
                    className={`free-shipping-progress-bar ${parseFloat(cartTotal) >= 5000 ? 'free-shipping-success-bar' : ''}`}
                    style={{ width: `${Math.min(100, ((parseFloat(cartTotal) || 0) / 5000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex-grow-1 overflow-auto p-3">
                <div className="d-flex justify-content-end mb-2">
                  <button
                    className="btn btn-link text-danger fw-semibold small text-decoration-none p-0"
                    onClick={handleClearCart}
                    style={{ cursor: "pointer" }}
                  >
                    Clear Cart
                  </button>
                </div>

                {cart.map((item, index) => {
                  const productDetails = getProductDetails(item);

                  return (
                    <div
                      key={`${productDetails.id}-${index}`}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <FallbackImage
                        src={productDetails.image}
                        alt={productDetails.name}
                        width="70"
                        height="70"
                        style={{
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                      />

                      <div className="flex-grow-1 ms-3">
                        <p className="mb-0 fw-semibold small text-dark">
                          {productDetails.name}
                        </p>

                        <p className="mb-0 text-muted small">
                          Size: {productDetails.size} | Qty:{" "}
                          {productDetails.quantity}
                        </p>

                        <p className="mb-0 fw-semibold" style={{ color: "var(--brand-primary)" }}>
                          ₹
                          {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
                            productDetails.price * productDetails.quantity
                          )}
                        </p>
                      </div>

                      <div className="d-flex flex-column align-items-end justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary border-0 text-danger"
                          onClick={() => removeFromCart(productDetails.id)}
                          style={{ padding: "4px" }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>

                        <div className="d-flex align-items-center border rounded-pill p-1 bg-light">
                          <button
                            className="btn btn-sm btn-light bg-transparent border-0 rounded-circle"
                            onClick={() =>
                              handleUpdateQuantity(productDetails.id, -1)
                            }
                            disabled={productDetails.quantity <= 1}
                            style={{ padding: "2px 6px" }}
                          >
                            <i className="bi bi-dash small"></i>
                          </button>

                          <span className="mx-2 small fw-semibold">
                            {productDetails.quantity}
                          </span>

                          <button
                            className="btn btn-sm btn-light bg-transparent border-0 rounded-circle"
                            onClick={() =>
                              handleUpdateQuantity(productDetails.id, 1)
                            }
                            style={{ padding: "2px 6px" }}
                          >
                            <i className="bi bi-plus small"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto p-3 border-top bg-white">
                <div className="d-flex gap-2 pb-2 justify-content-between heading">
                  <h6 className="m-0">Sub Total:</h6>
                  <span className="fw-bold fs-5" style={{ color: "var(--brand-primary)" }}>
                    ₹{formatCartTotal()}
                  </span>
                </div>

                <div className="d-flex gap-3 justify-content-between border-top pt-3">
                  <Link
                    to="/cart"
                    className="btn btn-outline-primary px-4 py-2 rounded-pill text-decoration-none flex-grow-1"
                    onClick={() => {
                      closeMobileMenu();
                      hideCart();
                    }}
                  >
                    View Cart
                  </Link>

                  <GlobalButton
                    to="/checkout"
                    onClick={handleCheckoutClick}
                    className="flex-grow-1 rounded-pill btn-primary text-white"
                  >
                    Checkout
                  </GlobalButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end w-100"
        tabIndex="-1"
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
        onClickCapture={handleOffcanvasClick}
      >
        <div className="offcanvas-header bg-white border-bottom py-3">
          <Link
            className="navbar-brand p-0 d-flex align-items-center"
            to="/"
            onClick={closeMobileMenu}
          >
            <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "60px", objectFit: "contain" }} />
          </Link>

          <button
            type="button"
            className="btn-close me-2"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body bg-light d-flex flex-column justify-content-start align-items-stretch p-4">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="input-group" style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <input
                type="text"
                className="form-control border-0 px-4"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ fontSize: "14px", height: "42px", outline: "none", boxShadow: "none" }}
              />
              <button className="btn btn-primary px-3 border-0 d-flex align-items-center justify-content-center" type="submit" style={{ backgroundColor: "var(--brand-primary)", borderRadius: "0 !important" }}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <ul className="navbar-nav text-center heading text-dark gap-3 mb-4">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-bold text-dark text-uppercase fs-5 ${isActive ? 'active-nav-link-mobile' : ''}`}
                to="/"
                end
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-bold text-dark text-uppercase fs-5 ${isActive ? 'active-nav-link-mobile' : ''}`}
                to="/shop"
                onClick={closeMobileMenu}
              >
                Shop
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-bold text-dark text-uppercase fs-5 ${isActive ? 'active-nav-link-mobile' : ''}`}
                to="/categories"
                onClick={closeMobileMenu}
              >
                Categories
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-bold text-dark text-uppercase fs-5 ${isActive ? 'active-nav-link-mobile' : ''}`}
                to="/about"
                onClick={closeMobileMenu}
              >
                About Us
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-bold text-dark text-uppercase fs-5 ${isActive ? 'active-nav-link-mobile' : ''}`}
                to="/contact"
                onClick={closeMobileMenu}
              >
                Contact Us
              </NavLink>
            </li>
          </ul>

          <div className="mt-auto border-top pt-4">
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-telephone-fill" style={{ color: "var(--brand-primary)", fontSize: "18px" }}></i>
                <a href="tel:+911234567890" className="text-decoration-none fw-bold text-dark fs-5">
                  +1 234 567 8900
                </a>
              </div>
              <div className="text-center">
                {isLoggedIn ? (
                  <Link 
                    to="/dashboard" 
                    className="btn btn-primary rounded-pill w-100" 
                    onClick={() => {
                      localStorage.setItem("dashboardActiveTab", "dashboard");
                      closeMobileMenu();
                    }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="d-flex flex-column gap-2 w-100">
                    <div className="d-flex gap-2 w-100">
                      <Link to="/login" className="btn btn-outline-primary rounded-pill flex-grow-1" onClick={closeMobileMenu}>
                        Login
                      </Link>
                      <Link to="/register" className="btn btn-primary rounded-pill flex-grow-1" onClick={closeMobileMenu}>
                        Register
                      </Link>
                    </div>
                    <Link to="/dashboard" className="btn btn-outline-success rounded-pill w-100 mt-2" onClick={closeMobileMenu}>
                      Dashboard (Demo)
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;