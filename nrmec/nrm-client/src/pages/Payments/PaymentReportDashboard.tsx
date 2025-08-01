import React, { useState, useMemo } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Search,
  Download,
  Filter,
  DollarSign,
  Users,
  Percent,
  Target,
} from "lucide-react";
import {
  useGetFeesQuery,
  useGetPaymentsQuery,
  useGetNationalsQuery,
  useGetDistrictCandidatesQuery,
  useGetConstituencyMunicipalityCandidatesQuery,
} from "../../store/api/baseApi";

interface PaymentSubmission {
  paymentDate: string | number | Date;
  candidateId: string;
  amount: number;
  paymentMethod: string;
  transactionCode: string;
  electionType: string;
  subType: string;
  category?: string;
  position?: string;
  receiptNumber: string;
  status: "completed" | "pending" | "failed";
  candidateName: string;
  id: string;
}

interface PaymentData {
  electionType: string;
  subType: string;
  category: string;
  position: string;
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  outstandingAmount: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface GroupedData {
  [key: string]: PaymentData;
}
// Enhanced grouping function to handle all payment statuses
const groupByElectionType = (payments: any[], fees: any[]) => {
  const groups = {};

  payments.forEach((payment) => {
    const key = `${payment.electionType}|${payment.subType}|${
      payment.category || ""
    }|${payment.position || ""}`;

    if (!groups[key]) {
      const matchingFee = fees.find(
        (fee) =>
          fee.electionType === payment.electionType &&
          fee.subType === payment.subType &&
          (fee.category || "") === (payment.category || "") &&
          (fee.position || "") === (payment.position || "")
      );

      groups[key] = {
        electionType: payment.electionType,
        subType: payment.subType,
        category: payment.category || "",
        position: payment.position || "",
        expectedAmount: matchingFee ? Number(matchingFee.amount) : 0,
        collectedAmount:
          payment.status === "completed" ? Number(payment.amount) : 0,
        pendingAmount:
          payment.status === "pending" ? Number(payment.amount) : 0,
        failedAmount: payment.status === "failed" ? Number(payment.amount) : 0,
        totalPayments: 1,
        completedPayments: payment.status === "completed" ? 1 : 0,
        pendingPayments: payment.status === "pending" ? 1 : 0,
        failedPayments: payment.status === "failed" ? 1 : 0,
      };
    } else {
      groups[key].collectedAmount +=
        payment.status === "completed" ? Number(payment.amount) : 0;
      groups[key].pendingAmount +=
        payment.status === "pending" ? Number(payment.amount) : 0;
      groups[key].failedAmount +=
        payment.status === "failed" ? Number(payment.amount) : 0;
      groups[key].totalPayments += 1;
      groups[key].completedPayments += payment.status === "completed" ? 1 : 0;
      groups[key].pendingPayments += payment.status === "pending" ? 1 : 0;
      groups[key].failedPayments += payment.status === "failed" ? 1 : 0;
    }
  });

  // Calculate expected amounts based on total candidate count for each category
  Object.keys(groups).forEach((key) => {
    const group = groups[key];
    group.expectedAmount = group.expectedAmount * group.totalPayments;
    group.outstandingAmount = Math.max(
      0,
      group.expectedAmount - group.collectedAmount
    );
  });

  return groups;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const generateExcelReport = (data: any[], stats: any) => {
  // Create worksheet with payment data
  const paymentData = data.map((payment) => ({
    "Receipt Number": payment.receiptNumber,
    Candidate: payment.candidateName,
    "Election Type": formatElectionType(payment.electionType),
    "Sub Type": payment.subType,
    Category: payment.category || "",
    Position: payment.position || "",
    "Amount (UGX)": Number(payment.amount).toLocaleString(),
    "Payment Method": payment.paymentMethod,
    "Payment Date": formatDate(payment.paymentDate),
    Status: payment.status,
    "Transaction Code": payment.transactionCode || "",
  }));

  // Create enhanced summary worksheet
  const summaryData = [
    ["Payment Summary", ""],
    ["Total Collections", `${stats.totalPaid.toLocaleString()} UGX`],
    ["Expected Collections", `${stats.expectedAmount.toLocaleString()} UGX`],
    ["Total Paid Candidates", stats.uniquePayers],
    ["Collection Rate", `${stats.collectionRate.toFixed(1)}%`],
    ["", ""],
    ["Payment Status Breakdown", ""],
    ["Completed Payments", stats.completedPayments],
    ["Pending Payments", stats.pendingPayments],
    ["Failed Payments", stats.failedPayments],
    ["Total Transactions", stats.totalPayments],
  ];

  const wb = XLSX.utils.book_new();

  // Add payments worksheet
  const ws1 = XLSX.utils.json_to_sheet(paymentData);
  XLSX.utils.book_append_sheet(wb, ws1, "Payments");

  // Add summary worksheet
  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data1 = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(
    data1,
    `payment_report_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

const generateCSVReport = (data: any[]) => {
  const csvData = data.map((payment) => ({
    "Receipt Number": payment.receiptNumber,
    Candidate: payment.candidateName,
    "Election Type": formatElectionType(payment.electionType),
    "Sub Type": payment.subType,
    Category: payment.category || "",
    Position: payment.position || "",
    "Amount (UGX)": payment.amount,
    "Payment Method": payment.paymentMethod,
    "Payment Date": formatDate(payment.paymentDate),
    Status: payment.status,
    "Transaction Code": payment.transactionCode || "",
  }));

  const ws = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const data1 = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(data1, `payment_report_${new Date().toISOString().split("T")[0]}.csv`);
};

const generatePDFReport = (data: any[], stats: any) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text("Payment Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // Add summary section
  doc.setFontSize(12);
  doc.text("Summary", 14, 45);

  const summaryData = [
    ["Total Collections:", `${stats.totalPaid.toLocaleString()} UGX`],
    ["Expected Collections:", `${stats.expectedAmount.toLocaleString()} UGX`],
    ["Total Paid Candidates:", stats.uniquePayers.toString()],
    ["Collection Rate:", `${stats.collectionRate.toFixed(1)}%`],
    ["Completed Payments:", stats.completedPayments.toString()],
    ["Pending Payments:", stats.pendingPayments.toString()],
    ["Failed Payments:", stats.failedPayments.toString()],
  ];

  (doc as any).autoTable({
    startY: 50,
    head: [],
    body: summaryData,
    theme: "plain",
    margin: { left: 14 },
  });

  // Add payments table
  const tableData = data
    .slice(0, 20)
    .map((payment) => [
      payment.receiptNumber,
      payment.candidateName?.substring(0, 15) || "Unknown",
      formatElectionType(payment.electionType).substring(0, 12),
      `${Number(payment.amount).toLocaleString()} UGX`,
      payment.paymentMethod,
      payment.status,
      formatDate(payment.paymentDate),
    ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [
      [
        "Receipt No.",
        "Candidate",
        "Type",
        "Amount",
        "Method",
        "Status",
        "Date",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [241, 196, 15] },
    margin: { left: 14 },
    styles: { fontSize: 8 },
  });

  // Add note if there are more records
  if (data.length > 20) {
    doc.setFontSize(8);
    doc.text(
      `Note: Showing first 20 of ${data.length} total records. Export to Excel for complete data.`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );
  }

  doc.save(`payment_report_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Create a dropdown menu component for export options
const ExportMenu = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export Report
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onExport("excel");
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as Excel
            </button>
            <button
              onClick={() => {
                onExport("csv");
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as CSV
            </button>
            <button
              onClick={() => {
                onExport("pdf");
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const formatElectionType = (type) => {
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Type", "")
    .trim();
};

export default function PaymentReportDashboard() {
  const [filters, setFilters] = useState({
    electionType: "",
    subType: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const { data: fees = [] } = useGetFeesQuery();
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useGetPaymentsQuery();

  const stats = useMemo(() => {
    if (!payments || paymentsLoading)
      return {
        totalPaid: 0,
        uniquePayers: 0,
        expectedAmount: 0,
        collectionRate: 0,
        totalPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        completedPayments: 0,
      };

    const filtered = payments.filter((payment) => {
      if (filters.electionType && payment.electionType !== filters.electionType)
        return false;
      if (filters.subType && payment.subType !== filters.subType) return false;
      if (filters.status && payment.status !== filters.status) return false;
      if (
        filters.startDate &&
        new Date(payment.paymentDate) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(payment.paymentDate) > new Date(filters.endDate)
      )
        return false;
      return true;
    });

    // Calculate payment statistics
    const totalPaid = filtered
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const uniquePayers = new Set(
      filtered
        .filter((payment) => payment.status === "completed")
        .map((p) => p.candidateId)
    ).size;

    // Count payment statuses
    const totalPayments = filtered.length;
    const completedPayments = filtered.filter(
      (p) => p.status === "completed"
    ).length;
    const pendingPayments = filtered.filter(
      (p) => p.status === "pending"
    ).length;
    const failedPayments = filtered.filter((p) => p.status === "failed").length;

    // Calculate expected amount based on fees for all candidates who should pay
    // For now, we'll calculate based on actual payments, but this should ideally
    // include all eligible candidates from the database
    const expectedAmount = filtered.reduce((sum, payment) => {
      const matchingFee = fees.find(
        (fee) =>
          fee.electionType === payment.electionType &&
          fee.subType === payment.subType &&
          (fee.category || "") === (payment.category || "") &&
          (fee.position || "") === (payment.position || "")
      );
      return sum + (matchingFee ? Number(matchingFee.amount) : 0);
    }, 0);

    return {
      totalPaid,
      uniquePayers,
      expectedAmount,
      collectionRate:
        expectedAmount > 0 ? (totalPaid / expectedAmount) * 100 : 0,
      totalPayments,
      pendingPayments,
      failedPayments,
      completedPayments,
    };
  }, [payments, fees, filters, paymentsLoading]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment Reports
        </h1>
        <ExportMenu
          onExport={(format) => {
            switch (format) {
              case "excel":
                generateExcelReport(payments, stats);
                break;
              case "csv":
                generateCSVReport(payments);
                break;
              case "pdf":
                generatePDFReport(payments, stats);
                break;
            }
          }}
        />
      </div>

      {/* Loading State */}
      {paymentsLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Loading payment data...</span>
        </div>
      )}

      {/* Error State */}
      {paymentsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading payments
              </h3>
              <div className="mt-2 text-sm text-red-700">
                Unable to fetch payment data. Please try refreshing the page.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPaid.toLocaleString()} UGX
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedPayments} completed payments
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Collections</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.expectedAmount.toLocaleString()} UGX
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on fee structure
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.uniquePayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Unique candidates who paid
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.collectionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Of expected amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pendingPayments}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.failedPayments}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalPayments}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          Filter Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Election Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filters.electionType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  electionType: e.target.value,
                }))
              }
            >
              <option value="">All Types</option>
              <option value="nationalElectionType">National</option>
              <option value="districtElectionType">District</option>
              <option value="constituencyMunicipalityElectionType">
                Constituency/Municipality
              </option>
              <option value="subcountiesDivisionsElectionType">
                Subcounty/Division
              </option>
              <option value="parishwardElectionType">Parish/Ward</option>
              <option value="villageCellElectionType">Village/Cell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Payment Analysis by Category
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed breakdown of payments by election type and category
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Election Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Payments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupByElectionType(payments, fees)).map(
                ([type, data]: [string, PaymentData]) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatElectionType(data.electionType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.subType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.category || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {data.totalPayments}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.completedPayments}C / {data.pendingPayments}P /{" "}
                          {data.failedPayments}F
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {data.collectedAmount.toLocaleString()} UGX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                      {data.pendingAmount.toLocaleString()} UGX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {data.failedAmount.toLocaleString()} UGX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.expectedAmount.toLocaleString()} UGX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {data.expectedAmount > 0
                                ? (
                                    (data.collectedAmount /
                                      data.expectedAmount) *
                                    100
                                  ).toFixed(1)
                                : "0"}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  data.expectedAmount > 0
                                    ? Math.min(
                                        100,
                                        (data.collectedAmount /
                                          data.expectedAmount) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
