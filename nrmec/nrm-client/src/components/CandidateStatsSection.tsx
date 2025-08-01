import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CheckCircle,
  Award,
  DollarSign,
  Vote,
  TrendingUp,
  FileText,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import { useGetCandidateStatsQuery } from "../store/api/baseApi";
import { useSearchCandidatesQuery } from "../store/api/payments_api";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface CandidateStatsSectionProps {
  className?: string;
}

const CandidateStatsSection: React.FC<CandidateStatsSectionProps> = ({
  className = "",
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const {
    data: candidateStats,
    isLoading,
    error,
  } = useGetCandidateStatsQuery();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Search for candidates
  const { data: searchResults = [], isFetching: isSearching } =
    useSearchCandidatesQuery(debouncedTerm, {
      skip: !debouncedTerm || debouncedTerm.length < 2,
    });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCandidateClick = (candidate: any) => {
    navigate(`/candidate-report?candidateId=${candidate.id}`);
    setSearchTerm("");
    setDebouncedTerm("");
    setShowSearch(false);
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${className} bg-red-50 border border-red-200 rounded-lg p-6`}
      >
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Candidate Statistics
        </h3>
        <p className="text-red-600">
          Unable to load candidate data. Please try again later.
        </p>
      </div>
    );
  }

  if (!candidateStats) {
    return null;
  }

  const summaryCards = [
    {
      title: "Total Candidates",
      value: candidateStats.totalCandidates?.toLocaleString() || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Participations",
      value: candidateStats.totalParticipations?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Nominated",
      value: candidateStats.nominatedCandidates?.toLocaleString() || "0",
      icon: Award,
      color: "bg-yellow-500",
    },
    {
      title: "Qualified",
      value: candidateStats.qualifiedCandidates?.toLocaleString() || "0",
      icon: CheckCircle,
      color: "bg-purple-500",
    },
  ];

  const paymentCards = [
    {
      title: "Total Payments",
      value:
        candidateStats.paymentStats?.totalPayments?.toLocaleString() || "0",
      icon: DollarSign,
      color: "bg-green-600",
    },
    {
      title: "Completed Payments",
      value:
        candidateStats.paymentStats?.completedPayments?.toLocaleString() || "0",
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      title: "Payment Amount",
      value: `UGX ${
        candidateStats.paymentStats?.totalAmount?.toLocaleString() || "0"
      }`,
      icon: DollarSign,
      color: "bg-teal-500",
    },
    {
      title: "Total Votes",
      value: candidateStats.voteStats?.totalVotes?.toLocaleString() || "0",
      icon: Vote,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Candidate Statistics
            </h2>
            <p className="text-gray-600">
              Overview of candidates, participations, payments, and voting data
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Candidates
            </button>
            <button
              onClick={() => navigate("/candidate-report")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Detailed Report
            </button>
            <button
              onClick={() => navigate("/payments/payment-report-dashboard")}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Payment Report
            </button>
          </div>
        </div>

        {/* Search Bar for Nominated Candidates */}
        {showSearch && (
          <div className="relative mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for nominated candidates by name, position, or district..."
                className="w-full px-3 py-3 focus:outline-none"
                autoFocus
              />
              {isSearching && (
                <div className="px-4">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && searchTerm && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {(candidate as any).candidateName ||
                            (candidate as any).name ||
                            "Candidate Name"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(candidate as any).position || "Position"} •{" "}
                          {(candidate as any).electionType || "Election"}
                        </p>
                        {(candidate as any).district && (
                          <p className="text-xs text-gray-400">
                            {(candidate as any).district}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-1 rounded-full text-xs mb-1 ${
                            (candidate as any).isNominated
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {(candidate as any).isNominated
                            ? "Nominated"
                            : "Not Nominated"}
                        </span>
                        {(candidate as any).isQualified && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Qualified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {debouncedTerm && searchResults.length === 0 && !isSearching && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No candidates found for "{debouncedTerm}"
              </div>
            )}
          </div>
        )}

        {/* Quick Filters for Position-based Reports */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Quick Position Filters:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => navigate("/candidate-report?position=national")}
              className="flex items-center justify-center px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Award className="w-3 h-3 mr-1" />
              National
            </button>
            <button
              onClick={() => navigate("/candidate-report?position=district")}
              className="flex items-center justify-center px-3 py-2 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              District
            </button>
            <button
              onClick={() =>
                navigate("/candidate-report?position=constituency")
              }
              className="flex items-center justify-center px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            >
              <Users className="w-3 h-3 mr-1" />
              Constituency
            </button>
            <button
              onClick={() => navigate("/candidate-report?position=subcounty")}
              className="flex items-center justify-center px-3 py-2 text-xs bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1" />
              Subcounty
            </button>
            <button
              onClick={() => navigate("/candidate-report?position=parish")}
              className="flex items-center justify-center px-3 py-2 text-xs bg-pink-50 text-pink-700 rounded-md hover:bg-pink-100 transition-colors"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Parish/Ward
            </button>
            <button
              onClick={() => navigate("/candidate-report?position=village")}
              className="flex items-center justify-center px-3 py-2 text-xs bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Village/Cell
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const getNavigationUrl = () => {
            switch (card.title) {
              case "Total Candidates":
                return "/candidate-report";
              case "Total Participations":
                return "/candidate-report?filter=participations";
              case "Nominated":
                return "/candidate-report?filter=nominated";
              case "Qualified":
                return "/candidate-report?filter=qualified";
              default:
                return "/candidate-report";
            }
          };

          return (
            <div
              key={index}
              onClick={() => navigate(getNavigationUrl())}
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Vote Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {paymentCards.map((card, index) => {
          const Icon = card.icon;
          const getPaymentNavigationUrl = () => {
            switch (card.title) {
              case "Total Payments":
                return "/payments/payment-report-dashboard";
              case "Completed Payments":
                return "/payments/payment-report-dashboard?status=completed";
              case "Payment Amount":
                return "/payments/payment-report-dashboard?view=financial";
              case "Total Votes":
                return "/votes"; // Assuming there's a votes page
              default:
                return "/payments/payment-report-dashboard";
            }
          };

          return (
            <div
              key={index}
              onClick={() => navigate(getPaymentNavigationUrl())}
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Reports Quick Access */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Reports
              </h3>
              <p className="text-gray-600">
                Quick access to payment tracking and financial reports
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/payments/report")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Full Payment Report
              </button>
              <button
                onClick={() => navigate("/payments/receive")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Receive Payments
              </button>
              <button
                onClick={() => navigate("/payments/enhanced-report")}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Enhanced Reports
              </button>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-green-600">
                  {candidateStats.paymentStats?.completedPayments?.toLocaleString() ||
                    "0"}
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-sm text-gray-600">Completed Payments</div>
              <button
                onClick={() => navigate("/payments/report?status=completed")}
                className="text-xs text-green-600 hover:text-green-800 mt-1"
              >
                View Details →
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-orange-600">
                  {(candidateStats.paymentStats?.totalPayments || 0) -
                    (candidateStats.paymentStats?.completedPayments || 0)}
                </div>
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
              <button
                onClick={() => navigate("/payments/report?status=pending")}
                className="text-xs text-orange-600 hover:text-orange-800 mt-1"
              >
                View Details →
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-blue-600">
                  {candidateStats.paymentStats?.totalAmount
                    ? `${Math.round(
                        (candidateStats.paymentStats.completedPayments /
                          candidateStats.paymentStats.totalPayments) *
                          100
                      )}%`
                    : "0%"}
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
              <button
                onClick={() => navigate("/payments/report?view=analytics")}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                View Analytics →
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-purple-600">
                  UGX{" "}
                  {candidateStats.paymentStats?.totalAmount?.toLocaleString() ||
                    "0"}
                </div>
                <Vote className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
              <button
                onClick={() => navigate("/payments/report?view=financial")}
                className="text-xs text-purple-600 hover:text-purple-800 mt-1"
              >
                Financial Report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateStatsSection;
