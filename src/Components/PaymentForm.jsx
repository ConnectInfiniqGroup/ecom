import { useEffect, useMemo, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Paypallogo from "../Assets/Images/Stripe.png";
import GlobalButton from "./Button";
import PageHeader from "./PageHeader";

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



const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [userId, setUserId] = useState(null);
  const [paymentIntents, setPaymentIntents] = useState([]);
  const [currentIntentIndex, setCurrentIntentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false); // Added missing state

  const [cardComplete, setCardComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");

  // Timer
  const [time, setTime] = useState(3 * 60 + 20);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 0) {
          clearInterval(id);
          setTimeExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [time]);

  const clearLocalStorageItems = () => {
    localStorage.removeItem("pending_order");
    localStorage.removeItem("buy_now_item");
  };

  // Handle timeout redirect
  useEffect(() => {
    if (timeExpired) {
      Swal.fire({
        title: "Time Expired",
        text: "Your payment session has expired. Please try again.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-4 border-0 shadow-lg p-4 text-center",
          confirmButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
          title: "fw-bold heading text-dark mt-2 mb-1"
        },
        buttonsStyling: false,
      }).then(() => {
        clearLocalStorageItems();
        navigate("/checkout?payment_error=Payment session expired");
      });
    }
  }, [timeExpired, navigate]);

  // Handle successful payment
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: "Payment Successful!",
        text: `Your order #${orderId} has been placed successfully.`,
        icon: "success",
        confirmButtonText: "View Order Summary",
        customClass: {
          popup: "rounded-4 border-0 shadow-lg p-4 text-center",
          confirmButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
          title: "fw-bold heading text-dark mt-2 mb-1"
        },
        buttonsStyling: false,
      }).then(() => {
        navigate("/order-success");
      });
    }
  }, [success, orderId, navigate]);

  // Initialize payment from location state or pending order
  useEffect(() => {
    if (timeExpired) return;

    // First try to get data from location state (passed from checkout)
    if (location.state && location.state.amount && location.state.orderId) {
      setAmount(location.state.amount);
      setOrderId(location.state.orderId);
      // Get user_id from localStorage or from state
      const pendingOrder = JSON.parse(
        localStorage.getItem("pending_order") || "null",
      );
      if (pendingOrder && pendingOrder.user_id) {
        setUserId(pendingOrder.user_id);
      } else {
        // Try to get user from auth
        fetchCurrentUser();
      }
      createPaymentIntent(location.state.amount, location.state.orderId);
      return;
    }

    // Fallback to localStorage
    const pendingOrder = JSON.parse(
      localStorage.getItem("pending_order") || "null",
    );

    if (!pendingOrder) {
      Swal.fire({
        title: "No Order Found",
        text: "No pending order found. Redirecting to checkout.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-4 border-0 shadow-lg p-4 text-center",
          confirmButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
          title: "fw-bold heading text-dark mt-2 mb-1"
        },
        buttonsStyling: false,
      }).then(() => {
        navigate("/checkout");
      });
      return;
    }

    setAmount(pendingOrder.amount);
    setOrderId(pendingOrder.orderId);
    setUserId(pendingOrder.user_id);
    createPaymentIntent(
      pendingOrder.amount,
      pendingOrder.orderId,
      pendingOrder.user_id,
    );
  }, [navigate, location, timeExpired]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/user");
      if (response.data.user && response.data.user.user_id) {
        setUserId(response.data.user.user_id);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const createPaymentIntent = async (amount, orderId, userId = null) => {
    try {
      setLoading(true);

      // Get user_id if not provided
      let finalUserId = userId;
      if (!finalUserId) {
        const pendingOrder = JSON.parse(
          localStorage.getItem("pending_order") || "null",
        );
        finalUserId = pendingOrder?.user_id;
      }

      // If still no user_id, try to fetch from auth
      if (!finalUserId) {
        try {
          const userResponse = await api.get("/auth/user");
          if (userResponse.data.user && userResponse.data.user.user_id) {
            finalUserId = userResponse.data.user.user_id;
          }
        } catch (err) {
          console.error("Failed to get user:", err);
        }
      }

      if (!finalUserId) {
        throw new Error("User ID not found. Please login again.");
      }

      const requestData = {
        amount: parseFloat(amount),
        currency: "aud",
        order_id: orderId,
        user_id: finalUserId,
      };

      console.log("Creating payment intent with data:", requestData);

      const response = await api.post("/create-payment-intent", requestData);

      console.log("Payment intent response:", response.data);

      if (response.data && response.data.success) {
        if (
          response.data.paymentIntents &&
          Array.isArray(response.data.paymentIntents)
        ) {
          setPaymentIntents(response.data.paymentIntents);
          setError(null);
        } else {
          throw new Error(response.data?.message || "Invalid payment response");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to initialize payment",
        );
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      let errorMsg = "Failed to initialize payment. Please try again.";

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMsg = errors.join(", ");
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);

      Swal.fire({
        title: "Payment Initialization Failed",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-4 border-0 shadow-lg p-4 text-center",
          confirmButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
          title: "fw-bold heading text-dark mt-2 mb-1"
        },
        buttonsStyling: false,
      }).then(() => {
        clearLocalStorageItems();
        navigate("/checkout?payment_error=" + encodeURIComponent(errorMsg));
      });
    } finally {
      setLoading(false);
    }
  };

  const processPaymentIntents = async () => {
    if (!stripe || !elements) {
      setError("Payment system not ready. Please wait...");
      return false;
    }

    if (!name.trim()) {
      setError("Please enter the cardholder name.");
      return false;
    }

    if (!cardComplete) {
      setError("Please complete your card details.");
      return false;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Payment field not ready.");
      return false;
    }

    // Process all payment intents one by one
    for (let i = 0; i < paymentIntents.length; i++) {
      const intent = paymentIntents[i];
      setCurrentIntentIndex(i);

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name.trim(),
            },
          },
        });

      if (stripeError) {
        throw new Error(`Payment failed: ${stripeError.message}`);
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(
          `Payment not completed. Status: ${paymentIntent?.status}`,
        );
      }

      // Record successful payment for this intent
      await api.post("/handle-payment-success", {
        payment_intent_id: paymentIntent.id,
        order_id: orderId,
        amount: intent.amount,
        currency: "aud",
        user_id: userId,
      });
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true); // Set submitted to true when form is submitted

    if (timeExpired) {
      setError("Payment session has expired. Please try again.");
      return;
    }

    if (paymentIntents.length === 0) {
      setError("Payment not initialized. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentSuccess = await processPaymentIntents();

      if (paymentSuccess) {
        clearLocalStorageItems();
        localStorage.setItem("latest_order_id", orderId);
        setSuccess(true);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Payment processing failed";
      setError(errorMessage);

      // Check if payment intent expired
      if (
        errorMessage.toLowerCase().includes("expired") ||
        err?.code === "resource_missing" ||
        errorMessage.toLowerCase().includes("no such paymentintent")
      ) {
        Swal.fire({
          title: "Payment Session Expired",
          text: "Your payment session has expired. Please try again.",
          icon: "warning",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-4 border-0 shadow-lg p-4 text-center",
            confirmButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
            title: "fw-bold heading text-dark mt-2 mb-1"
          },
          buttonsStyling: false,
        }).then(() => {
          clearLocalStorageItems();
          navigate("/checkout?payment_error=Payment session expired");
        });
      } else {
        setLoading(false);
      }
    } finally {
      if (!error || !error.toLowerCase().includes("expired")) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Cancel Payment",
      text: "Are you sure you want to cancel this payment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "No, continue",
      customClass: {
        popup: "rounded-4 border-0 shadow-lg p-4 text-center",
        confirmButton: "btn btn-outline-danger rounded-pill px-4 py-2 shadow-sm me-2",
        cancelButton: "btn btn-primary rounded-pill px-4 py-2 shadow-sm",
        title: "fw-bold heading text-dark mt-2 mb-1"
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        clearLocalStorageItems();
        navigate("/checkout?payment_cancelled=true");
      }
    });
  };

  const formattedCardNumber = "XXXX XXXX XXXX XXXX";
  const formattedName = useMemo(() => {
    if (!name.trim()) return "YOUR NAME HERE";
    return name.toUpperCase();
  }, [name]);
  const formattedExpiry = "XX/XX";

  const VisaSVG = () => (
    <svg
      x="0px"
      y="0px"
      width="65"
      height="65"
      viewBox="0 0 240 53"
      xmlns="http://www.w3.org/2000/svg"
      className="logo position-absolute"
    >
      <defs>
        <linearGradient
          y2="100%"
          y1="-4.006%"
          x2="54.877%"
          x1="45.974%"
          id="logosVisa0"
        >
          <stop stop-color="#222357" offset="0%"></stop>
          <stop stop-color="#254AA5" offset="100%"></stop>
        </linearGradient>
      </defs>
      <path
        transform="matrix(0.9 0 0 -1 0 82.668)"
        d="M132.397 56.24c-.146-11.516 10.263-17.942 18.104-21.763c8.056-3.92 10.762-6.434 10.73-9.94c-.06-5.365-6.426-7.733-12.383-7.825c-10.393-.161-16.436 2.806-21.24 5.05l-3.744-17.519c4.82-2.221 13.745-4.158 23-4.243c21.725 0 35.938 10.724 36.015 27.351c.085 21.102-29.188 22.27-28.988 31.702c.069 2.86 2.798 5.912 8.778 6.688c2.96.392 11.131.692 20.395-3.574l3.636 16.95c-4.982 1.814-11.385 3.551-19.357 3.551c-20.448 0-34.83-10.87-34.946-26.428m89.241 24.968c-3.967 0-7.31-2.314-8.802-5.865L181.803 1.245h21.709l4.32 11.939h26.528l2.506-11.939H256l-16.697 79.963h-17.665m3.037-21.601l6.265-30.027h-17.158l10.893 30.027m-118.599 21.6L88.964 1.246h20.687l17.104 79.963h-20.679m-30.603 0L53.941 26.782l-8.71 46.277c-1.022 5.166-5.058 8.149-9.54 8.149H.493L0 78.886c7.226-1.568 15.436-4.097 20.41-6.803c3.044-1.653 3.912-3.098 4.912-7.026L41.819 1.245H63.68l33.516 79.963H75.473"
        fill="url(#logosVisa0)"
      ></path>
    </svg>
  );

  const MastercardSVG = () => (
    <svg
      className="logo position-absolute"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="65"
      height="65"
      viewBox="0 0 48 48"
    >
      <path
        fill="#ff9800"
        d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"
      ></path>
      <path
        fill="#d50000"
        d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"
      ></path>
      <path
        fill="#ff3d00"
        d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"
      ></path>
    </svg>
  );

  const BrandBadge = () => {
    switch (cardBrand) {
      case "visa":
        return <VisaSVG />;
      case "mastercard":
        return <MastercardSVG />;
      case "amex":
        return (
          <p className="cardheading position-absolute">AMERICAN EXPRESS</p>
        );
      case "discover":
        return <p className="cardheading position-absolute">DISCOVER</p>;
      case "diners":
        return <p className="cardheading position-absolute">DINERS CLUB</p>;
      case "jcb":
        return <p className="cardheading position-absolute">JCB</p>;
      case "unionpay":
        return <p className="cardheading position-absolute">UNIONPAY</p>;
      default:
        return <p className="cardheading position-absolute text-end">CARD</p>;
    }
  };

  return (
    <>
      <PageHeader title="Checkout" path="Home / Shop / Checkout / Payment" />

      <div className="container py-4 py-md-5">
        <div className="row g-4 justify-content-center">
          {/* Form */}
          <div className="col-lg-8">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-2">
                <img
                  src={Paypallogo}
                  alt="Stripe Logo"
                  style={{ width: "150px" }}
                />
              </div>

              <div className="text-end">
                <small className="text-secondary d-block">Time left</small>
                <div className="fw-semibold">{countdown}</div>
              </div>
            </div>

            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {timeExpired && (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-clock-history me-2"></i>
                Your payment session has expired. You will be redirected
                shortly.
              </div>
            )}

            {paymentIntents.length === 0 && !error && !timeExpired && (
              <div className="alert alert-info" role="alert">
                <div className="d-flex align-items-center">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Initializing payment session...
                </div>
              </div>
            )}

            {paymentIntents.length > 1 && (
              <div className="alert alert-info mb-3" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                Processing payment {currentIntentIndex + 1} of{" "}
                {paymentIntents.length}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className={`form-control rounded-0 ${submitted && !name.trim() ? "is-invalid" : ""}`}
                  autoComplete="cc-name"
                  placeholder="Name on the card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={
                    loading || timeExpired || paymentIntents.length === 0
                  }
                />
                <div className="form-text">
                  Enter the name exactly as it appears on your card
                </div>
                {submitted && !name.trim() && (
                  <div className="invalid-feedback">
                    Please enter the cardholder name.
                  </div>
                )}
              </div>

              {/* Card Element */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Card Details</label>
                <div
                  className={`border p-3 rounded-0 ${submitted && !cardComplete ? "border-danger" : ""}`}
                >
                  <CardElement
                    options={CARD_OPTIONS}
                    onChange={(e) => {
                      setCardComplete(e.complete);
                      setCardBrand(e.brand || "unknown");
                      if (e.error) {
                        setError(e.error.message);
                      } else {
                        setError(null);
                      }
                    }}
                    disabled={timeExpired || paymentIntents.length === 0}
                  />
                </div>
                <div className="form-text">
                  Enter your card number, expiry date, and CVC code
                </div>
                {submitted && !cardComplete && (
                  <div className="text-danger small mt-1">
                    Please complete your card details.
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 mt-4">
                <GlobalButton
                  type="submit"
                  className="w-100"
                  disabled={
                    loading ||
                    !stripe ||
                    paymentIntents.length === 0 ||
                    timeExpired ||
                    !cardComplete ||
                    !name.trim()
                  }
                >
                  {loading
                    ? `Processing ${paymentIntents.length > 1 ? `(${currentIntentIndex + 1}/${paymentIntents.length})` : ""}...`
                    : `Pay $${amount}`}
                </GlobalButton>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-0"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                <i className="bi bi-lock-fill me-1"></i>
                Your payment is secure and encrypted
              </small>
            </div>
          </div>

          {/* Preview + Summary */}
          <div className="col-lg-3">
            {/* Card Preview */}
            <div className="atm-card bg-transparent mb-4 text-white">
              <div className="atm-card-front rounded-4 position-absolute d-flex flex-column justify-content-center w-100 h-100 p-3">
                {/* <div className="d-flex align-items-end">
                  <BrandBadge />
                </div> */}

                {/* Chip */}
                <div className="chip position-absolute">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                {/* Contactless icon */}
                <svg
                  version="1.1"
                  className="contactless position-absolute"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  width="30px"
                  height="30px"
                  viewBox="0 0 50 50"
                  xmlSpace="preserve"
                >
                  <image
                    id="image0"
                    width="50"
                    height="50"
                    x="0"
                    y="0"
                    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQflGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/FfPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xNGQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49itVoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJkHpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15zbkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6gDJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJqSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKBsSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD70AmzZ+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uXXSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUicUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaInKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBKxDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1NiswMDowMIXeN6gAAAAASUVORK5CYII="
                  ></image>
                </svg>

                <p className="number position-absolute fw-bold">
                  {formattedCardNumber}
                </p>
                <p className="valid_thru position-absolute fw-bold">
                  VALID THRU
                </p>
                <p className="card-date position-absolute fw-bold">
                  {formattedExpiry}
                </p>
                <p className="card-name position-absolute fw-bold">
                  {formattedName}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card border-0 rounded-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Order Summary</h6>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-secondary">Order Number</span>
                  <span className="fw-semibold">#{orderId}</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-secondary">Total Amount</span>
                  <span className="fw-semibold">${amount}</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-secondary">Tax (GST)</span>
                  <span className="fw-semibold">Included</span>
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="text-secondary small">Total to pay</span>
                  <div className="text-end">
                    <div className="fs-5 fw-bold text-primary">
                      ${amount} AUD
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center mt-3 small text-secondary mb-0">
              <i className="bi bi-shield-check me-1"></i>
              Secure checkout • Powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentForm;
