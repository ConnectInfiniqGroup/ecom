import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import PageBanner from "../Components/PageBanner";
import Banner from "../Assets/Images/2.png";
import PageHeader from "../Components/PageHeader";
import GlobalButton from "../Components/Button";

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


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [firstAttemptDone, setFirstAttemptDone] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/getcategory");
      console.log("Categories response:", response);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const data = response.data;
      const list = data?.products ?? data ?? [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      throw new Error("Failed to fetch products");
    }
  };

  const loadData = async () => {
    setError(null);
    setFirstAttemptDone(false);
    try {
      const catsP = fetchCategories()
        .then((cats) => setCategories(cats))
        .catch(() => {
          setError((prev) => prev ?? "Failed to load categories.");
        });

      const prodsP = fetchProducts()
        .then((prods) => setProducts(prods))
        .catch(() => {
          setError((prev) => prev ?? "Failed to load products.");
        });

      await Promise.allSettled([catsP, prodsP]);
    } finally {
      setFirstAttemptDone(true);
    }
  };

  const handleRetry = () => setRetryCount((p) => p + 1);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Calculate product counts per category
  const categoryProductCounts = useMemo(() => {
    const counts = {};
    for (const cat of categories || []) {
      const count = products.filter((p) => {
        const pid = p?.category_id;
        const arr = p?.categories;
        const nested = p?.category?.id;
        return (
          String(pid) === String(cat?.id) ||
          (Array.isArray(arr) && arr.map(String).includes(String(cat?.id))) ||
          String(nested) === String(cat?.id)
        );
      }).length;
      counts[cat?.id] = count;
    }
    return counts;
  }, [categories, products]);

  // Get category image from first product
  const normalizeImageUrl = (p) => {
    const fromArray =
      p?.images?.[0]?.imgurl || p?.images?.[0]?.url || p?.images?.[0];
    const single =
      p?.image?.imgurl || p?.image?.url || p?.imgurl || p?.url || p?.thumbnail;
    return fromArray || single || null;
  };

  const categoryImageMap = useMemo(() => {
    const map = {};
    for (const cat of categories || []) {
      const match = products.find((p) => {
        const pid = p?.category_id;
        const arr = p?.categories;
        const nested = p?.category?.id;
        return (
          String(pid) === String(cat?.id) ||
          (Array.isArray(arr) && arr.map(String).includes(String(cat?.id))) ||
          String(nested) === String(cat?.id)
        );
      });
      map[cat?.id] = match ? normalizeImageUrl(match) : null;
    }
    return map;
  }, [categories, products]);

  // Skeleton card component
  const SkeletonCard = () => (
    <div className="col-6 col-lg-3 mb-4">
      <div className="card h-100 border rounded-3 overflow-hidden text-center shadow-sm">
        <div
          className="img-fluid w-100 category-img-container"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 37%, rgba(0,0,0,0.05) 63%)",
            backgroundSize: "400% 100%",
            animation: "shine 1.4s ease infinite",
          }}
        />
        <div className="card-body">
          <div
            className="placeholder-wave mx-auto mb-2"
            style={{
              width: 80,
              height: 20,
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          />
          <div
            className="placeholder-wave mt-3 mx-auto"
            style={{
              width: 120,
              height: 24,
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          />
          <div
            className="placeholder-wave mt-3 mx-auto"
            style={{
              width: "100%",
              height: 60,
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          />
          <div className="d-flex justify-content-center mt-4">
            <div
              className="placeholder-wave"
              style={{
                width: 100,
                height: 38,
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>Categories | TechStore Alarm Systems</title>
        <meta
          name="description"
          content="TECHSTORE is a premier Australian security company specializing in Electronic Security, Home Automation, Audio Visual, Data Cabling, and Ducted Vacuum systems. ASIAL accredited with 20+ years of experience delivering integrated, hassle-free solutions."
        />
        <meta
          name="keywords"
          content="TECHSTORE, TechStore Alarm System, security companies Australia, electronic security Sydney, home automation Australia, audio visual installation, data cabling contractors, ducted vacuum systems, ASIAL Silver Member, security license holders, integrated security solutions, Dynalite certified, commercial security, residential automation, access control, CCTV installation Australia"
        />
        <meta name="author" content="TECHSTORE Alarm Systems Australia" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shop.TechStorealarm.com.au/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="TECHSTORE Alarm Systems | Electronic Security & Automation Experts"
        />
        <meta
          property="og:description"
          content="Since 2008, TECHSTORE has delivered premium integrated solutions including security, automation, and AV. Fully licensed (Master License No: 000101930) and ASIAL accredited."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shop.TechStorealarm.com.au/" />
        <meta property="og:site_name" content="TECHSTORE Alarm Systems" />

        {/* Social Links */}
        <meta
          property="og:see_also"
          content="https://www.instagram.com/TechStorealarm/"
        />
        <meta
          property="og:see_also"
          content="https://www.facebook.com/p/TechStore-alarms-100071267801808/"
        />
      </Helmet>

      <style>{`
        .category-img-container {
          height: 150px;
        }
        @media (min-width: 992px) {
          .category-img-container {
            height: 220px;
          }
        }
      `}</style>

      <div className="container-fluid p-0 text-start" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <PageHeader title="Browse Categories" path="Home / Categories" />

        <div className="py-5">
          <div className="container">
            <PageBanner src={Banner} alt="Home Page Banner" />

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-between p-3 mt-4" role="alert">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span>{error}</span>
                </div>
                <button className="btn btn-outline-danger btn-sm px-3" onClick={handleRetry}>
                  Retry Loading
                </button>
              </div>
            )}

            {/* Cards Section */}
            <div className="row py-4 mt-2">
              {!firstAttemptDone && categories.length === 0 ? (
                // Show skeleton cards while loading
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const image = categoryImageMap[category.id] || null;
                  const productCount = categoryProductCounts[category.id] || 0;
                  const title = category?.categoryname || "Category";
                  const description =
                    category?.cat_description ||
                    "Browse our collection of integrated premium smart home and industrial grade security systems.";

                  return (
                    <div
                      key={category.id}
                      className="col-6 col-lg-3 mb-4 d-flex"
                    >
                      <div className="card bg-white border rounded-3 overflow-hidden w-100 d-flex flex-column shadow-sm hover-translate" style={{ transition: "all 0.2s" }}>
                        {/* Image section with hover zoom */}
                        <div className="position-relative overflow-hidden bg-light category-img-container">
                          {image ? (
                            <img
                              src={image}
                              className="w-100 h-100"
                              alt={title}
                              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
                              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                              loading="lazy"
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center w-100 h-100">
                              <i
                                className="bi bi-image text-muted"
                                style={{ fontSize: 48 }}
                              />
                            </div>
                          )}
                          <div className="position-absolute top-3 right-3" style={{ top: "15px", right: "15px", zIndex: 2 }}>
                            <span className="badge bg-white text-dark shadow-sm border px-2.5 py-1.5 fw-bold small rounded-pill">
                              {productCount} Product{productCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Card body with flex-grow to push button down */}
                        <div className="card-body d-flex flex-column p-4">
                          <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-2 heading" style={{ fontSize: "1.15rem" }}>{title}</h5>
                            <p className="text-secondary small mb-0" style={{ lineHeight: "1.5", fontSize: "0.88rem" }}>
                              {description}
                            </p>
                          </div>

                          <div className="mt-auto pt-2">
                            <GlobalButton type="submit" to="/shop" className="btn btn-primary w-100">
                              Shop Now
                            </GlobalButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="text-muted mb-3">
                    <i className="bi bi-folder-x fs-1"></i>
                  </div>
                  <p className="text-muted">No categories available at the moment. Please check back later.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
