import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./Assets/Styles/Style.css";
 // Import your api instance instead of axios

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import MobileNavbar from "./Components/MobileNavbar";
import PaymentForm from "./Components/PaymentForm";
import { CartProvider } from "./Components/CartContext";
import ScrollToTop from "./Components/ScrollToTop";
import BackToTop from "./Components/BacktToTop";
import Cookies from "./Components/Cookies";
import { CompareProvider } from "./Components/CompareContext";
import CompareModal from "./Components/CompareModal";
import { ToastProvider } from "./Components/ToastContext";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Shop from "./Pages/Shop";
import Contact from "./Pages/Contact";
import ViewCart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import OrderSummary from "./Pages/OrderSuccess";
import UserProfile from "./Pages/UserProfile";
import FAQ from "./Pages/FAQ";
import ProductDetails from "./Pages/ProductDetails";
import InvoicePage from "./Pages/Invoice";
import AdminPrivateRoute from "./AdminPrivateRoute";
import PasswordReset from "./Pages/PasswordReset";
import Categories from "./Pages/Categories";

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


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Remove the old axios defaults and interceptors
// They are now handled in the api.jsx file

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth failure events
    const handleAuthFailure = () => {
      console.log("Auth failure detected, redirecting to login");
      setIsLoggedIn(false);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_name");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate('/login', { replace: true });
    };
    
    // Listen for storage events (if localStorage changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' && !e.newValue) {
        setIsLoggedIn(false);
        navigate('/login', { replace: true });
      }
    };
    
    window.addEventListener('auth-failed', handleAuthFailure);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('auth-failed', handleAuthFailure);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Use api instance instead of axios
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_name");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("login_time");
      localStorage.removeItem("dashboardActiveTab");
      
      setIsLoggedIn(false);
      setShowLogoutMessage(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        setShowLogoutMessage(false);
        navigate('/login', { replace: true });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Header isLoggedIn={isLoggedIn} />

      {/* Logout Message */}
      {showLogoutMessage && (
        <div className="logout-message-container">
          <div className="logout-message">
            <h3>Logged Out!</h3>
            <p>You have been successfully logged out. Redirecting to login page...</p>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <Register />
          }
        />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<ViewCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/payform"
          element={
            <Elements stripe={stripePromise}>
              <PaymentForm />
            </Elements>
          }
        />
        <Route path="/order-success" element={<OrderSummary />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route
          path="/dashboard/*"
          element={<AdminPrivateRoute handleLogout={handleLogout} />}
        />
        <Route path="/faq" element={<FAQ />} />
        <Route
          path="/shop/product/:slugWithId"
          element={<ProductDetails />}
        />
        <Route path="/invoice" element={<InvoicePage />} />
      </Routes>
             
      <CompareModal />
      <Footer />
      <MobileNavbar />



      <BackToTop />
      <Cookies />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <CompareProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </CompareProvider>
    </ToastProvider>
  );
}

export default App;