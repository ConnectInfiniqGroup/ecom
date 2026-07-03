import React, { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import { fetchProducts } from "../Constants/Data";

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


const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const categoryParamQuery = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending Order");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 10000]);

  const brandsList = ["Hikvision", "CP Plus", "Dahua", "Godrej", "TechStore"];

  // Calculate min and max price from products
  const priceBounds = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return { min: 0, max: 10000 };
    }

    const prices = products
      .map((p) => parseFloat(p.pro_price || p.price || 0))
      .filter((p) => p > 0);

    if (prices.length === 0) {
      return { min: 0, max: 10000 };
    }

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Set initial price range based on actual product prices
  useEffect(() => {
    if (products.length > 0) {
      const { min, max } = priceBounds;
      setPriceRange([min, max]);
      setDebouncedPriceRange([min, max]);
    }
  }, [products, priceBounds]);

  // Sync search input with URL search parameters
  useEffect(() => {
    if (searchParamQuery) {
      setSearchQuery(searchParamQuery);
    } else {
      setSearchQuery("");
    }
    setCurrentPage(1);
  }, [searchParamQuery]);

  // Sync category input with URL search parameters
  useEffect(() => {
    if (categoryParamQuery) {
      const catId = parseInt(categoryParamQuery) || parseFloat(categoryParamQuery);
      if (catId) {
        setSelectedCategories([catId]);
      }
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [categoryParamQuery]);

  // Memoized filtered products by search, price, categories, brand, and ratings
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    return products.filter((product) => {
      const name = (product.productname || product.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());

      const productPrice = parseFloat(product.pro_price || product.price || 0);
      const matchesPrice =
        productPrice >= debouncedPriceRange[0] &&
        productPrice <= debouncedPriceRange[1];

      const categoryId = product.category_id || product.categoryId;
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoryId);

      const productRating = parseFloat(product.rating || product.average_rating || 0);
      const matchesRating =
        selectedRatings.length === 0 ||
        selectedRatings.some((rating) => productRating >= rating);

      const brandText = (product.brand || product.productname || product.name || "").toLowerCase();
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some((brand) => brandText.includes(brand.toLowerCase()));

      return matchesSearch && matchesPrice && matchesCategory && matchesRating && matchesBrand;
    });
  }, [
    products,
    searchQuery,
    debouncedPriceRange,
    selectedCategories,
    selectedRatings,
    selectedBrands,
  ]);

  // Memoized sorted products
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];

    if (sorted.length === 0) {
      return sorted;
    }

    if (sortOrder === "Ascending Order") {
      sorted.sort((a, b) =>
        (a.productname || a.name || "").localeCompare(
          b.productname || b.name || "",
        ),
      );
    } else if (sortOrder === "Descending Order") {
      sorted.sort((a, b) =>
        (b.productname || b.name || "").localeCompare(
          a.productname || a.name || "",
        ),
      );
    } else if (sortOrder === "Low - High Price") {
      sorted.sort(
        (a, b) =>
          parseFloat(a.pro_price || a.price || 0) -
          parseFloat(b.pro_price || b.price || 0),
      );
    } else if (sortOrder === "High - Low Price") {
      sorted.sort(
        (a, b) =>
          parseFloat(b.pro_price || b.price || 0) -
          parseFloat(a.pro_price || a.price || 0),
      );
    }
    return sorted;
  }, [filteredProducts, sortOrder]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/getcategory");
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products on mount
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, []);

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories((prevSelected) => {
      const next = prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId];

      if (searchParams.has("category")) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("category");
        setSearchParams(newParams);
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleRatingSelection = (rating) => {
    setSelectedRatings((prevSelected) =>
      prevSelected.includes(rating)
        ? prevSelected.filter((r) => r !== rating)
        : [...prevSelected, rating],
    );
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRatings([]);
    setSelectedBrands([]);
    const { min, max } = priceBounds;
    setPriceRange([min, max]);
    setDebouncedPriceRange([min, max]);
    setSearchQuery("");
    setSortOrder("Ascending Order");
    setCurrentPage(1);
    setSearchParams({});
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 3;
      }

      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  const SkeletonCard = () => (
    <div className="card border p-3 h-100 bg-white" style={{ borderRadius: "8px" }}>
      <div
        className="mb-3"
        style={{
          width: "100%",
          height: "200px",
          borderRadius: 6,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)",
          backgroundSize: "400% 100%",
          animation: "shine 1.4s ease infinite",
        }}
      />
      <div
        className="mt-3 mb-2"
        style={{
          width: "80%",
          height: 16,
          borderRadius: 4,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)",
          backgroundSize: "400% 100%",
          animation: "shine 1.4s ease infinite",
        }}
      />
      <div
        className="mt-2 mb-3"
        style={{
          width: "50%",
          height: 12,
          borderRadius: 4,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)",
          backgroundSize: "400% 100%",
          animation: "shine 1.4s ease infinite",
        }}
      />
      <div
        style={{
          width: "40%",
          height: 20,
          borderRadius: 4,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)",
          backgroundSize: "400% 100%",
          animation: "shine 1.4s ease infinite",
        }}
      />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Shop | TechStore </title>
        <meta
          name="description"
          content="TECHSTORE is a premier Australian security company specializing in Electronic Security, Home Automation, Audio Visual, Data Cabling, and Ducted Vacuum systems."
        />
        <meta
          name="keywords"
          content="TECHSTORE, TechStore Alarm System, security companies Australia, electronic security Sydney"
        />
        <meta name="author" content="TECHSTORE  Australia" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shop.TechStorealarm.com.au/" />
      </Helmet>

      <section>
        <div className="container py-4">
          {/* Breadcrumbs & Title */}
          <div className="text-start mb-4">
            <span className="text-muted small">Home / Shop</span>
            <h1 className="fw-bold mt-1 text-dark heading">Shop</h1>
          </div>

          <div className="row g-4">
            {/* Left Sidebar Filters */}
            <div className="col-lg-3 text-start">
              <div className="p-3 bg-white border rounded-3 mb-4">
                {/* Categories */}
                <h6 className="fw-bold mb-3 heading text-dark" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "8px" }}>
                  Categories
                </h6>
                <div className="mb-4" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="cat-all"
                      checked={selectedCategories.length === 0}
                      onChange={() => setSelectedCategories([])}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="cat-all" style={{ cursor: "pointer" }}>
                      All Categories
                    </label>
                  </div>
                  {categories.map((category) => (
                    <div key={category.category_id} className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`cat-${category.category_id}`}
                        checked={selectedCategories.includes(category.category_id)}
                        onChange={() => handleCategorySelection(category.category_id)}
                      />
                      <label className="form-check-label" htmlFor={`cat-${category.category_id}`} style={{ cursor: "pointer" }}>
                        {category.categoryname}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Price Range */}
                <h6 className="fw-bold mb-3 heading text-dark" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "8px" }}>
                  Price Range
                </h6>
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="flex-grow-1">
                      <label className="small text-muted mb-1">Min Price</label>
                      <input
                        type="number"
                        className="form-control py-1 px-2"
                        style={{ height: "34px", fontSize: "13px" }}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="small text-muted mb-1">Max Price</label>
                      <input
                        type="number"
                        className="form-control py-1 px-2"
                        style={{ height: "34px", fontSize: "13px" }}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.max(0, parseInt(e.target.value) || 0)])}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm rounded-pill w-100 py-2" onClick={() => setDebouncedPriceRange(priceRange)} style={{ fontSize: "12px" }}>
                    Apply Price Filter
                  </button>
                </div>

                {/* Brand */}
                <h6 className="fw-bold mb-3 heading text-dark" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "8px" }}>
                  Brand
                </h6>
                <div className="mb-4">
                  {brandsList.map((brand) => (
                    <div key={brand} className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                          setSelectedBrands((prev) =>
                            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                          );
                          setCurrentPage(1);
                        }}
                      />
                      <label className="form-check-label" htmlFor={`brand-${brand}`} style={{ cursor: "pointer" }}>
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Rating */}
                <h6 className="fw-bold mb-3 heading text-dark" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "8px" }}>
                  Rating
                </h6>
                <div className="mb-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`star-${star}`}
                        checked={selectedRatings.includes(star)}
                        onChange={() => handleRatingSelection(star)}
                      />
                      <label className="form-check-label ms-1" htmlFor={`star-${star}`} style={{ cursor: "pointer" }}>
                        <span className="text-warning">{"★".repeat(star)}{"☆".repeat(5 - star)}</span>
                        <span className="small text-muted ms-1">({star} & up)</span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Reset Filters */}
                <button className="btn btn-outline-primary btn-sm rounded-pill w-100 mt-3 py-2" onClick={resetAllFilters} style={{ fontSize: "12px" }}>
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Right Main Shop Area */}
            <div className="col-lg-9">
              {/* Toolbar */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 mb-4">
                <span className="text-muted small">
                  Showing {paginatedProducts.length} of {sortedProducts.length} products
                </span>

                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>Sort By:</span>
                    <select
                      className="form-select py-1 px-2"
                      style={{ height: "36px", fontSize: "13px", width: "160px" }}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="Ascending Order">Alphabetical (A-Z)</option>
                      <option value="Descending Order">Alphabetical (Z-A)</option>
                      <option value="Low - High Price">Price (Low to High)</option>
                      <option value="High - Low Price">Price (High to Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Badges */}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedRatings.length > 0 || searchQuery !== "") && (
                <div className="d-flex flex-wrap gap-2 mb-4 align-items-center text-start">
                  <span className="small fw-bold text-muted me-2">Active Filters:</span>

                  {/* Category badges */}
                  {categories
                    .filter((cat) => selectedCategories.includes(cat.category_id))
                    .map((cat) => (
                      <span
                        key={`badge-cat-${cat.category_id}`}
                        className="active-filter-badge"
                        onClick={() => handleCategorySelection(cat.category_id)}
                      >
                        {cat.categoryname} <i className="bi bi-x-lg ms-1" style={{ fontSize: "10px" }}></i>
                      </span>
                    ))
                  }

                  {/* Brand badges */}
                  {selectedBrands.map((brand) => (
                    <span
                      key={`badge-brand-${brand}`}
                      className="active-filter-badge"
                      onClick={() => setSelectedBrands((prev) => prev.filter((b) => b !== brand))}
                    >
                      {brand} <i className="bi bi-x-lg ms-1" style={{ fontSize: "10px" }}></i>
                    </span>
                  ))}

                  {/* Rating badges */}
                  {selectedRatings.map((rating) => (
                    <span
                      key={`badge-rating-${rating}`}
                      className="active-filter-badge"
                      onClick={() => handleRatingSelection(rating)}
                    >
                      {rating} ★ & up <i className="bi bi-x-lg ms-1" style={{ fontSize: "10px" }}></i>
                    </span>
                  ))}

                  {/* Search query badge */}
                  {searchQuery && (
                    <span
                      className="active-filter-badge"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchParams({});
                      }}
                    >
                      Search: "{searchQuery}" <i className="bi bi-x-lg ms-1" style={{ fontSize: "10px" }}></i>
                    </span>
                  )}

                  <button
                    className="btn btn-link btn-sm text-decoration-none text-danger fw-bold ms-auto p-0"
                    onClick={resetAllFilters}
                    style={{ fontSize: "12px" }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="row row-cols-2 row-cols-md-3 g-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-${i}`} className="col">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : paginatedProducts.length > 0 ? (
                <div className="row row-cols-2 row-cols-md-3 g-4">
                  {paginatedProducts.map((product) => (
                    <div key={product.id || product.product_id} className="col">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-white border rounded-3 text-center w-100">
                  <i className="bi bi-box-seam display-3 text-muted mb-3 opacity-50"></i>
                  <h5 className="fw-bold">No products match your filters</h5>
                  <p className="text-muted small">Try adjusting your price range, brand filters, or rating thresholds.</p>
                  <button className="btn btn-primary rounded-pill px-4 mt-2" onClick={resetAllFilters}>
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination justify-content-center gap-2 border-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link rounded-circle border-0 text-dark bg-light d-flex align-items-center justify-content-center hover-lift"
                        style={{ width: "40px", height: "40px" }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {pageNumbers.map((page, idx) => (
                      <li key={idx} className={`page-item ${page === "..." ? "disabled" : currentPage === page ? "active" : ""}`}>
                        {page === "..." ? (
                          <span className="page-link border-0 text-muted bg-transparent">...</span>
                        ) : (
                          <button
                            className={`page-link rounded-circle border-0 d-flex align-items-center justify-content-center fw-bold ${currentPage === page ? "bg-primary text-white shadow-sm" : "bg-light text-dark hover-lift"
                              }`}
                            style={{ width: "40px", height: "40px" }}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        )}
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link rounded-circle border-0 text-dark bg-light d-flex align-items-center justify-content-center hover-lift"
                        style={{ width: "40px", height: "40px" }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shine {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </>
  );
};

export default Shop;
