import React from "react";

interface ReportData {
  title: string;
  generatedDate: string;
  summary: {
    totalCollected: number;
    totalExpected: number;
    collectionRate: number;
    totalCandidates: number;
    avgPayment: number;
    topPaymentMethod: string;
  };
  payments: any[];
  filters?: any;
}

interface EnhancedReportTemplateProps {
  data: ReportData;
  type: "summary" | "detailed" | "analytics";
  className?: string;
}

export default function EnhancedReportTemplate({ 
  data, 
  type, 
  className = "" 
}: EnhancedReportTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  return (
    <div className={`bg-white p-8 max-w-4xl mx-auto ${className}`} style={{ minHeight: "297mm" }}>
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.title}</h1>
            <p className="text-gray-600">National Resistance Movement - Elections Commission</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Generated on</p>
            <p className="text-lg font-semibold text-gray-800">{data.generatedDate}</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
          Executive Summary
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-700 mb-1">Total Collections</h3>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(data.summary.totalCollected)}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-700 mb-1">Expected Amount</h3>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(data.summary.totalExpected)}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-700 mb-1">Collection Rate</h3>
            <p className="text-2xl font-bold text-purple-800">
              {data.summary.collectionRate.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-700 mb-1">Total Candidates</h3>
            <p className="text-2xl font-bold text-orange-800">
              {data.summary.totalCandidates}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Average Payment</h3>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(data.summary.avgPayment)}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Top Method</h3>
            <p className="text-2xl font-bold text-yellow-800 capitalize">
              {data.summary.topPaymentMethod}
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Insights</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Collection rate of {data.summary.collectionRate.toFixed(1)}% indicates {
                data.summary.collectionRate >= 80 ? "strong" : 
                data.summary.collectionRate >= 60 ? "moderate" : "low"
              } payment compliance.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {data.summary.topPaymentMethod.charAt(0).toUpperCase() + data.summary.topPaymentMethod.slice(1)} payments 
              are the most preferred method among candidates.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Average payment of {formatCurrency(data.summary.avgPayment)} across {data.summary.totalCandidates} candidates.
            </li>
          </ul>
        </div>
      </div>

      {/* Conditional Content Based on Report Type */}
      {type === "detailed" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-4">
            Detailed Payment Records
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Receipt No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Election Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-b">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.payments.slice(0, 50).map((payment, index) => (
                  <tr key={payment.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {payment.candidateName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b">
                      {formatElectionType(payment.electionType)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b">
                      {payment.position || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        payment.status === "completed" ? "bg-green-100 text-green-800" :
                        payment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.payments.length > 50 && (
            <p className="text-sm text-gray-600 mt-4 text-center">
              * Showing first 50 of {data.payments.length} payments. Complete data available in exported files.
            </p>
          )}
        </div>
      )}

      {type === "analytics" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
            Payment Analytics
          </h2>
          
          {/* Payment Method Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method Distribution</h3>
              {Object.entries(
                data.payments.reduce((acc, p) => {
                  acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="capitalize text-gray-700">{method}</span>
                  <span className="font-semibold text-gray-900">{count} payments</span>
                </div>
              ))}
            </div>
            
            {/* Election Type Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Election Type Distribution</h3>
              {Object.entries(
                data.payments.reduce((acc, p) => {
                  const type = formatElectionType(p.electionType);
                  acc[type] = (acc[type] || 0) + Number(p.amount);
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{type}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              {["completed", "pending", "failed"].map(status => {
                const count = data.payments.filter(p => p.status === status).length;
                const amount = data.payments
                  .filter(p => p.status === status)
                  .reduce((sum, p) => sum + Number(p.amount), 0);
                return (
                  <div key={status} className="text-center">
                    <div className={`p-4 rounded-lg ${
                      status === "completed" ? "bg-green-50 border border-green-200" :
                      status === "pending" ? "bg-yellow-50 border border-yellow-200" :
                      "bg-red-50 border border-red-200"
                    }`}>
                      <p className={`text-2xl font-bold ${
                        status === "completed" ? "text-green-800" :
                        status === "pending" ? "text-yellow-800" :
                        "text-red-800"
                      }`}>
                        {count}
                      </p>
                      <p className={`text-sm ${
                        status === "completed" ? "text-green-600" :
                        status === "pending" ? "text-yellow-600" :
                        "text-red-600"
                      } capitalize`}>
                        {status}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Applied Filters */}
      {data.filters && Object.values(data.filters).some(v => v) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-yellow-500 pl-4">
            Applied Filters
          </h2>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(data.filters)
                .filter(([key, value]) => value && value !== "")
                .map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="ml-2 text-gray-900">{value}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <p>National Resistance Movement</p>
            <p>Elections Commission Report</p>
          </div>
          <div className="text-right">
            <p>Generated: {data.generatedDate}</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This report contains financial data for NRM election candidate payments. 
            All amounts are in Uganda Shillings (UGX). For queries regarding this report, 
            contact the NRM Elections Commission.
          </p>
        </div>
      </div>
    </div>
  );
}
