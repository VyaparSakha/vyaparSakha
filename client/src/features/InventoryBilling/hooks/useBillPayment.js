import { useState, useCallback } from "react";
import { useBillingContext } from "../context/billingContext";

/**
 * Custom hook for bill processing and payment
 */
export const useBillPayment = () => {
  const billingContext = useBillingContext() || {};
  const {
    processBill,
    calculateTotal = () => 0,
    billedProducts = [],
    showBillPreview: ctxShowBillPreview,
    setShowBillPreview: ctxSetShowBillPreview,
    generatedBill: ctxGeneratedBill,
    setGeneratedBill: ctxSetGeneratedBill,
    closeBillPreview: ctxCloseBillPreview,
  } = billingContext;

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localGeneratedBill, setLocalGeneratedBill] = useState(null);
  const [localShowBillPreview, setLocalShowBillPreview] = useState(false);

  // Use context state if available, otherwise fallback to local state
  const generatedBill = ctxGeneratedBill !== undefined ? ctxGeneratedBill : localGeneratedBill;
  const setGeneratedBill = ctxSetGeneratedBill || setLocalGeneratedBill;
  const showBillPreview = ctxShowBillPreview !== undefined ? ctxShowBillPreview : localShowBillPreview;
  const setShowBillPreview = ctxSetShowBillPreview || setLocalShowBillPreview;

  const handlePayment = useCallback(async () => {
    if (!processBill) return null;
    setIsProcessing(true);
    try {
      const bill = await processBill(paymentMethod);
      if (bill) {
        setGeneratedBill(bill);
        setShowBillPreview(true);
      }
      return bill;
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethod, processBill, setGeneratedBill, setShowBillPreview]);

  const printBill = useCallback(() => {
    if (!generatedBill) return;

    // Create a printable bill
    const printWindow = window.open("", "_blank");
    const billHTML = generateBillHTML(generatedBill);

    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();
  }, [generatedBill]);

  const closeBillPreview = useCallback(() => {
    if (ctxCloseBillPreview) {
      ctxCloseBillPreview();
    } else {
      setShowBillPreview(false);
      setGeneratedBill(null);
    }
  }, [ctxCloseBillPreview, setShowBillPreview, setGeneratedBill]);

  return {
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    handlePayment,
    generatedBill,
    setGeneratedBill,
    showBillPreview,
    setShowBillPreview,
    printBill,
    closeBillPreview,
    totalAmount: calculateTotal(),
    itemCount: billedProducts.length,
  };
};

// Helper function to generate bill HTML
const generateBillHTML = (bill) => {
  const { products, totalAmount, billNumber, billedAt, storeInfo } = bill;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill #${billNumber || "N/A"}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 300px;
          margin: 20px auto;
          padding: 10px;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .bill-info {
          font-size: 11px;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          border-bottom: 1px solid #000;
          padding: 5px 0;
          text-align: left;
          font-size: 11px;
        }
        td {
          padding: 5px 0;
          font-size: 11px;
        }
        .total {
          border-top: 2px dashed #000;
          margin-top: 10px;
          padding-top: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${storeInfo?.name || "Vyapar Sakha"}</div>
        <div class="bill-info">Bill #${billNumber || "N/A"}</div>
        <div class="bill-info">${new Date(billedAt).toLocaleString()}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${products
            ?.map(
              (p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.quantity}</td>
              <td>₹${p.total}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      <div class="total">
        <div>Total: ₹${totalAmount}</div>
      </div>
    </body>
    </html>
  `;
};
