import React, { useEffect, useRef, useState } from "react";
import PageHeader from "../Components/PageHeader";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../Components/CartContext";
import GlobalButton from "../Components/Button";

import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
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


const googleMapsLibraries = ["places"];

const CheckoutPage = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("STRIPE");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [addressError, setAddressError] = useState("");
  const [showAddressWarning, setShowAddressWarning] = useState(false);
  const [pendingOrderExists, setPendingOrderExists] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");

  // Delivery charge states
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [selectedDeliveryCharge, setSelectedDeliveryCharge] = useState(null);
  const [totalOrderWeight, setTotalOrderWeight] = useState(0);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  const autocompleteRef = useRef(null);

  const [newAddress, setNewAddress] = useState({
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    address_type: "delivery",
  });

  const [checkoutInput, setCheckoutInput] = useState({
    user_id: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  const { isLoaded: isGoogleLoaded, loadError: googleLoadError } =
    useJsApiLoader({
      googleMapsApiKey: "AIzaSyBe-vto9mzb1t3HJhvEisd_G_VyNG8dUx8",
      libraries: googleMapsLibraries,
    });

  const paymentMethods = [{ id: "STRIPE", name: "Credit/Debit Card" }];

  const formatImageUrl = (imgPath) => {
    if (!imgPath) return FALLBACK_IMAGE;
    if (imgPath.startsWith("http")) return imgPath;
    return `${import.meta.env.VITE_API_URL || ""}${imgPath}`;
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numericPrice)}`;
  };

  const resetNewAddressForm = () => {
    setNewAddress({
      address: "",
      suburb: "",
      state: "",
      postcode: "",
      address_type: "delivery",
    });
  };

  // Check for payment errors on component mount
  useEffect(() => {
    // Check if we're returning from a failed payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentError = urlParams.get('payment_error');
    const paymentCancelled = urlParams.get('cancelled');
    
    if (paymentError) {
      const errorMsg = decodeURIComponent(paymentError);
      setPaymentErrorMessage(errorMsg);
      alert(`Payment failed: ${errorMsg}`);
      // Clear the URL parameters without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentCancelled) {
      setPaymentErrorMessage("Payment was cancelled. You can try again.");
      alert("Payment was cancelled. You can try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check for stale pending orders (older than 30 minutes)
    const pendingOrder = localStorage.getItem("pending_order");
    if (pendingOrder) {
      try {
        const order = JSON.parse(pendingOrder);
        const now = Date.now();
        const orderAge = now - (order.timestamp || 0);
        
        // If order is older than 30 minutes, remove it
        if (orderAge > 30 * 60 * 1000) {
          localStorage.removeItem("pending_order");
          setPendingOrderExists(false);
        } else {
          setPendingOrderExists(true);
        }
      } catch (e) {
        localStorage.removeItem("pending_order");
        setPendingOrderExists(false);
      }
    } else {
      setPendingOrderExists(false);
    }
  }, []);

  // Fetch delivery charges from API
  const fetchDeliveryCharges = async () => {
    try {
      const response = await api.get("/delivery-charges");
      console.log("Full delivery charges response:", response.data);

      let charges = [];

      // Handle different response structures
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.data
      ) {
        charges = response.data.data.data;
      } else if (
        response.data.success &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        charges = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        charges = response.data.data;
      } else if (Array.isArray(response.data)) {
        charges = response.data;
      } else if (
        response.data.data &&
        response.data.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        charges = response.data.data.data;
      }

      console.log("Parsed delivery charges:", charges);
      setDeliveryCharges(charges);

      // Store in localStorage as backup
      if (charges.length > 0) {
        localStorage.setItem("delivery_charges_cache", JSON.stringify(charges));
      }

      return charges;
    } catch (error) {
      console.error("Failed to fetch delivery charges:", error);

      // Try to load from cache
      const cached = localStorage.getItem("delivery_charges_cache");
      if (cached) {
        console.log("Loading delivery charges from cache");
        const cachedCharges = JSON.parse(cached);
        setDeliveryCharges(cachedCharges);
        return cachedCharges;
      }

      return [];
    }
  };

  // Calculate total weight of all items in cart using the products list endpoint
  const calculateTotalWeight = async (items) => {
    let totalWeight = 0;

    // First fetch all products to get their weights
    try {
      const productsResponse = await api.get("/products");
      const products = productsResponse.data.products || [];

      console.log("All products:", products);

      // Create a map of product_id to weight
      const productWeightMap = {};
      products.forEach((product) => {
        let weight = 0;

        // Extract weight from different possible locations
        if (product.weight && product.weight.product_weight) {
          weight = parseFloat(product.weight.product_weight);
        } else if (product.product_weight) {
          weight = parseFloat(product.product_weight);
        } else if (product.weight_info && product.weight_info.weight) {
          const weightMatch = product.weight_info.weight.match(/(\d+\.?\d*)/);
          if (weightMatch) {
            weight = parseFloat(weightMatch[1]);
          }
        }

        productWeightMap[product.product_id] = weight;
        console.log(
          `Product ${product.product_id} (${product.productname}) weight: ${weight}kg`,
        );
      });

      // Calculate total weight based on cart items
      for (const item of items) {
        const productId = item.product_id;
        const weight = productWeightMap[productId] || 0;
        const quantity = parseInt(item.pro_quantity);
        const itemWeight = weight * quantity;
        totalWeight += itemWeight;

        console.log(
          `Cart item: ${item.productname || productId}, Weight: ${weight}kg x ${quantity} = ${itemWeight}kg`,
        );
      }

      console.log(`Total order weight: ${totalWeight}kg`);
      return totalWeight;
    } catch (error) {
      console.error("Failed to fetch products for weight calculation:", error);
      return 0;
    }
  };

  // Determine appropriate delivery charge based on total weight
  const determineDeliveryCharge = (totalWeight, charges) => {
    if (!charges || charges.length === 0) {
      console.log("No delivery charges available");
      return null;
    }

    console.log(`Determining delivery charge for weight: ${totalWeight}kg`);
    console.log("Available charges:", charges);

    // Sort charges by min weight to ensure we check from smallest to largest
    const sortedCharges = [...charges].sort((a, b) => {
      const getMinWeight = (charge) => {
        const match = charge.weight_range?.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : Infinity;
      };
      return getMinWeight(a) - getMinWeight(b);
    });

    // Find matching charge
    for (const charge of sortedCharges) {
      const weightRange = charge.weight_range;
      if (weightRange) {
        // Try different patterns
        let minWeight = null;
        let maxWeight = null;

        // Pattern 1: "0-5 kg" or "0-5kg"
        let match = weightRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*kg/i);
        if (match) {
          minWeight = parseFloat(match[1]);
          maxWeight = parseFloat(match[2]);
        }

        // Pattern 2: "0-5" without kg
        if (!match) {
          match = weightRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
          if (match) {
            minWeight = parseFloat(match[1]);
            maxWeight = parseFloat(match[2]);
          }
        }

        // Pattern 3: "0 to 5 kg"
        if (!match) {
          match = weightRange.match(/(\d+\.?\d*)\s*to\s*(\d+\.?\d*)\s*kg/i);
          if (match) {
            minWeight = parseFloat(match[1]);
            maxWeight = parseFloat(match[2]);
          }
        }

        if (minWeight !== null && maxWeight !== null) {
          console.log(
            `Checking ${charge.delivery_title}: ${minWeight}-${maxWeight}kg for weight ${totalWeight}kg`,
          );

          if (totalWeight >= minWeight && totalWeight <= maxWeight) {
            const deliveryAmount = parseFloat(charge.delivery_charge);
            console.log(
              `Selected: ${charge.delivery_title} - $${deliveryAmount}`,
            );

            return {
              charge: charge,
              amount: deliveryAmount,
            };
          }
        }
      }
    }

    // If no exact match, find the smallest charge that covers the weight
    for (const charge of sortedCharges) {
      const weightRange = charge.weight_range;
      if (weightRange) {
        let maxWeight = null;
        let match = weightRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
        if (match) {
          maxWeight = parseFloat(match[2]);
        }

        if (maxWeight !== null && totalWeight <= maxWeight) {
          const deliveryAmount = parseFloat(charge.delivery_charge);
          console.log(
            `Using charge that covers weight: ${charge.delivery_title} - $${deliveryAmount}`,
          );
          return {
            charge: charge,
            amount: deliveryAmount,
          };
        }
      }
    }

    // Use the first active charge as default
    const defaultCharge = charges.find(
      (c) => c.is_active === true || c.is_active === 1 || c.is_active === "1",
    );
    if (defaultCharge) {
      const deliveryAmount = parseFloat(defaultCharge.delivery_charge);
      console.log(
        `Using default charge: ${defaultCharge.delivery_title} - $${deliveryAmount}`,
      );
      return {
        charge: defaultCharge,
        amount: deliveryAmount,
      };
    }

    console.log("No matching delivery charge found");
    return null;
  };

  // Update delivery charge when cart items change
  const updateDeliveryCharge = async (items, charges) => {
    if (!items || items.length === 0) {
      console.log("No items in cart");
      setSelectedDeliveryCharge(null);
      setTotalOrderWeight(0);
      return;
    }

    setIsLoadingDelivery(true);
    try {
      const totalWeight = await calculateTotalWeight(items);
      setTotalOrderWeight(totalWeight);

      const deliveryInfo = determineDeliveryCharge(totalWeight, charges);
      console.log("Delivery info in updateDeliveryCharge:", deliveryInfo);
      setSelectedDeliveryCharge(deliveryInfo);
    } catch (error) {
      console.error("Failed to update delivery charge:", error);
    } finally {
      setIsLoadingDelivery(false);
    }
  };

  const fetchAddresses = async (selectedId = null) => {
    try {
      setIsLoadingAddresses(true);

      const addressesResponse = await api.get("/address");

      if (addressesResponse.data.status === 200) {
        const addressList = addressesResponse.data.data || [];
        setAddresses(addressList);

        if (addressList.length > 0) {
          const addressToSelect =
            selectedId || selectedShippingAddress || addressList[0].id;

          setSelectedShippingAddress(String(addressToSelect));
          setShowAddressForm(false);
          setAddressError("");
          setShowAddressWarning(false);
        } else {
          setSelectedShippingAddress(null);
          setShowAddressForm(true);
          setAddressError("Please add a shipping address");
        }
      }
    } catch (error) {
      setAddressError("Failed to load addresses.");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Retry failed payment
  const retryFailedPayment = async () => {
    const pendingOrder = localStorage.getItem("pending_order");
    
    if (pendingOrder) {
      try {
        const order = JSON.parse(pendingOrder);
        const confirmRetry = window.confirm(
          "You have a pending payment. Would you like to retry the payment?"
        );
        
        if (confirmRetry) {
          navigate("/payform", {
            state: {
              amount: parseFloat(order.amount),
              orderId: order.orderId,
            },
          });
        } else {
          // User doesn't want to retry, clean up
          localStorage.removeItem("pending_order");
          setPendingOrderExists(false);
          // Cancel the order via API
          try {
            await api.post(`/cancel-order/${order.orderId}`);
            alert("Order has been cancelled.");
          } catch (err) {
            console.error("Failed to cancel order:", err);
          }
        }
      } catch (e) {
        console.error("Error processing pending order:", e);
        localStorage.removeItem("pending_order");
        setPendingOrderExists(false);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/auth/user");
        const userData = response.data.user;

        if (userData) {
          setIsLoggedIn(true);

          setCheckoutInput({
            user_id: userData.user_id || "",
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });

          const buyNowItemRaw = localStorage.getItem("buy_now_item");

          let items = [];
          if (buyNowItemRaw) {
            try {
              const buyNowItem = JSON.parse(buyNowItemRaw);
              items = [buyNowItem];
              setCartItems(items);
            } catch (_) {
              localStorage.removeItem("buy_now_item");
            }
          } else {
            const cartResponse = await api.get("/cart/view");
            items = cartResponse.data || [];
            setCartItems(items);
          }

          await fetchAddresses();

          // First fetch delivery charges and wait for them
          const charges = await fetchDeliveryCharges();
          console.log("Fetched charges:", charges);

          // Then calculate delivery charge with the fetched charges
          if (items.length > 0 && charges.length > 0) {
            await updateDeliveryCharge(items, charges);
          }
        } else {
          setIsLoggedIn(false);
          setIsLoadingAddresses(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
        setIsLoadingAddresses(false);
      }
    };

    fetchUserData();
  }, []);

  const getAddressComponent = (components, type, useShortName = false) => {
    const component = components.find((item) => item.types.includes(type));

    if (!component) return "";

    return useShortName ? component.short_name : component.long_name;
  };

  const handleGooglePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.address_components) {
      return;
    }

    const components = place.address_components;

    const streetNumber = getAddressComponent(components, "street_number");
    const route = getAddressComponent(components, "route");

    const suburb =
      getAddressComponent(components, "locality") ||
      getAddressComponent(components, "sublocality") ||
      getAddressComponent(components, "sublocality_level_1") ||
      getAddressComponent(components, "postal_town");

    const state = getAddressComponent(
      components,
      "administrative_area_level_1",
      true,
    );

    const postcode = getAddressComponent(components, "postal_code");

    const streetAddress =
      streetNumber && route
        ? `${streetNumber} ${route}`
        : route || streetNumber || place.formatted_address || "";

    setNewAddress({
      address: streetAddress,
      suburb,
      state,
      postcode,
      address_type: "delivery",
    });

    setAddressError("");
    setShowAddressWarning(false);
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;

    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();

    if (
      !newAddress.address ||
      !newAddress.suburb ||
      !newAddress.state ||
      !newAddress.postcode
    ) {
      setAddressError("Please complete address, suburb, state and postcode.");
      setShowAddressWarning(true);
      return;
    }

    try {
      const response = await api.post("/storeAddress", {
        address: newAddress.address,
        suburb: newAddress.suburb,
        state: newAddress.state,
        postcode: newAddress.postcode,
        address_type: "delivery",
      });

      const savedAddress =
        response.data?.data || response.data?.address || response.data;

      if (!savedAddress || !savedAddress.id) {
        throw new Error("Address saved, but address ID was not returned.");
      }

      await fetchAddresses(savedAddress.id);

      setShowAddressForm(false);
      setAddressError("");
      setShowAddressWarning(false);
      resetNewAddressForm();
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join(" ");
        setAddressError(errors);
      } else {
        setAddressError(
          error.response?.data?.message ||
            error.message ||
            "Failed to save address.",
        );
      }

      setShowAddressWarning(true);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedShippingAddress(String(addressId));
    setAddressError("");
    setShowAddressWarning(false);
  };

  const renderPaymentDetails = () => {
    if (selectedPayment === "PAYID") {
      return (
        <div className="col-12">
          <div className="surface-glass p-4 rounded-4 shadow-sm mb-3">
            <h6 className="fw-bold mb-3 fs-5">PayID Details</h6>
            <p className="m-0">
              <strong>PayID:</strong> 0451112478
            </p>
          </div>
        </div>
      );
    }

    if (selectedPayment === "BANK_TRANSFER") {
      return (
        <div className="col-12">
          <div className="surface-glass p-4 rounded-4 shadow-sm mb-3">
            <h6 className="fw-bold mb-3 fs-5">Bank Transfer Details</h6>
            <p className="m-0">
              <strong>Name:</strong> Account Name
            </p>
            <p className="m-0">
              <strong>BSB:</strong> 062 123
            </p>
            <p className="m-0">
              <strong>ACC:</strong> 1234 5678
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const subTotal = cartItems.reduce(
    (total, item) =>
      total + (parseFloat(item.pro_price) * parseInt(item.pro_quantity) || 0),
    0,
  );

  const deliveryFee = selectedDeliveryCharge
    ? selectedDeliveryCharge.amount
    : 0;
  const total = subTotal + deliveryFee;

  const prepareOrderData = () => {
    const selectedAddress = addresses.find(
      (addr) => String(addr.id) === String(selectedShippingAddress),
    );

    if (!selectedAddress) {
      throw new Error("Selected address not found");
    }

    const postcode = selectedAddress.postcode
      ? String(selectedAddress.postcode)
      : "";

    const paymentMethodMap = {
      PAYID: "cod",
      BANK_TRANSFER: "cod",
      PAYPAL: "cod",
      STRIPE: "stripe",
    };

    return {
      user_id: checkoutInput.user_id,
      shippingaddress: selectedAddress.address,
      suburb: selectedAddress.suburb,
      postcode: postcode,
      state: selectedAddress.state,
      subtotal: subTotal.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      total_price: total.toFixed(2),
      payment_method:
        paymentMethodMap[selectedPayment] || selectedPayment.toLowerCase(),
      items: cartItems.map((item) => ({
        id: item.backend_product_id || item.product_id,
        ord_price: item.pro_price,
        ord_quantity: item.pro_quantity,
        image_url: formatImageUrl(item.images?.[0]?.imgurl || item.image_url),
      })),
    };
  };

  const prepareOrderDataAsync = async () => {
    const base = prepareOrderData();

    const resolvedItems = await Promise.all(
      base.items.map(async (it, idx) => {
        if (it.id) return it;

        const source = cartItems[idx];
        const identifier = source?.product_id || source?.id;

        if (!identifier) return it;

        try {
          const res = await api.get(`/products/${identifier}`);
          const product = res.data?.product || res.data?.data || res.data;
          const backendId = product?.product_id || product?.id || null;

          return { ...it, id: backendId || it.id };
        } catch (error) {
          console.error(`Failed to fetch product ${identifier}:`, error);
          return it;
        }
      }),
    );

    return { ...base, items: resolvedItems };
  };

  const completeOrder = async (paymentMethod = null) => {
    try {
      let orderData = await prepareOrderDataAsync();

      if (paymentMethod) {
        orderData.payment_method = paymentMethod;
      }

      const response = await api.post("/place-order", orderData);

      if (response.data && response.data.order_id) {
        localStorage.setItem("latest_order_id", response.data.order_id);

        const orderedProducts = cartItems.map((item) => ({
          product_id: item.product_id,
          name: item.productname,
          price: item.pro_price,
          quantity: item.pro_quantity,
          image_url: formatImageUrl(item.images?.[0]?.imgurl || item.image_url),
        }));

        localStorage.setItem(
          "ordered_products",
          JSON.stringify(orderedProducts),
        );

        await clearCart();

        localStorage.removeItem("buy_now_item");
        localStorage.removeItem("pending_order");

        navigate("/order-success");
      } else {
        throw new Error(response.data.message || "Order failed");
      }
    } catch (error) {
      console.error("Complete order error:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
        alert(
          "Validation errors: " + JSON.stringify(error.response.data.errors),
        );
      } else {
        alert(`Order failed: ${error.message}`);
      }
      throw error;
    }
  };

  const handleStripePayment = async () => {
    try {
      const orderData = await prepareOrderDataAsync();

      const orderResponse = await api.post("/place-order", {
        ...orderData,
        payment_method: "stripe",
        payment_status: "pending",
      });

      if (!orderResponse.data?.order_id) {
        throw new Error("Failed to create order");
      }

      // Store the order info for potential recovery
      localStorage.setItem(
        "pending_order",
        JSON.stringify({
          orderId: orderResponse.data.order_id,
          amount: total.toFixed(2),
          currency: "aud",
          user_id: checkoutInput.user_id,
          timestamp: Date.now(),
        })
      );

      // Navigate to payment page
      navigate("/payform", {
        state: {
          amount: total,
          orderId: orderResponse.data.order_id,
        },
      });
    } catch (error) {
      console.error("Stripe payment setup error:", error);
      
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
        alert(
          "Validation errors: " + JSON.stringify(error.response.data.errors),
        );
      } else {
        alert(error.message || "Payment processing failed");
      }
      
      setIsPlacingOrder(false);
      
      // Clean up any partial order if needed
      const pendingOrder = localStorage.getItem("pending_order");
      if (pendingOrder) {
        try {
          const order = JSON.parse(pendingOrder);
          await api.post(`/cancel-order/${order.orderId}`).catch(() => {});
          localStorage.removeItem("pending_order");
        } catch (e) {
          console.error("Failed to clean up order:", e);
        }
      }
    }
  };

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    setValidationErrors({});
    setAddressError("");
    setPaymentErrorMessage("");

    try {
      if (cartItems.length === 0) {
        throw new Error(
          "Your cart is empty. Please add items before proceeding.",
        );
      }

      if (!isLoggedIn) {
        throw new Error("Please login to continue with checkout");
      }

      if (addresses.length === 0) {
        setAddressError("No addresses found. Please add a shipping address.");
        setShowAddressForm(true);
        setShowAddressWarning(true);
        throw new Error("Please add a shipping address");
      }

      if (!selectedShippingAddress) {
        setAddressError("Please select a shipping address");
        setShowAddressWarning(true);
        throw new Error("Please select a shipping address");
      }

      const addressExists = addresses.find(
        (addr) => String(addr.id) === String(selectedShippingAddress),
      );

      if (!addressExists) {
        setAddressError(
          "The selected address is no longer available. Please select a different address.",
        );
        setShowAddressWarning(true);
        throw new Error(
          "The selected address is no longer available. Please select a different address.",
        );
      }

      setShowAddressWarning(false);

      if (!selectedPayment) {
        throw new Error("Please select a payment method");
      }

      if (selectedPayment === "STRIPE") {
        await handleStripePayment();
        return;
      }

      await completeOrder();

      localStorage.removeItem("buy_now_item");
      localStorage.removeItem("pending_order");
    } catch (error) {
      if (
        !error.message.includes("address") &&
        !error.message.includes("Address")
      ) {
        alert(`Order failed: ${error.message}`);
      }

      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    setShowAddressWarning(false);
    placeOrder();
  };

  return (
    <>
      <PageHeader title="Checkout" path="Home / Shop / Checkout" />

      <div className="container py-5 text-start" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        {/* Progress Stepper */}
        <div className="bg-white border rounded-3 p-4 shadow-sm mb-5">
          <div className="d-flex justify-content-between align-items-center position-relative px-2">
            <div className="position-absolute start-0 end-0 top-50 translate-middle-y bg-light" style={{ height: "4px", zIndex: 0 }}></div>
            <div className="position-absolute start-0 top-50 translate-middle-y bg-primary" style={{ height: "4px", width: "50%", zIndex: 0 }}></div>
            
            <div className="position-relative z-1 d-flex flex-column align-items-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold" style={{ width: "36px", height: "36px" }}>1</div>
              <span className="small fw-bold mt-2 text-dark">Cart</span>
            </div>
            <div className="position-relative z-1 d-flex flex-column align-items-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold" style={{ width: "36px", height: "36px" }}>2</div>
              <span className="small fw-bold mt-2 text-dark">Shipping</span>
            </div>
            <div className="position-relative z-1 d-flex flex-column align-items-center">
              <div className="rounded-circle bg-white border border-primary text-primary d-flex align-items-center justify-content-center shadow-sm fw-bold" style={{ width: "36px", height: "36px" }}>3</div>
              <span className="small fw-bold mt-2 text-dark">Payment</span>
            </div>
            <div className="position-relative z-1 d-flex flex-column align-items-center">
              <div className="rounded-circle bg-white border text-muted d-flex align-items-center justify-content-center shadow-sm fw-bold" style={{ width: "36px", height: "36px" }}>4</div>
              <span className="small fw-bold mt-2 text-muted">Review</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Input Details & Shipping */}
          <div className="col-lg-7">
            {/* Payment Error Message */}
            {paymentErrorMessage && (
              <div className="alert alert-danger alert-dismissible fade show mb-4 rounded-3 shadow-sm" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Payment Error:</strong> {paymentErrorMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPaymentErrorMessage("")}
                ></button>
              </div>
            )}

            {/* Pending Order Notification */}
            {pendingOrderExists && (
              <div className="alert alert-info alert-dismissible fade show mb-4 rounded-3 shadow-sm" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                <strong>Pending Payment:</strong> You have a pending payment that was not completed.
                <button 
                  className="btn btn-sm btn-primary ms-3 px-3 rounded-pill"
                  onClick={retryFailedPayment}
                >
                  Retry Payment
                </button>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    localStorage.removeItem("pending_order");
                    setPendingOrderExists(false);
                  }}
                ></button>
              </div>
            )}

            {!isLoggedIn && (
              <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
                <h5 className="fw-bold text-dark mb-3">Customer Account</h5>
                <p className="text-muted small mb-4">Log in to your account for faster checkout and to use your saved shipping addresses.</p>
                <Link
                  to="/login"
                  className="btn btn-primary px-4 py-2"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i> Log In Now
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <>
                {/* User Info */}
                <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                    User Details
                  </h5>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="text-muted small mb-1">First Name</label>
                      <div className="fw-bold text-dark">{checkoutInput.firstname}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small mb-1">Last Name</label>
                      <div className="fw-bold text-dark">{checkoutInput.lastname}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small mb-1">Email Address</label>
                      <div className="fw-bold text-dark">{checkoutInput.email}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small mb-1">Phone Number</label>
                      <div className="fw-bold text-dark">{checkoutInput.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Shipping Addresses */}
                <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <h5 className="fw-bold text-dark mb-0" style={{ color: "var(--brand-primary)" }}>
                      Shipping Address
                    </h5>

                    {addresses.length > 0 && !showAddressForm && (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill py-1 px-3"
                        onClick={() => {
                          setShowAddressForm(true);
                          setAddressError("");
                          setShowAddressWarning(false);
                        }}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add New
                      </button>
                    )}
                  </div>

                  {isLoadingAddresses && (
                    <div className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading addresses...
                    </div>
                  )}

                  {!isLoadingAddresses && addresses.length > 0 && !showAddressForm && (
                    <div
                      className="custom-scrollbar"
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="d-flex flex-column gap-3">
                        {addresses.map((addr) => {
                          const isSelected = String(selectedShippingAddress) === String(addr.id);
                          return (
                            <label
                              key={addr.id}
                              className={`card p-3 border rounded-3 shadow-sm hover-lift cursor-pointer mb-1 ${
                                isSelected ? "border-primary" : "border-light"
                              }`}
                              style={{ transition: "all 0.2s" }}
                            >
                              <div className="form-check d-flex align-items-start m-0">
                                <input
                                  className="form-check-input mt-1"
                                  type="radio"
                                  name="shippingAddress"
                                  value={addr.id}
                                  checked={isSelected}
                                  onChange={() => handleAddressSelect(addr.id)}
                                />
                                <div className="form-check-label ms-3 text-start">
                                  <div className="fw-bold text-dark">{addr.address}</div>
                                  <div className="text-muted small">
                                    {addr.suburb}, {addr.state} {addr.postcode}
                                  </div>
                                  <span className="badge bg-light text-secondary border rounded-pill mt-2 text-capitalize px-2 py-1 small">
                                    {addr.address_type}
                                  </span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isLoadingAddresses && addresses.length === 0 && !showAddressForm && (
                    <div className="text-center py-4">
                      <p className="text-muted small mb-3">No shipping addresses found. Please add a shipping address to continue.</p>
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4 py-2"
                        onClick={() => setShowAddressForm(true)}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add Shipping Address
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <form onSubmit={handleSaveNewAddress} className="mt-3">
                      <input
                        type="hidden"
                        name="address_type"
                        value="delivery"
                      />

                      {addressError && (
                        <div className="alert alert-danger p-2 mb-3 rounded text-center small">
                          {addressError}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark small mb-1">
                          Address <span className="text-danger">*</span>
                        </label>

                        {googleLoadError ? (
                          <input
                            type="text"
                            name="address"
                            className="form-control"
                            placeholder="Enter your address manually"
                            value={newAddress.address}
                            onChange={handleNewAddressChange}
                            required
                          />
                        ) : !isGoogleLoaded ? (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Loading address search..."
                            disabled
                          />
                        ) : (
                          <Autocomplete
                            onLoad={(autocomplete) => {
                              autocompleteRef.current = autocomplete;
                            }}
                            onPlaceChanged={handleGooglePlaceChanged}
                            options={{
                              types: ["address"],
                              componentRestrictions: { country: "au" },
                              fields: [
                                "address_components",
                                "formatted_address",
                              ],
                            }}
                          >
                            <input
                              type="text"
                              name="address"
                              className="form-control"
                              placeholder="Start typing your shipping address"
                              value={newAddress.address}
                              onChange={handleNewAddressChange}
                              required
                            />
                          </Autocomplete>
                        )}
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold text-dark small mb-1">
                            Suburb <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="suburb"
                            className="form-control"
                            value={newAddress.suburb}
                            onChange={handleNewAddressChange}
                            required
                          />
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold text-dark small mb-1">
                            State <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            className="form-control"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            required
                          />
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold text-dark small mb-1">
                            Postcode <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="postcode"
                            className="form-control"
                            value={newAddress.postcode}
                            onChange={handleNewAddressChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2"
                        >
                          Save Address
                        </button>

                        {addresses.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary px-4 py-2"
                            onClick={() => {
                              setShowAddressForm(false);
                              setAddressError("");
                              setShowAddressWarning(false);
                              resetNewAddressForm();
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}

            {/* Payment Options */}
            <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                Payment Method
              </h5>

              <div className="row g-3">
                {paymentMethods.map((method) => (
                  <div className="col-12" key={method.id}>
                    <div className="form-check p-3 border rounded-3 d-flex align-items-center">
                      <input
                        className="form-check-input ms-0 mt-0 me-3"
                        type="radio"
                        name="paymentMethod"
                        id={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                      />
                      <label className="form-check-label fw-bold text-dark cursor-pointer mb-0" htmlFor={method.id}>
                        <i className="bi bi-credit-card me-2 text-primary fs-5"></i> {method.name}
                      </label>
                    </div>
                  </div>
                ))}

                <div className="col-12 mt-3">
                  {renderPaymentDetails()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order & Billing Summary */}
          <div className="col-lg-5">
            {/* Products List Summary */}
            <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
              <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                Items in Order
              </h5>

              {cartItems.length > 0 ? (
                <div className="d-flex flex-column gap-3 max-height-300 overflow-auto pr-1">
                  {cartItems.map((item, index) => (
                    <div
                      className="d-flex justify-content-between align-items-center"
                      key={index}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="border rounded bg-white p-1" style={{ width: "60px", height: "60px" }}>
                          <FallbackImage
                            src={formatImageUrl(
                              item.images?.[0]?.imgurl || item.image_url,
                            )}
                            alt={item.productname || "Product"}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>

                        <div className="text-start">
                          <span className="fw-bold text-dark d-block text-truncate" style={{ fontSize: "14px", maxWidth: "180px" }}>
                            {item.productname || "Product"}
                          </span>
                          <span className="text-muted small">Qty: {item.pro_quantity}</span>
                        </div>
                      </div>

                      <span className="fw-bold text-dark">
                        {formatPrice(parseFloat(item.pro_price) * parseInt(item.pro_quantity))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted small mb-3">Your cart is empty.</p>
                  <Link to="/shop" className="btn btn-outline-primary rounded-pill px-4">
                    Go to Shop
                  </Link>
                </div>
              )}
            </div>

            {/* Billing Summary */}
            <div className="bg-white border rounded-3 p-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ color: "var(--brand-primary)" }}>
                Billing Summary
              </h5>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between text-muted">
                  <span>Subtotal (Tax Included)</span>
                  <span className="fw-semibold text-dark">{formatPrice(subTotal)}</span>
                </div>

                <div className="d-flex justify-content-between text-muted">
                  <span>Delivery Charge</span>
                  {isLoadingDelivery ? (
                    <span className="fw-semibold text-muted">Calculating...</span>
                  ) : (
                    <span className="fw-bold text-success">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                  )}
                </div>

                {selectedDeliveryCharge && selectedDeliveryCharge.charge && (
                  <div className="d-flex justify-content-between text-muted small bg-light p-2 rounded">
                    <span>Delivery Method</span>
                    <span>
                      {selectedDeliveryCharge.charge.delivery_title} ({totalOrderWeight.toFixed(1)}kg total)
                    </span>
                  </div>
                )}

                <hr className="my-1" />

                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-bold text-dark">Total</span>
                  <span className="fs-3 fw-bold" style={{ color: "var(--brand-primary)" }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {showAddressWarning && (
                <div className="alert alert-warning p-2 mb-3 rounded text-center small" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Please select or save a shipping address to place your order.
                </div>
              )}

              <button
                disabled={
                  isPlacingOrder ||
                  !selectedPayment ||
                  cartItems.length === 0 ||
                  isLoadingAddresses ||
                  isLoadingDelivery
                }
                onClick={handlePlaceOrder}
                className="btn btn-primary w-100 py-3 fw-bold"
                style={{ fontSize: "15px" }}
              >
                {isPlacingOrder ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i> Place Order
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-top text-center">
                <p className="text-muted small mb-3">
                  <i className="bi bi-shield-lock-fill text-success me-2"></i> Secure & Protected Checkout
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
      </div>
    </>
  );
};

export default CheckoutPage;