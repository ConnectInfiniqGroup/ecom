import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Clients, carouselData, fetchProducts } from "../Constants/Data";
import ProductCard from "../Components/ProductCard";

import GlobalButton from "../Components/Button";
import ProductCollection from "../Components/ProductCollection";
import Ad1 from "../Assets/Images/ad1.png";
import Ad2 from "../Assets/Images/ad2.png";
import Ad3 from "../Assets/Images/ad3.png";
import Hero from "../Assets/Images/hero.png";

const api = {
  get: async (url) => {
    console.log("Local mock GET:", url);
    if (url.includes("getcategory")) {
      return {
        data: [
          { category_id: 1, categoryname: "Laptops", slug: "laptops" },
          { category_id: 2, categoryname: "Smartphones", slug: "smartphones" },
          { category_id: 3, categoryname: "Accessories", slug: "accessories" }
        ]
      };
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


const ads = [Ad1, Ad2, Ad3];

const Home = () => {
  // Data state
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState("");
  const [activeHeroBar, setActiveHeroBar] = useState(0);
  const [activeAd, setActiveAd] = useState(0);

  // Product limit by screen size
  const getProductLimit = () => {
    const width = window.innerWidth;

    if (width >= 992) return 8; // Desktop
    if (width >= 768) return 6; // Tablet
    return 3; // Mobile
  };

  // Carousel auto-slide
  const carouselRef = useRef(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleSlid = (e) => {
      if (typeof e.to === "number") setActiveHeroBar(e.to);
    };

    el.addEventListener("slid.bs.carousel", handleSlid);
    return () => el.removeEventListener("slid.bs.carousel", handleSlid);
  }, []);

  // Load initial data from cache instantly
  useEffect(() => {
    const loadInitialData = () => {
      const cachedProducts = JSON.parse(
        localStorage.getItem("cached_products") || "[]",
      );

      const cachedItemTypes = JSON.parse(
        localStorage.getItem("cached_item_types") || "[]",
      );

      if (cachedProducts.length > 0) {
        setAllProducts(cachedProducts);
        setProducts(cachedProducts.slice(0, getProductLimit()));
      }

      if (cachedItemTypes.length > 0) {
        setItemTypes(cachedItemTypes);
      }
    };

    loadInitialData();

    loadProducts();
    fetchItemTypes();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();

      if (Array.isArray(data) && data.length > 0) {
        setAllProducts(data);
        setProducts(data.slice(0, getProductLimit()));

        localStorage.setItem("cached_products", JSON.stringify(data));
      }
    } catch (err) {
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await api.get("/items/itemtypes");
      const types = Array.isArray(response.data) ? response.data : [];

      setItemTypes(types);
      localStorage.setItem("cached_item_types", JSON.stringify(types));
    } catch (error) {
    }
  };

  useEffect(() => {
    const updateProductsByScreen = () => {
      const limit = getProductLimit();

      if (!selectedItemType) {
        setProducts(allProducts.slice(0, limit));
        return;
      }

      const filtered = Array.isArray(allProducts)
        ? allProducts.filter((product) => product?.item_type === selectedItemType)
        : [];

      setProducts(filtered.slice(0, limit));
    };

    updateProductsByScreen();

    window.addEventListener("resize", updateProductsByScreen);
    return () => window.removeEventListener("resize", updateProductsByScreen);
  }, [selectedItemType, allProducts]);

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>
          TechStore  | Integrated Security & Automation Solutions
          Australia
        </title>

        <meta
          name="description"
          content="TECHSTORE is a premier Australian security company specializing in Electronic Security, Home Automation, Audio Visual, Data Cabling, and Ducted Vacuum systems. ASIAL accredited with 20+ years of experience delivering integrated, hassle-free solutions."
        />

        <meta
          name="keywords"
          content="TECHSTORE, TechStore Alarm System, security companies Australia, electronic security Sydney, home automation Australia, audio visual installation, data cabling contractors, ducted vacuum systems, ASIAL Silver Member, security license holders, integrated security solutions, Dynalite certified, commercial security, residential automation, access control, CCTV installation Australia"
        />

        <meta name="author" content="TECHSTORE  Australia" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shop.TechStorealarm.com.au/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="TECHSTORE  | Electronic Security & Automation Experts"
        />

        <meta
          property="og:description"
          content="Since 2008, TECHSTORE has delivered premium integrated solutions including security, automation, and AV. Fully licensed (Master License No: 000101930) and ASIAL accredited."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shop.TechStorealarm.com.au/" />
        <meta property="og:site_name" content="TECHSTORE " />

        {/* Social Links */}
        <meta
          property="og:see_also"
          content="https://www.instagram.com/TechStorealarm/"
        />

        <meta
          property="og:see_also"
          content="https://www.facebook.com/p/TechStore-alarms-100071267801808/"
        />

        {/* Facebook */}
        <meta property="fb:app_id" content="#" />

        <meta
          property="fb:admins"
          content="https://www.facebook.com/p/TechStore-alarms-100071267801808/"
        />

        {/* Instagram */}
        <meta name="instagram:title" content="TECHSTORE  Australia" />

        <meta
          name="instagram:description"
          content="Integrated solutions in electronic security, automation, audio visual and data cabling. Trusted Australian security specialists since 2008."
        />

        <meta name="instagram:site" content="@TechStorealarm" />
      </Helmet>

      <div className="container-fluid p-0">
        {/* ===== Hero Section ===== */}
        <section className="py-5 bg-white">
          <div className="container">
            <div className="row align-items-center g-4">
              <div className="col-lg-6 text-start">
                <span className="text-uppercase fw-bold" style={{ color: "var(--brand-light-blue)", fontSize: "14px", letterSpacing: "1px" }}>
                  Smart | Reliable | Secure
                </span>

                <h1 className="fw-bold mt-2 mb-3 display-5" style={{ color: "var(--brand-primary)", lineHeight: "1.2" }}>
                  Advanced Security For Your Peace of Mind
                </h1>

                <p className="text-muted fs-5 mb-4" style={{ maxWidth: "500px" }}>
                  Explore our wide range of innovative , CCTV solutions, and smart security products.
                </p>

                <div className="d-flex gap-3">
                  <Link to="/shop" className="btn btn-primary rounded-pill px-4 py-2 text-decoration-none shadow-sm" style={{ background: "var(--brand-primary)" }}>
                    Shop Now <i className="bi bi-arrow-right"></i>
                  </Link>
                  <Link to="/about" className="btn btn-outline-primary rounded-pill px-4 py-2 text-decoration-none">
                    Explore Solutions
                  </Link>
                </div>
              </div>

              <div className="col-lg-6 text-center">
                <img
                  src={Hero}
                  alt="TechStore "
                  className="img-fluid"
                  style={{ maxHeight: "500px", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== Trust Badges ===== */}
        <section className="py-4 border-top border-bottom bg-white">
          <div className="container">
            <div className="row g-4 text-start">
              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-3">
                <i className="bi bi-patch-check fs-2 text-primary" style={{ color: "var(--brand-primary) !important" }}></i>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>100% Original Products</h6>
                  <span className="text-muted" style={{ fontSize: "12px" }}>Trusted & Certified</span>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-3">
                <i className="bi bi-headset fs-2 text-primary" style={{ color: "var(--brand-primary) !important" }}></i>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>Expert Support</h6>
                  <span className="text-muted" style={{ fontSize: "12px" }}>24/7 Assistance</span>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-3">
                <i className="bi bi-credit-card-2-front fs-2 text-primary" style={{ color: "var(--brand-primary) !important" }}></i>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>Secure Payments</h6>
                  <span className="text-muted" style={{ fontSize: "12px" }}>100% Protected</span>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-3">
                <i className="bi bi-arrow-left-right fs-2 text-primary" style={{ color: "var(--brand-primary) !important" }}></i>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>Easy Returns</h6>
                  <span className="text-muted" style={{ fontSize: "12px" }}>Hassle Free</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Category Cards Row ===== */}
        <ProductCollection />

        {/* ===== Featured Products ===== */}
        <section className="container pb-5 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark mb-0 heading">Featured Products</h3>
            <Link to="/shop" className="text-decoration-none fw-semibold d-flex align-items-center gap-1" style={{ color: "var(--brand-light-blue)" }}>
              View All Products <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {/* Item Type Filter */}
          <div className="d-flex flex-wrap gap-2 pt-2 pb-4">
            <button
              className={`btn rounded-pill px-4 py-2 fw-semibold transition-all ${selectedItemType === ""
                  ? "btn-primary shadow-sm text-white"
                  : "btn-light shadow-sm text-dark border border-light"
                }`}
              onClick={() => setSelectedItemType("")}
              style={{ fontSize: "13px" }}
            >
              All
            </button>

            {itemTypes.map((type) => (
              <button
                key={type}
                className={`btn rounded-pill px-4 py-2 fw-semibold transition-all ${selectedItemType === type
                    ? "btn-primary shadow-sm text-white"
                    : "btn-light shadow-sm text-dark border border-light"
                  }`}
                onClick={() => setSelectedItemType(type)}
                style={{ fontSize: "13px" }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Display Products */}
          <div className="row row-cols-2 row-cols-md-2 row-cols-lg-4 g-4 pt-3 text-start">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <div
                  key={
                    product?.id ??
                    product?.slug ??
                    `p-${product?.sku ?? product?.name}`
                  }
                  className="col"
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 w-100">
                <div className="p-5 bg-white border border-light rounded-3 d-inline-block shadow-sm">
                  <i className="bi bi-box-seam display-1 text-muted mb-4 d-block opacity-50"></i>
                  <h3 className="fw-bold text-dark mb-3">No products available</h3>
                  <p className="text-muted mb-4 px-4">
                    Check back later or browse our other categories.
                  </p>
                  <Link to="/shop" className="btn btn-primary rounded-pill px-4 py-2 text-decoration-none">
                    Browse All Products
                  </Link>
                </div>
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="d-flex justify-content-center mt-5">
              <Link to="/shop" className="btn btn-outline-primary rounded-pill px-5 py-2 text-decoration-none">
                View More
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;