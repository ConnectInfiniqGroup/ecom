import React, { useRef } from "react";
import { Container, Table } from "react-bootstrap";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
// import Logo from "../Assets/Images/image.jpeg";
import PageHeader from "../Components/PageHeader";

const InvoicePage = () => {
  const invoiceRef = useRef();

  const invoiceData = {
    issueDate: "20 March, 2026",
    dueDate: "27 March, 2026",
    invoiceNo: "AD908452",
    email: "user@gmail.com",
    paymentMethod: "Stripe Secure Card Payment",
    company: {
      name: "TechStore  Australia",
      address: "15/51 Meacher Street, Mt. Druitt 2770, NSW",
      support: "info@TechStoregroup.biz",
    },
    client: {
      name: "John Doe",
      email: "user@gmail.com",
      phone: "+61 433 172 345",
      billingAddress: "2644 Tail Ends Road, Oradell, New Jersey, 07649",
      shippingAddress: "2644 Tail Ends Road, Oradell, New Jersey, 07649",
    },
    items: [
      { id: 1, description: "CCTV Camera Surveillance Installation", price: 12000, quantity: 1, total: 12000 },
      { id: 2, description: "Electronic Intruder Alarm Sensor Kit", price: 8500, quantity: 2, total: 17000 },
      { id: 3, description: "Smart Home Automation Hub Integration", price: 15400, quantity: 1, total: 15400 },
      { id: 4, description: "High Grade Structured Data Cabling", price: 4500, quantity: 3, total: 13500 },
    ],
  };

  const grandTotal = invoiceData.items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const taxRate = 0.10; // 10% GST
  const gstAmount = grandTotal * taxRate;
  const subTotal = grandTotal - gstAmount;

  // Function to generate and download PDF
  const downloadPDF = () => {
    const input = invoiceRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save(`invoice_${invoiceData.invoiceNo}.pdf`);
    });
  };

  return (
    <>
      <PageHeader title="Invoice Details" path="Home / Shop / Checkout / Invoice" />

      <Container className="py-5 text-start" style={{ backgroundColor: "var(--bg-secondary)", minHeight: "100vh" }}>
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-11">
            {/* Invoice Printable Section */}
            <div
              ref={invoiceRef}
              id="invoice-section"
              className="bg-white border rounded-3 p-5 shadow-sm mb-4"
              style={{ minHeight: "842px" }}
            >
              {/* Invoice Header */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-bottom pb-4 mb-4">
                <div className="mb-3 mb-sm-0">
                  <img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "100px", objectFit: "contain" }} />
                  <p className="text-secondary small mt-2 mb-0 fw-semibold">
                    {invoiceData.company.name}
                  </p>
                </div>
                <div className="text-sm-end">
                  <h3 className="fw-bold heading text-primary mb-1">INVOICE</h3>
                  <span className="badge-TechStore-red fs-6 py-1 px-3 mb-2 d-inline-block">
                    {invoiceData.invoiceNo}
                  </span>
                  <p className="text-muted small mb-0">
                    <strong>Issue Date:</strong> {invoiceData.issueDate}
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Due Date:</strong> {invoiceData.dueDate}
                  </p>
                </div>
              </div>

              {/* Column Summary Cards */}
              <div className="row g-4 mb-5">
                {/* Billing Details */}
                <div className="col-md-4">
                  <div className="p-3 bg-light border rounded-3 h-100">
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                      <i className="bi bi-receipt me-2 text-danger"></i>Billing Details
                    </h6>
                    <p className="fw-bold small text-primary mb-1">{invoiceData.client.name}</p>
                    <p className="text-muted small mb-1">{invoiceData.client.phone}</p>
                    <p className="text-muted small mb-1">{invoiceData.client.email}</p>
                    <p className="text-secondary small mb-0" style={{ lineHeight: "1.4" }}>
                      {invoiceData.client.billingAddress}
                    </p>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="col-md-4">
                  <div className="p-3 bg-light border rounded-3 h-100">
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                      <i className="bi bi-truck me-2 text-danger"></i>Shipping Details
                    </h6>
                    <p className="fw-bold small text-primary mb-1">{invoiceData.client.name}</p>
                    <p className="text-secondary small mb-0" style={{ lineHeight: "1.4" }}>
                      {invoiceData.client.shippingAddress}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="col-md-4">
                  <div className="p-3 bg-light border rounded-3 h-100">
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                      <i className="bi bi-credit-card me-2 text-danger"></i>Payment Method
                    </h6>
                    <span className="badge-TechStore-green mb-2 d-inline-block">Paid Securely</span>
                    <p className="text-secondary small mb-1 font-semibold">{invoiceData.paymentMethod}</p>
                    <p className="text-muted small mb-0">
                      <strong>Support Email:</strong> <br />
                      <a href={`mailto:${invoiceData.company.support}`} className="text-decoration-none">
                        {invoiceData.company.support}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-4">
                <h5 className="fw-bold heading text-dark mb-3">Order Items</h5>
                <div className="table-responsive">
                  <Table className="table border">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Item #</th>
                        <th>Product / Service Description</th>
                        <th className="text-end" style={{ width: "120px" }}>Unit Price</th>
                        <th className="text-center" style={{ width: "80px" }}>Qty</th>
                        <th className="text-end" style={{ width: "130px" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td className="fw-semibold text-dark">{item.description}</td>
                          <td className="text-end text-secondary">₹{item.price.toLocaleString("en-IN")}</td>
                          <td className="text-center text-secondary">{item.quantity}</td>
                          <td className="text-end fw-bold text-dark">₹{item.total.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Invoice Calculations */}
              <div className="row justify-content-end mt-4">
                <div className="col-md-5">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-secondary small font-medium">Subtotal:</span>
                    <span className="text-dark fw-bold small">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-secondary small font-medium">GST (10%):</span>
                    <span className="text-dark fw-bold small">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between py-3">
                    <h5 className="fw-bold text-dark mb-0">Grand Total:</h5>
                    <h4 className="fw-bold text-danger mb-0">₹{grandTotal.toLocaleString("en-IN")}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Action Triggers */}
            <div className="d-flex flex-wrap gap-3 justify-content-end mb-5">
              <button
                className="btn btn-outline-primary shadow-sm"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i> Print Invoice
              </button>
              <button
                className="btn btn-primary shadow-sm"
                onClick={downloadPDF}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i> Export as PDF
              </button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default InvoicePage;
