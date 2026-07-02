import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import GlobalButton from "./Button";

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


const ProductCollection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [firstAttemptDone, setFirstAttemptDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/getcategory");
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
  }, [retryCount]);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;

      if (width < 576) {
        setItemsPerView(1); // mobile
      } else if (width < 992) {
        setItemsPerView(3); // tablet
      } else {
        setItemsPerView(6); // desktop
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);

    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [itemsPerView, categories.length]);

  const normalizeImageUrl = (p) => {
    const fromArray =
      p?.images?.[0]?.imgurl || p?.images?.[0]?.url || p?.images?.[0];

    const single =
      p?.image?.imgurl || p?.image?.url || p?.imgurl || p?.url || p?.thumbnail;

    return fromArray || single || null;
  };

  const categoryIdMatches = (p, catId) => {
    const pid = p?.category_id;
    const arr = p?.categories;
    const nested = p?.category?.id;

    return (
      String(pid) === String(catId) ||
      (Array.isArray(arr) && arr.map(String).includes(String(catId))) ||
      String(nested) === String(catId)
    );
  };

  const categoryImageMap = useMemo(() => {
    const map = {};

    for (const cat of categories || []) {
      const match = products.find((p) => categoryIdMatches(p, cat?.id));
      map[cat?.id] = match ? normalizeImageUrl(match) : null;
    }

    return map;
  }, [categories, products]);

  const maxIndex = Math.max(categories.length - itemsPerView, 0);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const Skeleton = () => (
    <div
      className="me-0 mb-3 border rounded-circle"
      style={{
        width: 150,
        height: 150,
        overflow: "hidden",
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 37%, rgba(0,0,0,0.05) 63%)",
        backgroundSize: "400% 100%",
        animation: "shine 1.4s ease infinite",
      }}
    />
  );

  return (
    <section className="container text-center products py-5">
      <h2 className="text-dark text-center text-uppercase py-2 d-inline-block position-relative heading mb-5">
        Product Categories
      </h2>

      {!firstAttemptDone && categories.length === 0 ? (
        <div className="row d-flex justify-content-center align-items-center">
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="col-lg-2 col-md-4 col-12 mb-4 d-flex justify-content-center align-items-center flex-column"
            >
              <Skeleton />
              <div className="text-center mt-1">
                <div
                  className="placeholder-wave"
                  style={{ width: 80, height: 16 }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="category-slider-wrapper position-relative">
          {categories.length > itemsPerView && (
            <button
              type="button"
              className="category-arrow category-arrow-left"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous categories"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          )}

          <div className="category-slider overflow-hidden">
            <div
              className="category-track d-flex"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView)
                }%)`,
              }}
            >
              {categories.map((category, index) => {
                const itemImage = categoryImageMap[category.id] || null;
                const name = category?.categoryname || "Category";

                return (
                  <div
                    key={category.id ?? index}
                    className="category-slide d-flex justify-content-center align-items-center"
                    style={{
                      flex: `0 0 ${100 / itemsPerView}%`,
                      maxWidth: `${100 / itemsPerView}%`,
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/shop`)}
                  >
                    <div className="card w-100 bg-white border border-light p-3 text-center d-flex flex-column align-items-center hover-lift" style={{ borderRadius: "8px", transition: "all 0.2s" }}>
                      <div
                        className="d-flex align-items-center justify-content-center mb-3 bg-light"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={name}
                            className="img-fluid"
                            loading="lazy"
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ) : (
                          <i className="bi bi-shield text-muted" style={{ fontSize: 28 }} />
                        )}
                      </div>

                      <h6 className="fw-bold mb-2 heading text-dark" style={{ fontSize: "14px" }}>
                        {name}
                      </h6>

                      <span className="fw-semibold text-primary d-inline-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                        View Products <i className="bi bi-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {categories.length > itemsPerView && (
            <button
              type="button"
              className="category-arrow category-arrow-right"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              aria-label="Next categories"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
        </div>
      ) : (
        <p className="text-muted">No categories available</p>
      )}

      {categories.length > 6 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <GlobalButton type="submit" to="/categories">
            View More
          </GlobalButton>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        .category-slider-wrapper {
          padding: 0 55px;
        }

        .category-track {
          transition: transform 0.45s ease-in-out;
        }

        .category-slide {
          padding: 0 12px;
          margin-bottom: 20px;
        }

        .category-arrow {
          position: absolute;
          top: 42%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #dee2e6;
          background: #ffffff;
          color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          transition: all 0.2s ease;
        }

        .category-arrow:hover:not(:disabled) {
          background: #0d6efd;
          color: #ffffff;
        }

        .category-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .category-arrow-left {
          left: 0;
        }

        .category-arrow-right {
          right: 0;
        }

        @media (max-width: 575.98px) {
          .category-slider-wrapper {
            padding: 0 45px;
          }

          .category-slide {
            padding: 0 8px;
          }

          .category-arrow {
            width: 36px;
            height: 36px;
          }

          .category-arrow-left {
            left: 0;
          }

          .category-arrow-right {
            right: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductCollection;