import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import { useCompare } from "./CompareContext";
import { useToast } from "./ToastContext";
import FallbackImage from "./FallbackImage";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToCompare, compareItems } = useCompare();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const isCompared = compareItems && compareItems.some((item) => item.product_id === (product.id || product.product_id));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    showToast(`Added ${quantity} ${product.productname || product.name} to cart`, 'success');
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCompared) {
      addToCompare(product);
      showToast('Added to compare list', 'info');
    }
  };

  const name = product.productname || product.name || "Unknown Product";
  const price = product.pro_price || product.price || 0;
  const generatedSlug = (name || "product").toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + (product.id || product.product_id || "0");
  const slug = product.slugWithId || product.slug || generatedSlug;
  const inStock = product.stock > 0 || product.stock === undefined;
  
  return (
    <div 
      className="product-card-modern"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/shop/product/${slug}`} className="text-decoration-none text-dark">
        <div className="product-image-container">
          <FallbackImage
            src={product.imageUrl || product.image || ""}
            alt={name}
            className="product-image-zoom"
          />
          
          {/* Badge Overlays */}
          <div className="position-absolute top-0 start-0 p-3 z-1 w-100 d-flex justify-content-between align-items-start">
            {product.discount > 0 && (
              <span className="badge-TechStore-red shadow-sm">
                -{product.discount}%
              </span>
            )}
            {!inStock && (
              <span className="badge bg-dark bg-opacity-75 text-white rounded-pill px-2 py-1 small">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Button Overlay */}
          <div className="product-action-overlay">
            <div className="action-btn-group">
              <button 
                className="modern-action-btn"
                onClick={handleAddToCart}
                disabled={!inStock}
                title="Add to Cart"
              >
                <i className="bi bi-cart-plus"></i>
              </button>
              <button 
                className={`modern-action-btn ${isCompared ? 'active' : ''}`}
                onClick={handleCompare}
                title={isCompared ? "In Compare List" : "Compare"}
              >
                <i className="bi bi-arrow-left-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 d-flex flex-column h-100 bg-white">
          <div className="mb-2">
            <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
              {product.categoryname || "Category"}
            </span>
          </div>
          
          <h5 className="fw-bold mb-2 text-truncate" title={name} style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }}>
            {name}
          </h5>
          
          <div className="d-flex align-items-center mb-3">
            <div className="text-warning small me-2">
              {"★".repeat(Math.round(product.rating || 5))}
              <span className="text-muted opacity-50">{"★".repeat(5 - Math.round(product.rating || 5))}</span>
            </div>
            <span className="text-muted small">({product.reviews_count || 0})</span>
          </div>
          
          <div className="mt-auto pt-3 border-top border-opacity-10 d-flex justify-content-between align-items-end">
            <div>
              <div className="fs-5 fw-bolder" style={{ color: 'var(--brand-secondary)' }}>
                ${parseFloat(price).toFixed(2)}
              </div>
              {product.oldPrice && (
                <div className="text-muted small text-decoration-line-through">
                  ${parseFloat(product.oldPrice).toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Quick add mobile fallback */}
            <button 
              className="btn btn-sm btn-primary btn-pill d-lg-none shadow-sm"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;