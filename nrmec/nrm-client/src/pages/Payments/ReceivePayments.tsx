import { useState, useEffect } from "react";
import { Receipt, Printer, Download, X } from "lucide-react";
import { useLocation } from 'react-router-dom';
import nrmLogo from "../../assets/logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useGetPaymentsQuery } from "../../store/api/payments_api";
import PaymentReceipt from "./PaymentReceipt";
import RecordPayment from "../../components/payments/RecordPayment";

// Helper function for formatting and receipt generation
const formatElectionType = (type: string) => {
  const mappings: { [key: string]: string } = {
    nationalElectionType: "National Election",
    districtElectionType: "District Election",
    constituencyMunicipalityElectionType: "Constituency/Municipality Election",
    subcountiesDivisionsElectionType: "Subcounty/Division Election",
    parishwardElectionType: "Parish Ward Election",
    villageCellElectionType: "Village/Cell Election",
  };
  return mappings[type] || type;
};

const handlePrint = (payment: any) => {
  const receiptWindow = window.open("", "_blank");
  if (!receiptWindow) return;

  const receiptContent = generateReceiptHTML(payment);
  receiptWindow.document.write(receiptContent);
  receiptWindow.document.close();

  receiptWindow.onload = () => {
    receiptWindow.print();
    receiptWindow.onafterprint = () => receiptWindow.close();
  };
};

const handleDownload = async (payment: any) => {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.visibility = "hidden";
    iframe.style.position = "absolute";
    iframe.style.width = "8.5in";
    iframe.style.height = "11in";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(generateReceiptHTML(payment));
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0,
      });

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      pdf.save(`receipt-${payment.receiptNumber}.pdf`);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      document.body.removeChild(iframe);
    }
  }
};

const generateReceiptHTML = (payment: any) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Receipt - ${payment.receiptNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            position: relative;
            min-height: 11in;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .logo-section {
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }
          .logo {
            width: 70px;
            height: auto;
          }
          .org-name {
            display: flex;
            flex-direction: column;
          }
          .org-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          .org-subtitle {
            font-size: 14px;
            margin-top: 4px;
          }
          .contact-info {
            text-align: right;
            font-size: 12px;
            line-height: 1.4;
          }
          .website-line {
            display: flex;
            align-items: center;
            margin: 10px 0 20px;
          }
          .website-line::before,
          .website-line::after {
            content: '';
            flex: 1;
            border-top: 1px solid black;
          }
          .website-link {
            padding: 0 10px;
            color: red;
            text-decoration: none;
          }
          .receipt-content {
            min-height: 8in;
            position: relative;
          }
          .watermark-container {
            position: absolute;
            inset: 0;
            background-image: url("${nrmLogo}");
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            opacity: 0.1;
            pointer-events: none;
          }
          .receipt-title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .receipt-details { 
            position: relative;
            z-index: 2;
            border-top: 1px solid #eee; 
            border-bottom: 1px solid #eee; 
            padding: 20px 0;
          }
          .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
          }
          .label { 
            color: #666; 
            font-size: 14px; 
          }
          .value { 
            font-weight: 600; 
            margin-top: 4px; 
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="logo-section">
            <img src="${nrmLogo}" alt="NRM Logo" class="logo"/>
            <div class="org-name">
              <h1 class="org-title">National Resistance Movement</h1>
              <h2 class="org-subtitle">ELECTORAL COMMISSION</h2>
            </div>
          </div>
          <div class="contact-info">
            <div>Plot 10 Kyadondo Road</div>
            <div>P.O.Box 7778, Kampala (U)</div>
            <div>Tel: +256 346 295, +256 346 279</div>
            <div>email: info@nrmec.org</div>
          </div>
        </div>

        <div class="website-line">
          <hr/>
          <span class="website-link">www.nrm.ug</span>
          <hr/>
        </div>

        <div class="receipt-content">
          <div class="watermark-container"></div>
          
          <div class="receipt-title" style="text-align: center; margin: 30px 0;">
            PAYMENT RECEIPT
          </div>

          <div class="receipt-details">
            <div class="grid">
              <div>
                <div class="label">Receipt Number:</div>
                <div class="value">${payment.receiptNumber}</div>
              </div>
              <div>
                <div class="label">Date:</div>
                <div class="value">${new Date(
                  payment.paymentDate
                ).toLocaleDateString()}</div>
              </div>
            </div>

            <div class="grid">
              <div>
                <div class="label">Candidate Name:</div>
                <div class="value">${payment.candidateName}</div>
              </div>
              <div>
                <div class="label">Election Type:</div>
                <div class="value">${formatElectionType(
                  payment.electionType
                )}</div>
              </div>
            </div>

            ${
              payment.subType
                ? `
            <div class="grid">
              <div>
                <div class="label">Sub Type:</div>
                <div class="value">${
                  payment.subType.charAt(0).toUpperCase() +
                  payment.subType.slice(1)
                }</div>
              </div>
            </div>
            `
                : ""
            }

            ${
              payment.category
                ? `
            <div class="grid">
              <div>
                <div class="label">Category:</div>
                <div class="value">${payment.category}</div>
              </div>
            </div>
            `
                : ""
            }

            ${
              payment.position
                ? `
            <div class="grid">
              <div>
                <div class="label">Position:</div>
                <div class="value">${payment.position}</div>
              </div>
            </div>
            `
                : ""
            }

            <div class="grid">
              <div>
                <div class="label">Amount Paid:</div>
                <div class="value">${Number(
                  payment.amount
                ).toLocaleString()} UGX</div>
              </div>
              <div>
                <div class="label">Payment Method:</div>
                <div class="value">${payment.paymentMethod}</div>
              </div>
            </div>

            ${
              payment.transactionCode
                ? `
            <div class="grid">
              <div>
                <div class="label">Receit Number:</div>
                <div class="value">${payment.transactionCode}</div>
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div style="background: black; padding: 8px; position: fixed; bottom: 40px; left: 40px; right: 40px;">
          <div style="display: flex; justify-content: space-around; color: #FFD700; font-size: 14px;">
            <span>• Patriotism</span>
            <span>• Pan-Africanism</span>
            <span>• Democracy</span>
            <span>• Socio-economic Transformation</span>
          </div>
        </div>
      </body>
    </html>
  `;
};

const ReceivePayments = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { data: payments = [], isLoading: isLoadingPayments, refetch } = useGetPaymentsQuery();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const location = useLocation();
  const { preselectedCandidate } = location.state || {};

  // If a preselectedCandidate is passed, open the payment form automatically
  useEffect(() => {
    if (preselectedCandidate) {
      setShowPaymentForm(true);
    }
  }, [preselectedCandidate]);

  const handlePaymentComplete = () => {
    setShowPaymentForm(false);
    refetch(); // Refresh payments list
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Receive Payments
          </h1>
          <p className="mt-2 text-gray-600">
            Record and manage nomination fee payments
          </p>
        </div>        <button
          onClick={() => setShowPaymentForm(true)}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <Receipt className="h-5 w-5" />
          Record New Payment
        </button>
      </div>      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Record Payment</h2>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <RecordPayment
                preselectedCandidate={preselectedCandidate}
                onClose={() => handlePaymentComplete()}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoadingPayments ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payment records found.</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment, index) => (
                <tr key={payment.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {payment.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {payment.candidateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.positionPath || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {Number(payment.amount).toLocaleString()} UGX
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.transactionCode || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View Receipt"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsReceiptModalOpen(true);
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Print Receipt"
                        onClick={() => handlePrint(payment)}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Download Receipt"
                        onClick={() => handleDownload(payment)}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}      </div>
      
      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment Receipt</h2>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <PaymentReceipt payment={selectedPayment} />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => handlePrint(selectedPayment)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded flex items-center gap-2 hover:bg-gray-300"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => handleDownload(selectedPayment)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded flex items-center gap-2 hover:bg-yellow-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivePayments;
