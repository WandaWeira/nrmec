import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchAdministrativeUnitsQuery } from "../store/api/baseApi";
import { useSearchCandidatesQuery } from "../store/api/payments_api";

const DashboardSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [searchType, setSearchType] = useState<"administrative" | "candidates">(
    "administrative"
  );
  const navigate = useNavigate();

  // Set up debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Skip query if search term is empty
  const { data: adminResults = [], isFetching: isAdminFetching } =
    useSearchAdministrativeUnitsQuery(debouncedTerm, {
      skip:
        !debouncedTerm ||
        debouncedTerm.length < 2 ||
        searchType !== "administrative",
    });

  const { data: candidateResults = [], isFetching: isCandidateFetching } =
    useSearchCandidatesQuery(debouncedTerm, {
      skip:
        !debouncedTerm ||
        debouncedTerm.length < 2 ||
        searchType !== "candidates",
    });

  const searchResults =
    searchType === "administrative" ? adminResults : candidateResults;
  const isFetching =
    searchType === "administrative" ? isAdminFetching : isCandidateFetching;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (result) => {
    if (searchType === "candidates") {
      // Navigate to candidate details or candidate report with candidate ID filter
      navigate(`/candidate-report?candidateId=${result.id}`);
    } else {
      // Navigate to the appropriate administrative unit page
      if (result.type === "village" || result.type === "cell") {
        navigate(`/villages-cells/${result.id}`);
      } else if (result.type === "parish" || result.type === "ward") {
        navigate(`/parishes-wards/${result.id}`);
      } else if (result.type === "subcounty" || result.type === "division") {
        navigate(`/subcounties-divisions/${result.id}`);
      } else if (
        result.type === "constituency" ||
        result.type === "municipality"
      ) {
        navigate(`/constituencies-municipalities/${result.id}`);
      } else if (result.type === "district") {
        navigate(`/districts/${result.id}`);
      } else if (result.type === "subregion") {
        navigate(`/subregions/${result.id}`);
      } else if (result.type === "region") {
        navigate(`/regions/${result.id}`);
      }
    }

    // Clear search after navigation
    setSearchTerm("");
    setDebouncedTerm("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 relative">
      {/* Search Type Toggle */}
      <div className="flex mb-3 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setSearchType("administrative")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            searchType === "administrative"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Administrative Units
        </button>
        <button
          onClick={() => setSearchType("candidates")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            searchType === "candidates"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Nominated Candidates
        </button>
      </div>

      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={
            searchType === "administrative"
              ? "Search for regions, districts, villages..."
              : "Search for nominated candidates..."
          }
          className="w-full px-3 py-3 focus:outline-none"
        />
        {isFetching && (
          <div className="px-4">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && searchTerm && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={`${searchType}-${result.type || "candidate"}-${result.id}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="font-medium">
                    {result.name || result.candidateName}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {searchType === "candidates"
                      ? `${result.position || "Position"} • ${
                          result.electionType || "Election"
                        }`
                      : `${result.type} • ${result.parentName || ""}`}
                  </p>
                  {searchType === "candidates" && result.district && (
                    <p className="text-xs text-gray-400">{result.district}</p>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {searchType === "administrative" && (
                    <>
                      {result.district && `${result.district}, `}
                      {result.region}
                    </>
                  )}
                  {searchType === "candidates" && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        result.isNominated
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {result.isNominated ? "Nominated" : "Not Nominated"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {debouncedTerm && searchResults.length === 0 && !isFetching && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No results found for "{debouncedTerm}"
        </div>
      )}
    </div>
  );
};

export default DashboardSearchBar;
