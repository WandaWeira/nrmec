import React, { useState, useMemo, useEffect } from "react";
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
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  Printer,
  RefreshCw,
  ChevronDown,
  X,
  Eye,
} from "lucide-react";
import {
  useGetFeesQuery,
  useGetPaymentsQuery,
} from "../../store/api/baseApi";
import PaymentAnalytics from "../../components/PaymentAnalytics";
import EnhancedReportTemplate from "../../components/EnhancedReportTemplate";

// Use the Payment interface from baseApi and extend it as needed
interface Payment {
  candidateId: string;
  amount: number;
  paymentMethod: string;
  transactionCode: string; 
  electionType: string;
  subType: string;
  category?: string;
  position?: string;
  positionPath: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
  candidateName: string;
  id: string;
  paymentDate: string;
}

// Enhanced interface that extends the base Payment interface
interface EnhancedPayment extends Payment {
  candidateParticipationId?: string;
  subcategory?: string;
  nestedCategory?: string;
  processedBy?: string;
  candidateGender?: string;
  candidatePhone?: string;
  regionName?: string;
  districtName?: string;
  constituencyName?: string;
  subcountyName?: string;
  parishName?: string;
  villageName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FilterState {
  electionType: string;
  subType: string;
  category: string;
  position: string;
  status: string;
  paymentMethod: string;
  region: string;
  district: string;
  startDate: string;
  endDate: string;
  amountMin: string;
  amountMax: string;
  searchText: string;
}

interface PaymentStats {
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  totalCandidates: number;
  pendingPayments: number;
  failedPayments: number;
  avgPaymentAmount: number;
  topPaymentMethod: string;
  recentPayments: number;
  dailyTarget: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
  }[];
}

// Enhanced component
export default function EnhancedPaymentReportDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    electionType: "",
    subType: "",
    category: "",
    position: "",
    status: "",
    paymentMethod: "",
    region: "",
    district: "",
    startDate: "",
    endDate: "",
    amountMin: "",
    amountMax: "",
    searchText: "",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "detailed" | "analytics">("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // API queries
  const { data: fees = [], isLoading: feesLoading } = useGetFeesQuery();
  const { data: paymentsData = [], isLoading: paymentsLoading, refetch } = useGetPaymentsQuery();  // Convert payments data to enhanced format
  const payments: EnhancedPayment[] = useMemo(() => {
    return Array.isArray(paymentsData) ? paymentsData.map((payment: Payment): EnhancedPayment => ({
      ...payment,
      // Set default values for optional fields if not present
      processedBy: 'System',
      createdAt: payment.paymentDate,
      updatedAt: payment.paymentDate,
    })) : [];
  }, [paymentsData]);

  // Dynamic filter options based on actual data
  const filterOptions = useMemo(() => {
    const options = {
      electionTypes: [...new Set(payments.map(p => p.electionType))],
      subTypes: [...new Set(payments.map(p => p.subType))],
      categories: [...new Set(payments.map(p => p.category).filter(Boolean))],
      positions: [...new Set(payments.map(p => p.position).filter(Boolean))],
      statuses: [...new Set(payments.map(p => p.status))],
      paymentMethods: [...new Set(payments.map(p => p.paymentMethod))],
      regions: [...new Set(payments.map(p => p.regionName).filter(Boolean))],
      districts: [...new Set(payments.map(p => p.districtName).filter(Boolean))],
    };

    return options;
  }, [payments]);

  // Filtered payments based on all criteria
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchableText = `${payment.candidateName} ${payment.receiptNumber} ${payment.candidateId}`.toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }

      // Date range
      if (filters.startDate) {
        if (new Date(payment.paymentDate) < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        if (new Date(payment.paymentDate) > new Date(filters.endDate)) return false;
      }

      // Amount range
      if (filters.amountMin && payment.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && payment.amount > parseFloat(filters.amountMax)) return false;

      // Dropdown filters
      if (filters.electionType && payment.electionType !== filters.electionType) return false;
      if (filters.subType && payment.subType !== filters.subType) return false;
      if (filters.category && payment.category !== filters.category) return false;
      if (filters.position && payment.position !== filters.position) return false;
      if (filters.status && payment.status !== filters.status) return false;
      if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
      if (filters.region && payment.regionName !== filters.region) return false;
      if (filters.district && payment.districtName !== filters.district) return false;

      return true;
    });
  }, [payments, filters]);

  // Enhanced statistics
  const stats = useMemo((): PaymentStats => {
    const filtered = filteredPayments;
    
    if (filtered.length === 0) {
      return {
        totalCollected: 0,
        totalExpected: 0,
        collectionRate: 0,
        totalCandidates: 0,
        pendingPayments: 0,
        failedPayments: 0,
        avgPaymentAmount: 0,
        topPaymentMethod: "",
        recentPayments: 0,
        dailyTarget: 0,
      };
    }

    const totalCollected = filtered.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCandidates = new Set(filtered.map(p => p.candidateId)).size;
    const pendingPayments = filtered.filter(p => p.status === "pending").length;
    const failedPayments = filtered.filter(p => p.status === "failed").length;
    
    // Calculate expected amount based on fees
    const totalExpected = filtered.reduce((sum, payment) => {
      const matchingFee = fees.find(fee => 
        fee.electionType === payment.electionType &&
        fee.subType === payment.subType &&
        (fee.category || "") === (payment.category || "") &&
        (fee.position || "") === (payment.position || "")
      );
      return sum + (matchingFee ? Number(matchingFee.amount) : 0);
    }, 0);

    const avgPaymentAmount = totalCollected / filtered.length;
    
    // Find most common payment method
    const methodCounts = filtered.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topPaymentMethod = Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "";

    // Recent payments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPayments = filtered.filter(p => 
      new Date(p.paymentDate) >= sevenDaysAgo
    ).length;

    return {
      totalCollected,
      totalExpected,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
      totalCandidates,
      pendingPayments,
      failedPayments,
      avgPaymentAmount,
      topPaymentMethod,
      recentPayments,
      dailyTarget: totalExpected / 30, // Assuming 30-day target
    };
  }, [filteredPayments, fees]);

  // Chart data for analytics
  const chartData = useMemo(() => {
    // Payment methods pie chart
    const methodCounts = filteredPayments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentMethodsChart: ChartData = {
      labels: Object.keys(methodCounts),
      datasets: [{
        label: "Payment Methods",
        data: Object.values(methodCounts),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
      }]
    };

    // Daily payments trend
    const dailyPayments = filteredPayments.reduce((acc, p) => {
      const date = new Date(p.paymentDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    const dailyTrendChart: ChartData = {
      labels: Object.keys(dailyPayments).slice(-14), // Last 14 days
      datasets: [{
        label: "Daily Collections (UGX)",
        data: Object.values(dailyPayments).slice(-14),
        backgroundColor: ["#3B82F6"],
        borderColor: ["#2563EB"],
      }]
    };

    return { paymentMethodsChart, dailyTrendChart };
  }, [filteredPayments]);

  // Export functions with enhanced features
  const generateEnhancedExcelReport = () => {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["PAYMENT REPORT SUMMARY", ""],
      ["Generated On", new Date().toLocaleDateString()],
      ["", ""],
      ["FINANCIAL OVERVIEW", ""],
      ["Total Collections", `${stats.totalCollected.toLocaleString()} UGX`],
      ["Expected Collections", `${stats.totalExpected.toLocaleString()} UGX`],
      ["Collection Rate", `${stats.collectionRate.toFixed(2)}%`],
      ["Average Payment", `${stats.avgPaymentAmount.toLocaleString()} UGX`],
      ["", ""],
      ["CANDIDATE METRICS", ""],
      ["Total Candidates", stats.totalCandidates],
      ["Pending Payments", stats.pendingPayments],
      ["Failed Payments", stats.failedPayments],
      ["Recent Payments (7 days)", stats.recentPayments],
      ["", ""],
      ["TOP PAYMENT METHOD", stats.topPaymentMethod.toUpperCase()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Detailed payments sheet
    const detailedData = filteredPayments.map(payment => ({
      "Receipt No": payment.receiptNumber,
      "Candidate Name": payment.candidateName,
      "NIN": payment.candidateId,
      "Election Type": formatElectionType(payment.electionType),
      "Sub Type": payment.subType,
      "Category": payment.category || "-",
      "Position": payment.position || "-",
      "Amount (UGX)": Number(payment.amount),
      "Payment Method": payment.paymentMethod.toUpperCase(),
      "Transaction Code": payment.transactionCode || "-",
      "Status": payment.status.toUpperCase(),
      "Payment Date": formatDate(payment.paymentDate),
      "Processed By": payment.processedBy,
      "Region": payment.regionName || "-",
      "District": payment.districtName || "-",
    }));

    const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, "Detailed Payments");

    // Analytics sheet
    const analyticsData = [
      ["PAYMENT ANALYTICS", ""],
      ["", ""],
      ["Payment Method Distribution", "Count"],
      ...Object.entries(chartData.paymentMethodsChart.datasets[0].data.reduce((acc, count, index) => {
        acc[chartData.paymentMethodsChart.labels[index]] = count;
        return acc;
      }, {} as Record<string, number>)),
      ["", ""],
      ["Election Type Distribution", "Amount (UGX)"],
      ...Object.entries(filteredPayments.reduce((acc, p) => {
        const type = formatElectionType(p.electionType);
        acc[type] = (acc[type] || 0) + Number(p.amount);
        return acc;
      }, {} as Record<string, number>)),
    ];

    const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData);
    XLSX.utils.book_append_sheet(workbook, analyticsSheet, "Analytics");

    // Save file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `enhanced_payment_report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };
  const generateEnhancedPDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("ENHANCED PAYMENT REPORT", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 35);
    
    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Financial Summary", 20, 50);
    
    const summaryData = [
      ["Total Collections", `${stats.totalCollected.toLocaleString()} UGX`],
      ["Expected Collections", `${stats.totalExpected.toLocaleString()} UGX`],
      ["Collection Rate", `${stats.collectionRate.toFixed(2)}%`],
      ["Total Candidates", stats.totalCandidates.toString()],
      ["Average Payment", `${stats.avgPaymentAmount.toLocaleString()} UGX`],
      ["Top Payment Method", stats.topPaymentMethod.toUpperCase()],
    ];

    (doc as any).autoTable({
      startY: 55,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    // Detailed payments table
    doc.text("Payment Details", 20, (doc as any).lastAutoTable.finalY + 15);
    
    const paymentsData = filteredPayments.slice(0, 50).map(payment => [
      payment.receiptNumber,
      payment.candidateName,
      formatElectionType(payment.electionType),
      `${Number(payment.amount).toLocaleString()} UGX`,
      payment.paymentMethod.toUpperCase(),
      formatDate(payment.paymentDate),
      payment.status.toUpperCase(),
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Receipt", "Candidate", "Election Type", "Amount", "Method", "Date", "Status"]],
      body: paymentsData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
      },
    });    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    doc.save(`enhanced_payment_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const printReport = (type: "overview" | "detailed" | "analytics") => {
    const reportData = {
      title: "Payment Report Dashboard",
      generatedDate: new Date().toLocaleDateString(),
      summary: {
        totalCollected: stats.totalCollected,
        totalExpected: stats.totalExpected,
        collectionRate: stats.collectionRate,
        totalCandidates: stats.totalCandidates,
        avgPayment: stats.avgPaymentAmount,
        topPaymentMethod: stats.topPaymentMethod,
      },
      payments: filteredPayments,
      filters: filters,
    };

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate the HTML content using our template
    const reportTemplate = document.createElement("div");
    
    // This would be replaced with actual React rendering in a real implementation
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Report - ${type.charAt(0).toUpperCase() + type.slice(1)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .print-header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            .print-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .print-subtitle { color: #6b7280; }
            .print-date { text-align: right; color: #6b7280; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
            .stat-card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .stat-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
            .stat-value { font-size: 20px; font-weight: bold; color: #1f2937; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .table th { background: #f9fafb; font-weight: 600; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h1 class="print-title">Payment Report Dashboard</h1>
                <p class="print-subtitle">National Resistance Movement - Elections Commission</p>
              </div>
              <div class="print-date">
                <p>Generated on</p>
                <p style="font-weight: 600;">${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Collections</div>
              <div class="stat-value">${formatCurrency(stats.totalCollected)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Collection Rate</div>
              <div class="stat-value">${stats.collectionRate.toFixed(1)}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Candidates</div>
              <div class="stat-value">${stats.totalCandidates}</div>
            </div>
          </div>

          ${type === "detailed" ? `
            <h2 style="margin-top: 40px; margin-bottom: 20px; color: #1f2937;">Payment Details</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Candidate</th>
                  <th>Election Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPayments.slice(0, 100).map(payment => `
                  <tr>
                    <td>${payment.receiptNumber}</td>
                    <td>${payment.candidateName}</td>
                    <td>${formatElectionType(payment.electionType)}</td>
                    <td>${formatCurrency(Number(payment.amount))}</td>
                    <td>${payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}</td>
                    <td>${formatDate(payment.paymentDate)}</td>
                    <td>${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>National Resistance Movement - Elections Commission</p>
            <p>Generated: ${new Date().toLocaleDateString()} | Page 1 of 1</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Utility functions
  const formatElectionType = (type: string) => {
    const mappings: Record<string, string> = {
      nationalElectionType: "National Election",
      districtElectionType: "District Election",
      constituencyMunicipalityElectionType: "Constituency/Municipality",
      subcountiesDivisionsElectionType: "Subcounty/Division",
      parishwardElectionType: "Parish/Ward",
      villageCellElectionType: "Village/Cell",
    };
    return mappings[type] || type.replace(/([A-Z])/g, " $1").trim();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const clearFilters = () => {
    setFilters({
      electionType: "",
      subType: "",
      category: "",
      position: "",
      status: "",
      paymentMethod: "",
      region: "",
      district: "",
      startDate: "",
      endDate: "",
      amountMin: "",
      amountMax: "",
      searchText: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Reports Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive payment analytics and reporting</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={paymentsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${paymentsLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="relative">
                <select
                  className="appearance-none bg-yellow-600 text-white px-4 py-2 pr-8 rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
                  onChange={(e) => {
                    const format = e.target.value;
                    if (format === "excel") generateEnhancedExcelReport();
                    else if (format === "pdf") generateEnhancedPDFReport();
                    e.target.value = "";
                  }}
                >
                  <option value="">Export Report</option>
                  <option value="excel">Export as Excel</option>
                  <option value="pdf">Export as PDF</option>
                </select>
                <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates, receipt numbers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.searchText}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                />
              </div>

              {/* Election Type */}
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.electionType}
                onChange={(e) => setFilters(prev => ({ ...prev, electionType: e.target.value }))}
              >
                <option value="">All Election Types</option>
                {filterOptions.electionTypes.map(type => (
                  <option key={type} value={type}>{formatElectionType(type)}</option>
                ))}
              </select>

              {/* Sub Type */}
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.subType}
                onChange={(e) => setFilters(prev => ({ ...prev, subType: e.target.value }))}
              >
                <option value="">All Sub Types</option>
                {filterOptions.subTypes.map(subType => (
                  <option key={subType} value={subType}>{subType}</option>
                ))}
              </select>

              {/* Status */}
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>

              {/* Payment Method */}
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="">All Payment Methods</option>
                {filterOptions.paymentMethods.map(method => (
                  <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                ))}
              </select>

              {/* Region */}
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              >
                <option value="">All Regions</option>
                {filterOptions.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              {/* Date Range */}
              <input
                type="date"
                placeholder="Start Date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />

              <input
                type="date"
                placeholder="End Date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Collections</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalCollected)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">vs Expected</p>
                <p className={`text-sm font-semibold ${stats.collectionRate >= 100 ? "text-green-600" : "text-orange-600"}`}>
                  {stats.collectionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paying Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
                <p className="text-xs text-gray-500">
                  Avg: {formatCurrency(stats.avgPaymentAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.collectionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  Expected: {formatCurrency(stats.totalExpected)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentPayments}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "detailed", label: "Detailed Report", icon: FileText },
                { id: "analytics", label: "Analytics", icon: PieChart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Completed Payments</h3>
                    <p className="text-3xl font-bold">{filteredPayments.filter(p => p.status === "completed").length}</p>
                    <p className="text-green-100 text-sm">
                      {formatCurrency(filteredPayments.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0))}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Pending Payments</h3>
                    <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                    <p className="text-yellow-100 text-sm">Awaiting processing</p>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Failed Payments</h3>
                    <p className="text-3xl font-bold">{stats.failedPayments}</p>
                    <p className="text-red-100 text-sm">Require attention</p>
                  </div>
                </div>

                {/* Quick Stats Table */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Methods Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(
                      filteredPayments.reduce((acc, p) => {
                        acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([method, amount]) => (
                      <div key={method} className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600 capitalize">{method}</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "detailed" && (              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Payment Details ({filteredPayments.length} records)</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => printReport("detailed")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print Report
                    </button>
                    <button
                      onClick={() => generateEnhancedExcelReport()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export Details
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Election Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
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
                      {filteredPayments.slice(0, 100).map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.receiptNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.candidateName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatElectionType(payment.electionType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.position || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.paymentMethod === "cash" ? "bg-green-100 text-green-800" :
                              payment.paymentMethod === "bank" ? "bg-blue-100 text-blue-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === "completed" ? "bg-green-100 text-green-800" :
                              payment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Print Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPayments.length > 100 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      Showing first 100 of {filteredPayments.length} payments. Export for complete data.
                    </p>
                  </div>
                )}
              </div>
            )}            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Payment Analytics</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => printReport("analytics")}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print Analytics
                    </button>
                  </div>
                </div>
                
                <PaymentAnalytics 
                  payments={filteredPayments}
                  fees={fees}
                  className="space-y-6"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
