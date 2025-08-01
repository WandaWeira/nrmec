import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Download,
  Filter,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
  Info,
} from "lucide-react";
import { useGetCandidateReportQuery } from "../store/api/baseApi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// Define filter options type
interface FilterOptions {
  electionTypes: string[];
  levels: string[];
  statuses: string[];
  positions: string[];
}

// Define filters state type
interface FiltersState {
  electionType: string;
  level: string;
  status: string;
  gender: string;
  regionId: string;
  subregionId: string;
  districtId: string;
  constituencyId: string;
  subcountyId: string;
  parishId: string;
  villageId: string;
  position: string;
  isNominated: string;
  isQualified: string;
  hasPayment: string;
  page: number;
  limit: number;
}

const CandidateReportComponent: React.FC = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Initialize filters
  const [filters, setFilters] = useState<FiltersState>({
    electionType: "",
    level: "",
    status: "",
    gender: "",
    regionId: "",
    subregionId: "",
    districtId: "",
    constituencyId: "",
    subcountyId: "",
    parishId: "",
    villageId: "",
    position: "",
    isNominated: "",
    isQualified: "",
    hasPayment: "",
    page: 1,
    limit: 10,
  });

  // Fetch candidate report data with filters
  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCandidateReportQuery(filters);

  const candidates = reportData?.candidates || [];
  const totalCount = reportData?.totalCount || 0;
  const totalPages = reportData?.totalPages || 1;
  const filterOptions: FilterOptions = reportData?.filters || {
    electionTypes: [],
    levels: [],
    statuses: [],
    positions: [],
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== "page" && key !== "limit" ? { page: 1 } : {}),
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      electionType: "",
      level: "",
      status: "",
      gender: "",
      regionId: "",
      subregionId: "",
      districtId: "",
      constituencyId: "",
      subcountyId: "",
      parishId: "",
      villageId: "",
      position: "",
      isNominated: "",
      isQualified: "",
      hasPayment: "",
      page: 1,
      limit: 10,
    });
  };

  // Format data for export
  const exportData = useMemo(() => {
    return candidates
      .map((candidate) => {
        // Flatten each participation into a separate row
        return candidate.participations.map((p) => ({
          "Candidate ID": candidate.id,
          "Full Name": candidate.fullName,
          Gender: candidate.gender,
          NIN: candidate.ninNumber,
          Phone: candidate.phoneNumber,
          "Election Type": p.electionType,
          "Administrative Level": p.level,
          Position: p.position,
          Status: p.status,
          Nominated: p.isNominated ? "Yes" : "No",
          Qualified: p.isQualified ? "Yes" : "No",
          "Fees Paid": candidate.hasPaidFees ? "Yes" : "No",
          Region: p.region || "",
          Subregion: p.subregion || "",
          District: p.district || "",
          "Constituency/Municipality": p.constituency || "",
          "Subcounty/Division": p.subcounty || "",
          "Parish/Ward": p.parish || "",
          "Village/Cell": p.village || "",
        }));
      })
      .flat();
  }, [candidates]);

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

    // Auto-size columns
    const maxWidth = exportData.reduce(
      (w, r) => Math.max(w, Object.keys(r).length),
      0
    );
    const colWidths = Array(maxWidth).fill({ wch: 15 }); // Default width

    worksheet["!cols"] = colWidths;

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0];
    const filename = `Candidate_Report_${date}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      handleFilterChange("page", newPage.toString());
    }
  };

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define column groups for the report table
  const columnGroups = [
    {
      title: "Candidate Information",
      columns: ["ID", "Full Name", "Gender", "Phone", "NIN"],
    },
    {
      title: "Election Information",
      columns: ["Election Type", "Level", "Position", "Status"],
    },
    {
      title: "Qualification",
      columns: ["Nominated", "Qualified", "Fees Paid"],
    },
    {
      title: "Administrative Units",
      columns: [
        "Region",
        "Subregion",
        "District",
        "Constituency",
        "Subcounty",
        "Parish",
        "Village",
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Candidate Report
        </h3>
        <p className="text-red-600">
          Unable to load candidate data. Please try again later.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* Header and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Detailed Report
          </h2>
          <p className="text-gray-600">
            Comprehensive view of all candidates with filtering options
          </p>
          <div className="text-sm text-gray-500 mt-1">
            Total: {totalCount} candidates
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center hover:bg-blue-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center hover:bg-gray-200"
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {isFilterOpen && (
        <div
          ref={filterPanelRef}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Filter Candidates</h3>
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
              >
                <X className="w-3 h-3 mr-1" /> Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-sm p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Election Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Election Type
              </label>
              <select
                value={filters.electionType}
                onChange={(e) =>
                  handleFilterChange("electionType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Election Types</option>
                {filterOptions.electionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Level filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Administrative Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                {filterOptions.levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Position filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange("position", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Positions</option>
                {filterOptions.positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Qualification filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomination Status
              </label>
              <select
                value={filters.isNominated}
                onChange={(e) =>
                  handleFilterChange("isNominated", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Nominated</option>
                <option value="false">Not Nominated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification Status
              </label>
              <select
                value={filters.isQualified}
                onChange={(e) =>
                  handleFilterChange("isQualified", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Qualified</option>
                <option value="false">Not Qualified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={filters.hasPayment}
                onChange={(e) =>
                  handleFilterChange("hasPayment", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Fees Paid</option>
                <option value="false">Fees Not Paid</option>
              </select>
            </div>

            {/* Records per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Records Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results section */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          {candidates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No candidates found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-300 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Full Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Gender
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Election Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Level/Position
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Administrative Area
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Nomination
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Qualification
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {candidates.map((candidate, index) => {
                    // Get the first participation for each candidate to display in the main row
                    const firstParticipation =
                      candidate.participations[0] || {};
                    const startIndex = (filters.page - 1) * filters.limit;

                    return (
                      <React.Fragment key={candidate.id}>
                        <tr
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {startIndex + index + 1}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {candidate.fullName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {candidate.gender}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {firstParticipation.electionType}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {firstParticipation.level}/
                            {firstParticipation.position}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getHighestAdminUnit(firstParticipation)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                firstParticipation.status
                              )}`}
                            >
                              {firstParticipation.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                firstParticipation.isNominated
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {firstParticipation.isNominated
                                ? "Nominated"
                                : "Not Nominated"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                firstParticipation.isQualified
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {firstParticipation.isQualified
                                ? "Qualified"
                                : "Not Qualified"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                candidate.hasPaidFees
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {candidate.hasPaidFees ? "Paid" : "Not Paid"}
                            </span>
                          </td>
                        </tr>

                        {/* Show additional participations for the candidate */}
                        {candidate.participations.length > 1 &&
                          candidate.participations.slice(1).map((p, pIndex) => (
                            <tr
                              key={`${candidate.id}-p-${pIndex}`}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } bg-opacity-60`}
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-400">
                                ↳
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                                {/* Empty */}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                                {/* Empty */}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {p.electionType}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {p.level}/{p.position}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {getHighestAdminUnit(p)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    p.status
                                  )}`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    p.isNominated
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {p.isNominated
                                    ? "Nominated"
                                    : "Not Nominated"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    p.isQualified
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {p.isQualified
                                    ? "Qualified"
                                    : "Not Qualified"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {/* Empty */}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                      filters.page === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                      filters.page === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {candidates.length > 0
                          ? (filters.page - 1) * filters.limit + 1
                          : 0}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, totalCount)}
                      </span>{" "}
                      of <span className="font-medium">{totalCount}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={filters.page === 1}
                        className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                          filters.page === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">First</span>
                        <ChevronDown className="h-5 w-5 rotate-90" />
                        <ChevronDown className="h-5 w-5 rotate-90 -ml-2" />
                      </button>
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className={`relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                          filters.page === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="h-5 w-5 rotate-90" />
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (filters.page <= 3) {
                            pageNum = i + 1;
                          } else if (filters.page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = filters.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                filters.page === pageNum
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === totalPages}
                        className={`relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                          filters.page === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={filters.page === totalPages}
                        className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                          filters.page === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Last</span>
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                        <ChevronDown className="h-5 w-5 -rotate-90 -ml-2" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get the highest/most specific administrative unit for display
function getHighestAdminUnit(participation: any): string {
  if (participation.village)
    return `${participation.village} (${participation.villageType})`;
  if (participation.parish)
    return `${participation.parish} (${participation.parishType})`;
  if (participation.subcounty)
    return `${participation.subcounty} (${participation.subcountyType})`;
  if (participation.constituency)
    return `${participation.constituency} (${participation.constituencyType})`;
  if (participation.district) return participation.district;
  if (participation.subregion) return participation.subregion;
  if (participation.region) return participation.region;
  return "N/A";
}

// Helper function to get color class based on status
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default CandidateReportComponent;
