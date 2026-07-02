import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import FallbackImage from "./FallbackImage"; // Adjust the import path as needed

const RenderOrderCard = ({
  order,
  getItemImageUrl,
  formatDate,
  redirectToPaymentBySummary,
  fetchInvoice,
  handleOrderClick,
}) => {
  const navigate = useNavigate();

  const paymentStatus = (order?.status ?? "").toString().trim().toLowerCase();
  const isPaid = paymentStatus === "paid" || paymentStatus === "completed";
  const paymentBadgeClass = isPaid ? "bg-success" : "bg-warning";
  const paymentBadgeLabel = order?.status || (isPaid ? "Paid" : "Unpaid");

  const pick = (v) => (v == null ? "" : String(v)).trim();
  const shipRaw =
    [
      order?.orderstatus,
      order?.orderStatus,
      order?.order_status,
      order?.fullData?.orderstatus,
      order?.fullData?.orderStatus,
      order?.fullData?.order_status,
      order?.fullData?.shipping_status,
      order?.fullData?.shipment_status,
      order?.fullData?.fulfillment_status,
      order?.fullData?.delivery_status,
      order?.fullData?.status_text,
    ]
      .map(pick)
      .find(Boolean) || "";

  const shipKey = shipRaw.toLowerCase();

  let orderBadgeClass = "bg-secondary";
  if (shipKey === "delivered" || shipKey === "delivery completed")
    orderBadgeClass = "bg-success";
  else if (shipKey === "processing" || shipKey === "pending")
    orderBadgeClass = "bg-warning text-dark";
  else if (shipKey.includes("shipped") || shipKey.includes("ship"))
    orderBadgeClass = "bg-info text-dark";
  else if (
    shipKey.includes("cancelled") ||
    shipKey.includes("canceled") ||
    shipKey.includes("cancelled")
  )
    orderBadgeClass = "bg-danger";

  const orderBadgeLabel = shipRaw
    ? shipRaw[0].toUpperCase() + shipRaw.slice(1)
    : "N/A";

  const isUnpaid = !isPaid;
  const isProcessing = shipKey === "processing" || shipKey === "pending";
  const isShipped = shipKey.includes("shipped") || shipKey.includes("ship");
  const isCancelled =
    shipKey.includes("cancelled") ||
    shipKey.includes("canceled") ||
    shipKey.includes("cancelled");

  const handleBuyAgain = async (order) => {
    try {
      const firstItem = order?.fullData?.items?.[0];
      if (!firstItem) {
        Swal.fire({
          title: "Error",
          text: "No items found in this order",
          icon: "error",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      // Use the base URL from the API config for absolute URL conversion
      const baseUrl = "";
      const toAbsoluteUrl = (url) => {
        if (!url) return "";
        const s = String(url);
        if (s.startsWith("http") || s.startsWith("//")) return s;
        return `${baseUrl}/${s.replace(/^\/+/, "")}`;
      };

      let imageUrl =
        getItemImageUrl(firstItem) ||
        firstItem?.image_url ||
        firstItem?.image ||
        firstItem?.product?.image_url ||
        firstItem?.product?.image ||
        "";

      imageUrl = toAbsoluteUrl(imageUrl);

      const name =
        firstItem?.name ||
        firstItem?.product_name ||
        firstItem?.product?.productname ||
        `Product from order ${order?.id ?? ""}`;

      const priceRaw =
        firstItem?.ord_price ??
        firstItem?.unit_price ??
        firstItem?.price ??
        "0";
      const pro_price = Number(priceRaw) || 0;

      const qtyRaw = firstItem?.ord_quantity ?? firstItem?.quantity ?? "1";
      const pro_quantity = Math.max(1, parseInt(qtyRaw, 10) || 1);

      const buyNowItem = {
        product_id: firstItem?.product_id || firstItem?.id,
        backend_product_id: firstItem?.product_id || null,
        productname: name,
        pro_price,
        pro_quantity,
        size: firstItem?.size || firstItem?.variant?.size || "M",
        color: firstItem?.color || firstItem?.variant?.color || "",
        image: imageUrl,
        image_url: imageUrl,
        imgurl: imageUrl,
        images: imageUrl
          ? [{ imgurl: imageUrl, image_url: imageUrl, image: imageUrl }]
          : [],
        variant: firstItem?.variant || firstItem?.attributes || {},
        order_source: "buy_again",
        _originalItem: firstItem,
      };

      localStorage.setItem("buy_now_item", JSON.stringify(buyNowItem));

      navigate("/checkout", {
        state: { buyNow: true, fromOrder: order?.id },
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to process Buy Again. Please try again.",
        icon: "error",
        confirmButtonColor: "#0d6efd",
      });
    }
  };

  // Helper function to get the absolute image URL
  const getAbsoluteImageUrl = (item) => {
    const baseUrl = "";
    const toAbsoluteUrl = (url) => {
      if (!url) return "";
      const s = String(url);
      if (s.startsWith("http") || s.startsWith("//")) return s;
      return `${baseUrl}/${s.replace(/^\/+/, "")}`;
    };

    let imageUrl =
      getItemImageUrl(item) ||
      item?.image_url ||
      item?.image ||
      item?.product?.image_url ||
      item?.product?.image ||
      "";

    return toAbsoluteUrl(imageUrl);
  };

  return (
    <div key={order.id} className="card mb-4 border rounded-0">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
          <span className="text-muted small">
            Ordered on {formatDate(order.date)}
          </span>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <span className={`badge ${paymentBadgeClass} rounded-0`}>
            {paymentBadgeLabel}
          </span>
          <span className={`badge rounded-0 ms-2 ${orderBadgeClass}`}>
            {orderBadgeLabel}
          </span>
        </div>
      </div>

      <div className="card-body row">
        <div className="col-md-8 d-flex flex-wrap gap-3">
          {order?.fullData?.items?.length ? (
            order.fullData.items.map((item, index) => {
              const imageUrl = getAbsoluteImageUrl(item);
              const name =
                item?.name ||
                item?.product_name ||
                item?.product?.productname ||
                `Product ${index + 1}`;

              return (
                <div key={index} className="d-flex align-items-center mb-2">
                  <div
                    className="me-3 border"
                    style={{ width: 100, height: 100 }}
                  >
                    <FallbackImage
                      src={imageUrl}
                      alt={name}
                      className="img-fluid"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">No items found for this order</p>
          )}
        </div>

        <div className="col-md-4 d-flex flex-column gap-2">
          {!isCancelled && isUnpaid ? (
            <button
              className="btn btn-primary btn-sm rounded-0"
              onClick={() => redirectToPaymentBySummary(order.id)}
            >
              Pay Now
            </button>
          ) : !isCancelled && isProcessing ? (
            <>
              {/* NO Track button for processing orders */}
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => handleBuyAgain(order)}
              >
                Buy this again
              </button>
            </>
          ) : !isCancelled && isShipped ? (
            <>
              {/* Track button ONLY for shipped orders */}
              <a
                href={
                  order?.fullData?.tracking_number
                    ? `https://auspost.com.au/mypost/track/details/${order.fullData.tracking_number}`
                    : "#"
                }
                className="btn btn-primary btn-sm rounded-0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!order?.fullData?.tracking_number) {
                    e.preventDefault();
                    Swal.fire({
                      title: "No Tracking Number",
                      text: "Tracking information is not yet available for this order.",
                      icon: "info",
                      confirmButtonColor: "#0d6efd",
                    });
                  }
                }}
              >
                Track
              </a>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => fetchInvoice(order.id)}
              >
                View Receipt
              </button>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => handleBuyAgain(order)}
              >
                Buy this again
              </button>
            </>
          ) : !isCancelled ? (
            <>
              {/* Track button for delivered/completed orders */}
              <a
                href={
                  order?.fullData?.tracking_number
                    ? `https://auspost.com.au/mypost/track/details/${order.fullData.tracking_number}`
                    : "#"
                }
                className="btn btn-primary btn-sm rounded-0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!order?.fullData?.tracking_number) {
                    e.preventDefault();
                    Swal.fire({
                      title: "No Tracking Number",
                      text: "Tracking information is not yet available for this order.",
                      icon: "info",
                      confirmButtonColor: "#0d6efd",
                    });
                  }
                }}
              >
                Track
              </a>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => fetchInvoice(order.id)}
              >
                View Invoice
              </button>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => handleOrderClick(order)}
              >
                Leave a review
              </button>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => handleBuyAgain(order)}
              >
                Buy this again
              </button>
            </>
          ) : (
            // For cancelled orders, only show limited options
            <>
              <button
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => handleBuyAgain(order)}
              >
                Buy this again
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card-footer bg-white d-flex justify-content-between">
        <div className="d-flex gap-3 flex-wrap">
          <p className="text-muted small mb-0">
            {order?.fullData?.items?.length ?? 0} items: $
            {(order?.amount ?? 0).toFixed?.(2) ??
              Number(order?.amount || 0).toFixed(2)}
          </p>
          <p className="text-muted small mb-0">Order ID: {order?.id}</p>
          <p className="text-muted small mb-0">
            Order Time: {formatDate(order.date)}
          </p>
        </div>

        <p
          className="text-primary text-decoration-underline small m-0"
          onClick={() => handleOrderClick(order)}
          style={{ cursor: "pointer" }}
        >
          View order details
          <i className="bi bi-chevron-right text-primary ms-1"></i>
        </p>
      </div>
    </div>
  );
};

export default RenderOrderCard;
