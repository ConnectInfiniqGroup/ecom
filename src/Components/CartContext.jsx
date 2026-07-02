import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { FALLBACK_IMAGE } from "../Components/FallbackImage";
import { useToast } from "./ToastContext";

const CartContext = createContext();

// Custom event for cart updates (for cross-component communication)
const CART_UPDATED_EVENT = "cartUpdated";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const formatImageUrl = useCallback((imgPath) => {
    if (!imgPath) return FALLBACK_IMAGE;

    if (Array.isArray(imgPath)) {
      const first = imgPath[0];
      if (typeof first === "string") return first.startsWith("http") ? first : `${first}`;
      if (first?.imgurl) return first.imgurl.startsWith("http") ? first.imgurl : `${first.imgurl}`;
      return FALLBACK_IMAGE;
    }

    if (typeof imgPath === "object" && imgPath.imgurl) {
      return imgPath.imgurl.startsWith("http") ? imgPath.imgurl : `${imgPath.imgurl}`;
    }

    if (typeof imgPath === "string") {
      return imgPath.startsWith("http") ? imgPath : `${imgPath}`;
    }

    return FALLBACK_IMAGE;
  }, []);

  const dispatchCartUpdate = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
    }
  }, []);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      setCart(guestCart);
      dispatchCartUpdate();
      setError(null);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, [dispatchCartUpdate]);

  const syncGuestCartAfterLogin = async () => {
    // No-op without backend API
  };

  const addToCart = useCallback(
    async (product, quantity = 1, size = "M") => {
      let productData;
      let product_id;

      if (typeof product === "object" && product !== null) {
        product_id = product.id || product.product_id;
        productData = {
          id: product.id || product.product_id,
          product_id: product.id || product.product_id,
          productname: product.productname || product.name || "Unknown Product",
          pro_price: product.pro_price || product.price || 0,
          pro_quantity: quantity,
          quantity: quantity,
          size: size,
          images: product.images || [],
          imgurl: product.imgurl,
          formattedImage: formatImageUrl(product.images || product.imgurl),
        };
      } else {
        product_id = product;
        productData = {
          id: product_id,
          product_id: product_id,
          productname: "Unknown Product",
          pro_price: 0,
          pro_quantity: quantity,
          quantity: quantity,
          size: size,
          images: [],
          formattedImage: FALLBACK_IMAGE,
        };
      }

      setCart((currentCart) => {
        const existingIndex = currentCart.findIndex(
          (item) => item.product_id === product_id && item.size === size,
        );

        let newCart;
        if (existingIndex !== -1) {
          newCart = [...currentCart];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            pro_quantity: (newCart[existingIndex].pro_quantity || 1) + quantity,
            quantity: (newCart[existingIndex].quantity || 1) + quantity,
          };
        } else {
          newCart = [...currentCart, productData];
        }

        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });

      dispatchCartUpdate();

      showToast(
        `Added ${productData.productname} to cart!`,
        "success",
        productData.formattedImage || productData.imgurl
      );
    },
    [dispatchCartUpdate, formatImageUrl, showToast],
  );

  const updateCartQuantity = useCallback(
    async (product_id, change) => {
      setCart((currentCart) => {
        const newCart = currentCart.map((item) => {
          if (item.product_id === product_id) {
            const newQuantity = (item.pro_quantity || item.quantity || 1) + change;
            if (newQuantity < 1) return item;
            return {
              ...item,
              pro_quantity: newQuantity,
              quantity: newQuantity,
            };
          }
          return item;
        });
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });
      dispatchCartUpdate();
    },
    [dispatchCartUpdate],
  );

  const removeFromCart = useCallback(
    async (product_id) => {
      setCart((currentCart) => {
        const itemToRemove = currentCart.find((item) => item.product_id === product_id);
        if (itemToRemove) {
          showToast(
            `Removed ${itemToRemove.productname || "item"} from cart`,
            "info",
            itemToRemove.formattedImage || itemToRemove.imgurl
          );
        }
        const newCart = currentCart.filter((item) => item.product_id !== product_id);
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });
      dispatchCartUpdate();
    },
    [dispatchCartUpdate, showToast],
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    localStorage.removeItem("guest_cart");
    dispatchCartUpdate();
  }, [dispatchCartUpdate]);

  const forceRefreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartCount = cart.reduce((total, item) => {
    const qty = item.pro_quantity || item.quantity || 1;
    return total + qty;
  }, 0);

  const cartTotal = cart
    .reduce((sum, item) => {
      const price = parseFloat(item.pro_price || item.price || 0);
      const qty = item.pro_quantity || item.quantity || 1;
      return sum + price * qty;
    }, 0)
    .toFixed(2);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        fetchCart,
        formatImageUrl,
        syncGuestCartAfterLogin,
        forceRefreshCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
