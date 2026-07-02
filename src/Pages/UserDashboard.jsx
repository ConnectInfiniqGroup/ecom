import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import PageHeader from "../Components/PageHeader";

import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import GlobalButton from "../Components/Button";
import AddressEditModal from "../Components/AddressEditModal";
import InvoiceTemplate from "../Components/InvoiceTemplate";
import AddressTab from "../Components/AddressTab";
import RefundTab from "../Components/RefundTab";
import ReviewTab from "../Components/ReviewTab";
import UserTab from "../Components/UserTab";
import RenderOrderCard from "../Components/RenderOrderCard";
import OrderDetailsModal from "../Components/OrderDetailsModal";
import NotificationTab from "../Components/NotificationTab";
import ApprovedReviewsTab from "../Components/ApprovedReviewsTab.jsx";

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


const Dashboard = ({ handleLogout }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboardActiveTab") || "dashboard";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [cancellationError, setCancellationError] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [notificationError, setNotificationError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cancellationReasons] = useState([
    "Changed my mind about the purchase",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Shipping takes too long",
    "Product specifications don't meet my needs",
    "Other",
  ]);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const contentRef = useRef(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const eventSourceRef = useRef(null);
  const pollingIntervalsRef = useRef({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  // Sync tab selection with localStorage on navigation changes
  useEffect(() => {
    const tab = localStorage.getItem("dashboardActiveTab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location, activeTab]);

  // Format order helper
  const formatOrder = (order) => {
    let amount = parseFloat(order.total_price) || 0;
    if (isNaN(amount)) amount = 0;

    return {
      id: order.order_id,
      date: order.created_at
        ? new Date(order.created_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
      amount,
      status: order.payment_status,
      method: order.payment_method,
      fullData: order,
    };
  };

  // Helper to safely get an item's image URL
  const getItemImageUrl = (item) => {
    if (item?.image && /^https?:\/\//i.test(item.image)) return item.image;
    if (item?.image_url && /^https?:\/\//i.test(item.image_url))
      return item.image_url;

    const storageBase = item?.product?.image_url || item?.image_url || "";
    const imgRel =
      item?.product?.images?.[0]?.imgurl || item?.imgurl || item?.image || "";

    if (!storageBase || !imgRel) return "";
    const base = storageBase.replace(/\/+$/, "");
    const rel = imgRel.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // -------- Auth & User Data Fetching --------
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          if (isMounted) {
            setUser(null);
            setIsInitialLoad(false);
          }
          return;
        }

        const response = await api.get("/auth/user");
        if (isMounted && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        if (isMounted) {
          setUser(null);
          // Don't clear token here - let parent handle it
          if (err.response?.status === 401) {
            // Dispatch event for auth failure
            window.dispatchEvent(new CustomEvent('auth-failed'));
          }
        }
      } finally {
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }
    };

    if (isInitialLoad) {
      fetchUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [isInitialLoad]);

  // Address Data Fetching
  const fetchUserAddresses = async () => {
    try {
      const response = await api.get("/address");
      if (response.data.status === 200) {
        setUserAddresses(response.data.data);
      } else {
        setAddressError(response.data.message || "Failed to fetch addresses");
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message);
    }
  };

  // Notification Data Fetching
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setNotificationError(null);
      } else {
        throw new Error(response.data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      setNotificationError(err.response?.data?.message || err.message);
    }
  };

  // Unread Count Fetching
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      const unread = notifications.filter((n) => n.status === "unread").length;
      setUnreadCount(unread);
    }
  };

  // Mark Notification as Read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`, {});
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.notification_id === notificationId
              ? { ...notification, status: "read", read_at: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark All Notifications as Read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await api.put("/notifications/read-all", {});
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            status: "read",
            read_at: notification.read_at || new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete Notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.notification_id !== notificationId)
        );
        const unread = notifications.filter((n) => n.status === "unread").length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Clear All Notifications
  const clearAllNotifications = async () => {
    try {
      const response = await api.delete("/notifications");
      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    }
  };

  // Handle notifications update from child component
  const handleNotificationsUpdate = (updatedNotifications) => {
    setNotifications(updatedNotifications);
    const unread = updatedNotifications.filter((n) => n.status === "unread").length;
    setUnreadCount(unread);
  };

  // Order Data Fetching
  const fetchUserOrders = async () => {
    try {
      const response = await api.get("/user/orders");
      if (response.data.status === 200) {
        const formattedOrders = response.data.data.map(formatOrder);
        setOrders(formattedOrders);
        const unpaid = formattedOrders.filter(
          (order) => order.status !== "paid" && order.status !== "Completed"
        );
        setUnpaidOrders(unpaid);
        return formattedOrders;
      }
      return [];
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-failed'));
      }
      return [];
    }
  };

  // Order Cancellation Data Fetching
  const fetchCancellations = async () => {
    try {
      const response = await api.get("/orders/cancellations");
      if (response.data.success) {
        setCancellations(response.data.data);
      }
    } catch (err) {
      setCancellationError(err.response?.data?.message || err.message);
    }
  };

  // Refund Data Fetching
  const fetchWalletData = async () => {
    try {
      const response = await api.get("/orders/cancellations?status=refunded");
      if (response.data.success) {
        const walletTransactions = response.data.data.map((cancellation) => ({
          id: cancellation.cancellation_id,
          date: cancellation.processed_at || cancellation.requested_at,
          amount: parseFloat(cancellation.refund_amount) || parseFloat(cancellation.order_total) || 0,
          type: "refund",
          remark: `Refund for order ${cancellation.order_id} - ${cancellation.reason}`,
          status: "completed",
          created_at: cancellation.processed_at || cancellation.requested_at,
        }));
        setWalletData(walletTransactions);
      } else {
        setWalletError(response.data.message || "Failed to fetch wallet data");
      }
    } catch (err) {
      setWalletError(err.response?.data?.message || err.message);
    }
  };

  // Initial data fetch - only runs once when user is loaded
  useEffect(() => {
    if (!user || dataFetched) return;

    const fetchAllData = async () => {
      await Promise.all([
        fetchUserOrders(),
        fetchCancellations(),
        fetchWalletData(),
        fetchUserAddresses(),
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      setDataFetched(true);
    };

    fetchAllData();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
    };
  }, [user, dataFetched]);

  // Payment redirect helpers
  const redirectToPaymentBySummary = async (orderId) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        Swal.fire({
          title: "Authentication Required",
          text: "Please log in to proceed with payment",
          icon: "warning",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      const { data } = await api.get(`/orders/${orderId}/summary`);
      if (!data?.success || !data?.order_summary) {
        throw new Error("Unable to load order summary");
      }

      const s = data.order_summary;
      const amount = parseFloat(s.total_amount || "0") || 0;

      const pendingOrder = {
        orderId: s.order_id,
        amount,
        currency: "AUD",
        payment_method: (s.payment_method || "stripe").toLowerCase(),
        payment_status: s.payment_status,
        items: (s.items || []).map((it) => ({
          id: it.product_id,
          name: it.product_name || it.name,
          price: parseFloat(it.unit_price || it.ord_price || "0") || 0,
          quantity: parseInt(it.quantity || it.ord_quantity || "1", 10) || 1,
          image_url: getItemImageUrl(it),
        })),
        shippingAddress: s.shipping_address?.address || "",
        suburb: s.shipping_address?.suburb || "",
        state: s.shipping_address?.state || "",
        postcode: String(s.shipping_address?.postcode || ""),
        user_id: s.user_details?.user_id || user?.user?.id,
        user_email: s.user_details?.email || user?.user?.email,
        created_at: s.order_date,
        source: "unpaid_orders_redirect",
      };

      localStorage.setItem("pending_order", JSON.stringify(pendingOrder));
      navigate("/payform", { state: { amount, orderId: s.order_id } });
    } catch (err) {
      Swal.fire({
        title: "Unable to start payment",
        text: err.response?.data?.message || err.message || "Something went wrong while preparing your payment.",
        icon: "error",
        confirmButtonColor: "#0d6efd",
      });
    }
  };

  const redirectToPayment = (order) => {
    if (!user) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to proceed with payment",
        icon: "warning",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const pendingOrder = {
      orderId: order.id,
      amount: order.amount,
      currency: "AUD",
      items: (order.fullData?.items || []).map((it) => ({
        ...it,
        image_url: getItemImageUrl(it),
      })) || [],
      shippingAddress: order.fullData?.shippingaddress || "",
      user_id: user.user.id,
      user_email: user.user.email,
      created_at: new Date().toISOString(),
      source: "orders_table_click",
    };

    localStorage.setItem("pending_order", JSON.stringify(pendingOrder));
    navigate("/payform");
  };

  // Order detail modal & helpers
  const handleOrderClick = (order) => {
    if (order.status !== "paid" && order.status !== "Completed") {
      return redirectToPaymentBySummary(order.id);
    }
    setSelectedOrder(order);
    setShowOrderModal(true);
    setSelectedReason("");
    setCustomReason("");
  };

  const handleCancelOrder = async () => {
    if (!selectedReason) {
      Swal.fire({
        title: "Reason Required",
        text: "Please select a reason for cancellation",
        icon: "warning",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    try {
      const finalReason = selectedReason === "Other" && customReason ? customReason : selectedReason;
      const response = await api.post("/orders/cancel/request", {
        order_id: selectedOrder.id,
        reason: finalReason,
      });

      if (response?.data?.success) {
        setShowOrderModal(false);
        setSelectedReason("");
        setCustomReason("");

        let timerInterval;
        Swal.fire({
          title: "Success!",
          html: `Your cancellation request has been submitted.<br><br>Closing in <b></b> ms.`,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: false,
          showDenyButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            const actions = Swal.getActions();
            if (actions) actions.style.display = "none";
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) confirmBtn.style.display = "none";
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
              timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        });
        setTimeout(() => Swal.close(), 2000);
        await Promise.all([fetchCancellations(), fetchUserOrders()]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to process cancellation";
      if (msg.toLowerCase().includes("already has an active cancellation request")) {
        setShowOrderModal(false);
        let timerInterval;
        Swal.fire({
          title: "Already Requested",
          html: `This order already has an active cancellation request.<br><br>Closing in <b></b> ms.`,
          icon: "info",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: false,
          showDenyButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            const actions = Swal.getActions();
            if (actions) actions.style.display = "none";
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) confirmBtn.style.display = "none";
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
              timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        });
        setTimeout(() => Swal.close(), 2000);
        return;
      }
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        confirmButtonColor: "#0d6efd",
        confirmButtonText: "OK",
      });
    }
  };

  const confirmCancellation = () => {
    if (!selectedReason) {
      Swal.fire({
        title: "Reason Required",
        text: "Please select a reason for cancellation",
        icon: "warning",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const hasPendingCancellation = cancellations.some(
      (c) => c.order_id === selectedOrder.id && c.status === "pending"
    );

    if (hasPendingCancellation) {
      let timerInterval;
      Swal.fire({
        title: "Cancellation Already Pending",
        html: `<div class="text-center"><i class="bi bi-info-circle-fill text-info fs-1 mb-3"></i><p class="mb-2">This order already has a pending cancellation request.</p><p class="mb-0">Closing in <b></b> seconds.</p></div>`,
        icon: "info",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            const secondsLeft = (Swal.getTimerLeft() / 1000).toFixed(1);
            timer.textContent = secondsLeft;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      });
      return;
    }

    Swal.fire({
      title: "Confirm Cancellation",
      html: `Are you sure you want to cancel order <strong>#${selectedOrder?.id}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Yes, cancel order",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
      showClass: {
        popup: `animate__animated animate__fadeInUp animate__faster`,
      },
      hideClass: {
        popup: `animate__animated animate__fadeOutDown animate__faster`,
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleCancelOrder();
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "bg-warning";
      case "refunded": return "bg-success";
      case "rejected": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  const getWalletStatusBadgeClass = (status) => {
    switch (status) {
      case "completed": case "success": return "bg-success";
      case "pending": return "bg-warning";
      case "failed": case "rejected": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  // Invoice Function
  const fetchInvoice = async (orderId) => {
    try {
      setLoadingInvoice(true);
      setInvoiceError(null);
      const response = await api.get(`/invoice/${orderId}`);
      if (response.data.success) {
        setInvoiceData(response.data.data);
        setShowInvoiceModal(true);
      } else {
        throw new Error(response.data.message || "Failed to fetch invoice");
      }
    } catch (err) {
      setInvoiceError(err.response?.data?.message || err.message);
      Swal.fire({
        title: "Error",
        text: "Failed to load invoice. Please try again.",
        icon: "error",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Manual refresh function
  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchUserOrders(),
        fetchCancellations(),
        fetchWalletData(),
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      setLastUpdate(new Date());
      Swal.fire({
        title: "Refreshed!",
        text: "All data has been updated.",
        icon: "success",
        confirmButtonColor: "#0d6efd",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const performLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await api.post("/auth/logout", {});
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
      localStorage.clear();
      sessionStorage.clear();
      if (handleLogout) handleLogout();
      navigate("/login", { replace: true });
    }
  };

  const confirmLogout = () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, log out!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          performLogout();
          let timerInterval;
          Swal.fire({
            title: "Logged Out!",
            html: "You have been successfully logged out.<br>Closing in <b></b> seconds.",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {
                timer.textContent = `${(Swal.getTimerLeft() / 2000).toFixed(1)}`;
              }, 2000);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          let timerInterval;
          Swal.fire({
            title: "Cancelled",
            html: "You are still logged in <br>Closing in <b></b> seconds.",
            icon: "info",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {
                timer.textContent = `${(Swal.getTimerLeft() / 1000).toFixed(1)}`;
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          });
        }
      });
  };

  // Content Renderer
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <UserTab
            user={user}
            orders={orders}
            addresses={userAddresses}
            notifications={notifications}
            onTabChange={handleTabChange}
          />
        );
      case "addresses":
        return <AddressTab user={user} userAddresses={userAddresses} onAddressesUpdate={setUserAddresses} />;
      case "wallet":
        return (
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center py-3">
              <h4 className="fw-bold heading m-0">My Wallet</h4>
              <button className="btn btn-outline-primary btn-sm rounded-0" onClick={refreshAllData}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
            {walletError ? (
              <div className="alert alert-danger">{walletError}</div>
            ) : walletData.length === 0 ? (
              <div className="alert alert-info">You don't have any wallet transactions yet.</div>
            ) : (
              <div className="row">
                {walletData.map((transaction, index) => (
                  <div key={index} className="col-md-12 mb-4">
                    <div className="card h-100 bg-white rounded-0">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <div><span className="text-muted small">{new Date(transaction.date).toLocaleDateString()}</span></div>
                        <div><span className={`badge ${getWalletStatusBadgeClass(transaction.status)} text-white text-capitalize rounded-0`}>{transaction.status}</span></div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-8">
                            <h6 className="fw-bold">${transaction.amount.toFixed(2)}</h6>
                            <p className="text-muted small mb-2 text-capitalize">{transaction.type}</p>
                            <p className="mb-0">{transaction.remark || "N/A"}</p>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex flex-column gap-2">
                              <p className="mb-0 text-muted small">Transaction ID: {transaction.id}</p>
                              <p className="mb-0 text-muted small">Processed: {new Date(transaction.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer bg-white d-flex justify-content-between">
                        <div className="d-flex gap-3">
                          <p className="text-muted small mb-0">Amount: ${transaction.amount.toFixed(2)}</p>
                          <p className="text-muted small mb-0">Type: {transaction.type}</p>
                        </div>
                        <p className="text-muted small mb-0">Date: {new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "orders":
        return (
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center py-3">
              <h4 className="fw-bold heading m-0">My Orders</h4>
              <button className="btn btn-outline-primary btn-sm rounded-0" onClick={refreshAllData}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : orders.length === 0 ? (
              <div className="alert alert-info">You haven't placed any orders yet.</div>
            ) : (
              <div>
                {orders.map((order) => (
                  <RenderOrderCard
                    key={order.id}
                    order={order}
                    user={user}
                    getItemImageUrl={getItemImageUrl}
                    formatDate={formatDate}
                    redirectToPaymentBySummary={redirectToPaymentBySummary}
                    fetchInvoice={fetchInvoice}
                    handleOrderClick={handleOrderClick}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case "unpaidOrders":
        return (
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center py-3">
              <h4 className="fw-bold heading m-0">Unpaid Orders</h4>
              <button className="btn btn-outline-primary btn-sm rounded-0" onClick={refreshAllData}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : unpaidOrders.length === 0 ? (
              <div className="alert alert-info">You don't have any unpaid orders.</div>
            ) : (
              <div>
                {unpaidOrders.map((order) => (
                  <RenderOrderCard
                    key={order.id}
                    order={order}
                    user={user}
                    getItemImageUrl={getItemImageUrl}
                    formatDate={formatDate}
                    redirectToPaymentBySummary={redirectToPaymentBySummary}
                    fetchInvoice={fetchInvoice}
                    handleOrderClick={handleOrderClick}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case "refund":
        return <RefundTab cancellations={cancellations} cancellationError={cancellationError} formatDate={formatDate} getStatusBadgeClass={getStatusBadgeClass} getItemImageUrl={getItemImageUrl} onRefresh={refreshAllData} />;
      case "reviews":
        return <ReviewTab user={user} orders={orders} fetchUserOrders={fetchUserOrders} getItemImageUrl={getItemImageUrl} />;
      case "approvedReviews":
        return <ApprovedReviewsTab user={user} formatDate={formatDate} onRefresh={refreshAllData} />;
      case "notifications":
        return <NotificationTab notifications={notifications} formatDate={formatDate} onMarkAsRead={markNotificationAsRead} onMarkAllAsRead={markAllNotificationsAsRead} onDeleteNotification={deleteNotification} onClearAllNotifications={clearAllNotifications} onNotificationsUpdate={handleNotificationsUpdate} error={notificationError} onRefresh={refreshAllData} user={user} getItemImageUrl={getItemImageUrl} fetchUserOrders={fetchUserOrders} fetchCancellations={fetchCancellations} orders={orders} />;
      default:
        return <p className="text-muted small">Please select a tab.</p>;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show loading spinner while initial load is in progress
  if (isInitialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If no user after loading, don't render dashboard content
  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Profile Dashboard | TechStore </title>
        <meta name="description" content="TECHSTORE is a premier Australian security company specializing in Electronic Security, Home Automation, Audio Visual, Data Cabling, and Ducted Vacuum systems. ASIAL accredited with 20+ years of experience delivering integrated, hassle-free solutions." />
        <meta name="keywords" content="TECHSTORE, TechStore Alarm System, security companies Australia, electronic security Sydney, home automation Australia, audio visual installation, data cabling contractors, ducted vacuum systems, ASIAL Silver Member, security license holders, integrated security solutions, Dynalite certified, commercial security, residential automation, access control, CCTV installation Australia" />
        <meta name="author" content="TECHSTORE  Australia" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://TechStorealarm.com.au/shop/dashboard" />
        <meta property="og:title" content="TECHSTORE  | Electronic Security & Automation Experts" />
        <meta property="og:description" content="Since 2008, TECHSTORE has delivered premium integrated solutions including security, automation, and AV. Fully licensed (Master License No: 000101930) and ASIAL accredited." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://TechStorealarm.com.au/shop/dashboard" />
        <meta property="og:site_name" content="TECHSTORE " />
        <meta property="og:see_also" content="https://www.instagram.com/TechStorealarm/" />
        <meta property="og:see_also" content="https://www.facebook.com/p/TechStore-alarms-100071267801808/" />
        <meta property="fb:app_id" content="#" />
        <meta property="fb:admins" content="https://www.facebook.com/p/TechStore-alarms-100071267801808/" />
        <meta name="instagram:title" content="TECHSTORE  Australia" />
        <meta name="instagram:description" content="Integrated solutions in electronic security, automation, audio visual and data cabling. Trusted Australian security specialists since 2008." />
        <meta name="instagram:site" content="@TechStorealarm" />
      </Helmet>

      <PageHeader title="My Account" path="Home / Dashboard" />

      <div className="container py-5" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        <div className="row g-4 text-start">
          {/* Left Column: Sidebar Navigation */}
          <div className="col-md-3">
            <div className="bg-white border rounded-3 shadow-sm overflow-hidden mb-4 mb-md-0">
              {/* User Profiling Card header */}
              <div className="d-flex align-items-center p-3 gap-3 border-bottom bg-light">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: "48px", height: "48px", fontSize: "18px", overflow: "hidden" }}
                >
                  {user?.user ? (
                    <span>{user.user.firstname?.charAt(0).toUpperCase() || "U"}</span>
                  ) : (
                    <div className="spinner-border spinner-border-sm text-white" role="status"></div>
                  )}
                </div>
                <div className="overflow-hidden">
                  {user?.user ? (
                    <>
                      <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "14px" }} title={`${user.user.firstname} ${user.user.lastname}`}>
                        {user.user.firstname} {user.user.lastname}
                      </p>
                      <p className="mb-0 text-muted small text-truncate" title={user.user.email}>
                        {user.user.email}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-1 bg-light rounded" style={{ width: "120px", height: "14px" }} />
                      <div className="bg-light rounded" style={{ width: "100px", height: "12px" }} />
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar Menu Items */}
              <ul className="list-group list-group-flush d-none d-md-block m-0">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
                  { id: "notifications", label: "Notifications", icon: "bi-bell", badge: unreadCount },
                  { id: "orders", label: "My Orders", icon: "bi-bag-check" },
                  { id: "unpaidOrders", label: "Unpaid Orders", icon: "bi-bag-x" },
                  { id: "refund", label: "Refund History", icon: "bi-clock-history" },
                  { id: "addresses", label: "Addresses", icon: "bi-geo-alt" },
                  { id: "approvedReviews", label: "My Reviews", icon: "bi-star" },
                  { id: "reviews", label: "To Be Reviewed", icon: "bi-chat-left-text" },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li
                      key={item.id}
                      className={`list-group-item border-0 py-3 px-4 d-flex align-items-center justify-content-between cursor-pointer fw-semibold text-muted ${isActive ? "bg-light text-primary border-start border-4 border-primary" : "hover-bg-light"
                        }`}
                      onClick={() => handleTabChange(item.id)}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <i className={`bi ${item.icon} fs-5 ${isActive ? "text-primary" : "text-secondary"}`}></i>
                        <span style={{ fontSize: "14px" }} className={isActive ? "text-primary fw-bold" : "text-dark"}>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="badge bg-danger rounded-pill px-2.5 py-1 small">{item.badge}</span>
                      )}
                    </li>
                  );
                })}

                {/* Logout Button */}
                <li
                  className="list-group-item border-0 py-3 px-4 d-flex align-items-center gap-3 text-danger fw-semibold cursor-pointer hover-bg-light"
                  onClick={confirmLogout}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                >
                  <i className="bi bi-box-arrow-right fs-5"></i>
                  <span style={{ fontSize: "14px" }}>Logout</span>
                </li>
              </ul>

              {/* Mobile Tabs Grid */}
              <div className="d-md-none p-2 bg-light border-top">
                <div className="row row-cols-3 g-2 text-center">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
                    { id: "orders", label: "Orders", icon: "bi-bag-check" },
                    { id: "unpaidOrders", label: "Unpaid", icon: "bi-bag-x" },
                    { id: "refund", label: "Refunds", icon: "bi-clock-history" },
                    { id: "addresses", label: "Addresses", icon: "bi-geo-alt" },
                    { id: "notifications", label: "Alerts", icon: "bi-bell", badge: unreadCount },
                    { id: "approvedReviews", label: "Reviews", icon: "bi-star" },
                    { id: "reviews", label: "Write", icon: "bi-chat-left-text" },
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <div className="col" key={item.id}>
                        <div
                          className={`p-2 border rounded-3 bg-white position-relative hover-lift cursor-pointer ${isActive ? "border-primary text-primary fw-bold" : "text-muted"
                            }`}
                          onClick={() => handleTabChange(item.id)}
                        >
                          <i className={`bi ${item.icon} fs-4 d-block ${isActive ? "text-primary" : "text-secondary"}`}></i>
                          <span className="small d-block mt-1" style={{ fontSize: "11px" }}>{item.label}</span>
                          {item.badge > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ zIndex: 5 }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="col">
                    <div className="p-2 border rounded-3 bg-white text-danger hover-lift cursor-pointer" onClick={confirmLogout}>
                      <i className="bi bi-box-arrow-right fs-4 d-block"></i>
                      <span className="small d-block mt-1" style={{ fontSize: "11px" }}>Logout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content Panel */}
          <div className="col-md-9">
            <div className="bg-white border rounded-3 shadow-sm p-4 h-100" ref={contentRef} style={{ minHeight: "450px" }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <OrderDetailsModal
          showOrderModal={showOrderModal}
          setShowOrderModal={setShowOrderModal}
          selectedOrder={selectedOrder}
          user={user}
          getItemImageUrl={getItemImageUrl}
          fetchUserOrders={fetchUserOrders}
          fetchCancellations={fetchCancellations}
        />
      )}

      {showInvoiceModal && (
        <InvoiceTemplate
          invoiceData={invoiceData}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceData(null);
          }}
        />
      )}
    </>
  );
};

export default Dashboard;