import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import { fetchProducts } from "../Constants/Data";
import Details from "../Components/Details";
import { useCart } from "../Components/CartContext";
import { useCompare } from "../Components/CompareContext";
import CompareModal from "../Components/CompareModal";
import ProductCard from "../Components/ProductCard";
import GlobalButton from "../Components/Button";
import FallbackImage from "../Components/FallbackImage";

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


const ProductDetails = () => {
  const { slugWithId } = useParams();
  const id = slugWithId.split("-").pop();
  const navigate = useNavigate();

  const carouselRef = useRef(null);
  const relatedRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const { addToCart, isLoading: cartLoading } = useCart();
  const { add: addToCompare } = useCompare();
  const [selectedImage, setSelectedImage] = useState("default.jpg");
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // Load initial data from cache instantly
  useEffect(() => {
    const loadInitialData = () => {
      const cachedProducts = JSON.parse(
        localStorage.getItem("cached_products") || "[]",
      );
      const cachedProductDetails = JSON.parse(
        localStorage.getItem(`cached_product_${id}`) || "null",
      );

      let foundProduct = cachedProductDetails;
      if (!foundProduct) {
        foundProduct = cachedProducts.find((p) => String(p.id) === String(id));
      }

      if (foundProduct) {
        setProduct(foundProduct);

        if (foundProduct && foundProduct.category) {
          const related = cachedProducts.filter(
            (p) =>
              p.category &&
              p.category.id === foundProduct.category.id &&
              p.id !== foundProduct.id,
          );
          setRelatedProducts(related.slice(0, 8));
        }

        if (foundProduct.images?.length > 0) {
          setSelectedImage(foundProduct.images[0].imgurl);
        }
      }
    };

    loadInitialData();
    loadProduct();
  }, [id]);

  // Reset thumbnail start index when product changes
  useEffect(() => {
    setThumbnailStartIndex(0);
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0].imgurl);
    }
  }, [product?.id]);

  // Fetch product data and related products in background
  const loadProduct = async () => {
    try {
      const products = await fetchProducts();
      const found = products.find((p) => String(p.id) === String(id));

      if (found) {
        setProduct(found);
        localStorage.setItem(`cached_product_${id}`, JSON.stringify(found));

        if (found && found.category) {
          const related = products.filter(
            (p) =>
              p.category &&
              p.category.id === found.category.id &&
              p.id !== found.id,
          );
          setRelatedProducts(related.slice(0, 8));
        }

        if (found.images?.length > 0) {
          setSelectedImage(found.images[0].imgurl);
        }
      }
    } catch (err) {
      // Keep cached data on error
    }
  };

  // Fetch review summary from API
  useEffect(() => {
    const fetchReviewSummary = async () => {
      if (!product?.id) return;

      try {
        const productId =
          product.product_id || `PRO${String(product.id).padStart(3, "0")}`;

        const cachedReview = localStorage.getItem(`cached_review_${productId}`);
        if (cachedReview) {
          setReviewSummary(JSON.parse(cachedReview));
        }

        const response = await api.get(`/products/${productId}/review-summary`);

        if (response.data.success) {
          setReviewSummary(response.data.summary);
          localStorage.setItem(
            `cached_review_${productId}`,
            JSON.stringify(response.data.summary),
          );
        } else {
          setReviewSummary(null);
        }
      } catch (error) {
        // Keep cached review data on error
      }
    };

    if (product) {
      fetchReviewSummary();
    }
  }, [product]);

  // Intersection Observer for sticky bar
  useEffect(() => {
    const el = relatedRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numericPrice)}`;
  };

  const renderStarRating = (averageRating) => {
    if (!averageRating || averageRating === 0) {
      return (
        <span className="text-warning">
          <i className="bi bi-star"></i>
          <i className="bi bi-star ms-1"></i>
          <i className="bi bi-star ms-1"></i>
          <i className="bi bi-star ms-1"></i>
          <i className="bi bi-star ms-1"></i>
        </span>
      );
    }

    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning ms-1"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half text-warning ms-1"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-warning ms-1"></i>);
      }
    }
    return <span className="text-warning">{stars}</span>;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product, quantity, size);
    } catch (error) {
      // console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      let backendProductId = product.product_id || null;
      try {
        const slug = (slugWithId || "").slice(
          0,
          (slugWithId || "").lastIndexOf("-"),
        );
        if (slug) {
          const response = await api.get(`/products/${slug}`);
          const p =
            response.data?.product || response.data?.data || response.data;
          backendProductId = p?.product_id || backendProductId;
        }
      } catch (error) {
        // error fetching details
      }

      const buyNowItem = {
        product_id: product.product_id || product.id,
        backend_product_id: backendProductId,
        productname: product.productname,
        pro_price: product.pro_price,
        pro_quantity: quantity,
        size,
        images: Array.isArray(product.images) ? product.images : [],
      };

      localStorage.setItem("buy_now_item", JSON.stringify(buyNowItem));
      navigate("/checkout", { state: { buyNow: true } });
    } catch (error) {
      alert("Failed to process Buy Now. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToCompare = () => {
    if (!product) return;
    addToCompare(product);

    const compareModal = new window.bootstrap.Modal(
      document.getElementById("compareModal"),
    );
    compareModal.show();
  };

  const getImagePath = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `/${path.replace(/^\/+/, "")}`;
  };

  const nextThumbnails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.images) return;
    const maxStartIndex = Math.max(0, product.images.length - 3);
    setThumbnailStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  const prevThumbnails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextSlide = () => {
    if (carouselRef.current) {
      const itemsPerSlide = 4;
      const maxSlide = Math.ceil(relatedProducts.length / itemsPerSlide) - 1;
      setCurrentSlide((s) => (s < maxSlide ? s + 1 : 0));
    }
  };

  const prevSlide = () => {
    if (carouselRef.current) {
      const itemsPerSlide = 4;
      const maxSlide = Math.ceil(relatedProducts.length / itemsPerSlide) - 1;
      setCurrentSlide((s) => (s > 0 ? s - 1 : maxSlide));
    }
  };

  if (!product) {
    return (
      <div className="container-fluid p-0">
        <PageHeader title="Product Details" path="Home / Products" />
        <div className="container py-5 text-center">
          <p className="text-muted">Loading product details...</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const maxThumbnailStartIndex = Math.max(0, images.length - 3);
  const itemsPerSlide = 4;
  const startIndex = currentSlide * itemsPerSlide;
  const visibleProducts = relatedProducts.slice(
    startIndex,
    startIndex + itemsPerSlide,
  );

  return (
    <>
      <Helmet>
        <title>{product.productname} | TechStore </title>
        <meta name="description" content={product.pro_description || "Product Details"} />
      </Helmet>

      <div className="container-fluid p-0" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <PageHeader
          title={product.productname}
          path={`Home / Products / ${product.productname}`}
        />

        <div className="container py-5">
          {/* Main Details Grid */}
          <div className="row g-5">
            {/* Left Column: Images */}
            <div className="col-lg-6">
              <div
                className="bg-white border rounded-3 p-4 d-flex align-items-center justify-content-center shadow-sm"
                style={{ minHeight: "480px", overflow: "hidden" }}
              >
                <FallbackImage
                  src={getImagePath(selectedImage)}
                  alt={product.productname}
                  className="img-fluid"
                  style={{ maxHeight: "420px", objectFit: "contain", transition: "transform 0.3s ease" }}
                />
              </div>

              {/* Thumbnails Row */}
              {images.length > 0 && (
                <div className="position-relative mt-3 px-5">
                  <div className="d-flex justify-content-center align-items-center gap-3">
                    {thumbnailStartIndex > 0 && (
                      <button
                        className="btn btn-light btn-sm border rounded-circle position-absolute start-0"
                        onClick={prevThumbnails}
                        style={{ width: "32px", height: "32px", zIndex: 2 }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    )}

                    {images
                      .slice(thumbnailStartIndex, thumbnailStartIndex + 3)
                      .map((img, idx) => {
                        const imagePath = img.imgurl;
                        const isActive = selectedImage === imagePath;
                        return (
                          <div
                            key={thumbnailStartIndex + idx}
                            className="bg-white border rounded-3 p-2 d-flex align-items-center justify-content-center cursor-pointer shadow-sm hover-lift"
                            style={{
                              width: "100px",
                              height: "100px",
                              border: isActive ? "2px solid var(--brand-primary)" : "1px solid var(--border-color)",
                              transition: "all 0.2s"
                            }}
                            onClick={() => setSelectedImage(imagePath)}
                          >
                            <FallbackImage
                              src={getImagePath(imagePath)}
                              alt={`Thumbnail ${idx}`}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </div>
                        );
                      })}

                    {thumbnailStartIndex < maxThumbnailStartIndex && (
                      <button
                        className="btn btn-light btn-sm border rounded-circle position-absolute end-0"
                        onClick={nextThumbnails}
                        style={{ width: "32px", height: "32px", zIndex: 2 }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Specs / Buying */}
            <div className="col-lg-6 text-start">
              <div className="bg-white border rounded-3 p-4 shadow-sm">
                {/* Brand / Category */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-light text-dark text-uppercase px-3 py-2 border rounded-pill small fw-bold tracking-wider">
                    {product.category?.categoryname || "Security System"}
                  </span>
                  <span className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"} text-white px-3 py-2 rounded-pill small fw-bold`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="fw-bold text-dark fs-2 mb-3 mt-1" style={{ color: "var(--brand-primary)" }}>
                  {product.productname}
                </h1>

                {/* Rating */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  {renderStarRating(reviewSummary?.average_rating || 0)}
                  <span className="text-dark fw-bold small ms-1">
                    {reviewSummary?.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-muted small">
                    ({reviewSummary?.total_ratings || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="d-flex align-items-baseline gap-3 mb-4 pb-4 border-bottom">
                  <span className="fs-1 fw-bold text-dark" style={{ color: "var(--brand-primary)" }}>
                    {formatPrice(product.pro_price)}
                  </span>
                  {product.original_price && (
                    <span className="text-muted text-decoration-line-through fs-5">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>

                {/* Description snippet */}
                <p className="text-muted mb-4 fs-6 leading-relaxed">
                  {product.pro_description || "Premium electronic security device designed to keep your home and business safe with advanced detection systems."}
                </p>

                {/* Key specs list */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">Key Specifications</h6>
                  <ul className="list-unstyled d-flex flex-column gap-2">
                    <li className="d-flex align-items-center gap-2 text-muted small">
                      <i className="bi bi-check2-circle text-success fs-5"></i>
                      <span><strong>Specification:</strong> {product.specification || "Standard"}</span>
                    </li>
                    {product.weight && (
                      <>
                        {product.weight.length && (
                          <li className="d-flex align-items-center gap-2 text-muted small">
                            <i className="bi bi-check2-circle text-success fs-5"></i>
                            <span><strong>Dimensions:</strong> {product.weight.length}x{product.weight.width}x{product.weight.height} {product.weight.dimension_unit || "cm"}</span>
                          </li>
                        )}
                        {product.weight.product_weight && (
                          <li className="d-flex align-items-center gap-2 text-muted small">
                            <i className="bi bi-check2-circle text-success fs-5"></i>
                            <span><strong>Weight:</strong> {product.weight.product_weight} {product.weight.weight_unit || "kg"}</span>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column gap-3 mt-4">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-muted small">Quantity:</span>
                    <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-3">
                      <button
                        className="btn btn-sm bg-transparent border-0 p-0"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <i className="bi bi-dash text-dark fs-5"></i>
                      </button>
                      <span className="fw-bold text-dark">{quantity}</span>
                      <button
                        className="btn btn-sm bg-transparent border-0 p-0"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <i className="bi bi-plus text-dark fs-5"></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-primary py-3 px-4 flex-grow-1"
                      onClick={handleAddToCart}
                      disabled={addingToCart || cartLoading}
                      style={{ fontSize: "14px" }}
                    >
                      {addingToCart ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Adding to Cart...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart3 me-2"></i> Add To Cart
                        </>
                      )}
                    </button>

                    <button
                      className="btn py-3 px-4 flex-grow-1"
                      onClick={handleBuyNow}
                      disabled={addingToCart || cartLoading}
                      style={{
                        backgroundColor: "var(--brand-secondary)",
                        borderColor: "var(--brand-secondary)",
                        color: "#ffffff",
                        fontSize: "14px"
                      }}
                    >
                      <i className="bi bi-lightning-fill me-1"></i> Buy Now
                    </button>

                    <button
                      className="btn btn-outline-secondary p-3"
                      onClick={handleAddToCompare}
                      title="Add to Compare"
                    >
                      <i className="bi bi-shuffle"></i>
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-top">
                  <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                    <i className="bi bi-shield-check text-success fs-5"></i>
                    <span>Guaranteed Safe Checkout</span>
                  </div>
                  <div className="d-flex gap-3 mt-2">
                    <FallbackImage
                      src="https://themes.pixelstrap.com/multikart/assets/images/product-details/payments.png"
                      alt="Payment Methods"
                      className="img-fluid"
                      style={{ maxHeight: "36px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="bg-white border rounded-3 p-4 shadow-sm text-start">
                <ul className="nav nav-tabs border-bottom mb-4">
                  <li className="nav-item">
                    <button
                      className={`nav-link fw-bold border-0 px-4 py-3 ${activeTab === "description" ? "active border-bottom border-3 text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("description")}
                      style={{
                        borderBottomColor: activeTab === "description" ? "var(--brand-primary) !important" : "transparent",
                        background: "none"
                      }}
                    >
                      Description
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link fw-bold border-0 px-4 py-3 ${activeTab === "specification" ? "active border-bottom border-3 text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("specification")}
                      style={{
                        borderBottomColor: activeTab === "specification" ? "var(--brand-primary) !important" : "transparent",
                        background: "none"
                      }}
                    >
                      Specifications
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link fw-bold border-0 px-4 py-3 ${activeTab === "reviews" ? "active border-bottom border-3 text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("reviews")}
                      style={{
                        borderBottomColor: activeTab === "reviews" ? "var(--brand-primary) !important" : "transparent",
                        background: "none"
                      }}
                    >
                      Reviews ({reviewSummary?.total_ratings || 0})
                    </button>
                  </li>
                </ul>

                <div className="tab-content px-2">
                  {activeTab === "description" && (
                    <div className="tab-pane fade show active">
                      <h5 className="fw-bold text-dark mb-3">Product Description</h5>
                      <p className="text-muted leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                        {product.pro_description || "No description provided for this product."}
                      </p>
                    </div>
                  )}

                  {activeTab === "specification" && (
                    <div className="tab-pane fade show active">
                      <h5 className="fw-bold text-dark mb-3">Technical Specifications</h5>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <tbody>
                            <tr>
                              <th className="bg-light text-dark w-25">Category</th>
                              <td>{product.category?.categoryname || "N/A"}</td>
                            </tr>
                            <tr>
                              <th className="bg-light text-dark">Model Specification</th>
                              <td>{product.specification || "N/A"}</td>
                            </tr>
                            {product.weight && (
                              <>
                                <tr>
                                  <th className="bg-light text-dark">Dimensions</th>
                                  <td>{product.weight.length} x {product.weight.width} x {product.weight.height} {product.weight.dimension_unit || "cm"}</td>
                                </tr>
                                <tr>
                                  <th className="bg-light text-dark">Weight</th>
                                  <td>{product.weight.product_weight} {product.weight.weight_unit || "kg"}</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="tab-pane fade show active">
                      <div className="row">
                        <Details product={product} reviewSummary={reviewSummary} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related items */}
          <section className="products mt-5 pt-4" ref={relatedRef}>
            <div className="d-flex justify-content-between align-items-center mb-4 text-start">
              <h3 className="fw-bold text-dark m-0" style={{ color: "var(--brand-primary)" }}>
                Related Products
              </h3>

              {relatedProducts.length > 4 && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                    onClick={prevSlide}
                    style={{ width: "36px", height: "36px" }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button
                    className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                    onClick={nextSlide}
                    style={{ width: "36px", height: "36px" }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="row py-2" ref={carouselRef}>
              {visibleProducts.length > 0 ? (
                visibleProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                    <ProductCard product={relatedProduct} />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted col-12">No related products found.</p>
              )}
            </div>
          </section>
        </div>

        {/* STICKY BOTTOM BAR */}
        <section
          className={`bg-white py-3 border-top sticky-checkout-bar ${showStickyBar ? "show" : ""}`}
          aria-hidden={!showStickyBar}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            transform: showStickyBar ? "translateY(0%)" : "translateY(100%)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <div className="container">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap text-start">
              <div className="d-none d-md-flex align-items-center gap-3">
                <div className="border rounded bg-white p-1" style={{ width: "50px", height: "50px" }}>
                  <FallbackImage
                    src={getImagePath(selectedImage)}
                    alt={product.productname}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div>
                  <p className="mb-0 fw-bold text-dark text-truncate" style={{ maxWidth: "200px" }}>{product.productname}</p>
                  <p className="mb-0 text-muted small">{formatPrice(product.pro_price)}</p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap ms-auto">
                <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-3">
                  <button
                    className="btn btn-sm bg-transparent border-0 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <i className="bi bi-dash text-dark fs-5"></i>
                  </button>
                  <span className="fw-bold text-dark">{quantity}</span>
                  <button
                    className="btn btn-sm bg-transparent border-0 p-0"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <i className="bi bi-plus text-dark fs-5"></i>
                  </button>
                </div>

                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={handleAddToCart}
                  disabled={addingToCart || cartLoading}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart3 me-2"></i> Add To Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CompareModal />
    </>
  );
};

export default ProductDetails;