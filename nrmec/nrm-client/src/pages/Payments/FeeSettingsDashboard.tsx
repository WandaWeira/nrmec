import { useState, useMemo, useEffect } from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  CheckCircle,
  AlertCircle,
  PencilIcon,
  History,
  X,
  Plus,
  Filter,
  Save,
} from "lucide-react";
import CustomDataGrid from "../../components/CustomDataGrid";
import {
  useGetFeesQuery,
  useUpdateFeeMutation,
  useCreateFeeMutation,
} from "../../store/api/baseApi";
import positionFeesConfig from "../../config/position_fees_config.json";

type ElectionType = keyof typeof positionFeesConfig;

interface FeeFormData {
  electionType: ElectionType | "";
  selectedPathSegments: string[];
  positionPath: string;
  amount: string;
}

// Define interface for filter state
interface FilterState {
  electionType: string;
  level: string;
  position: string;
  positionPath: string;
  category: string;
}

const getNextOptions = (currentConfig: any, selectedSegments: string[]) => {
  let currentLevel = currentConfig;
  for (const segment of selectedSegments) {
    if (
      currentLevel &&
      typeof currentLevel === "object" &&
      segment in currentLevel
    ) {
      currentLevel = currentLevel[segment];
    } else {
      return [];
    }
  }
  if (
    currentLevel &&
    typeof currentLevel === "object" &&
    !Object.values(currentLevel).some((v) => v === null)
  ) {
    return Object.keys(currentLevel);
  }
  return [];
};

const FeeSettingsDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFee, setEditingFee] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any | null>(null);
  const [tempFee, setTempFee] = useState<number | null>(null);
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    electionType: "",
    level: "",
    position: "",
    positionPath: "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<FeeFormData>({
    electionType: "",
    selectedPathSegments: [],
    positionPath: "",
    amount: "",
  });

  const [dropdownLevels, setDropdownLevels] = useState<string[][]>([]);

  const { data: fees, isLoading } = useGetFeesQuery();
  const [updateFee] = useUpdateFeeMutation();
  const [createFee] = useCreateFeeMutation();
  // Function to fix fee data by ensuring all required fields exist
  const fixFeeData = (fee: any) => {
    if (!fee) return null;

    // Check if the object is malformed or empty
    if (typeof fee !== "object" || Object.keys(fee).length === 0) {
      console.warn("Malformed fee object:", fee);
      return null;
    }

    // Extract values from the position path if needed
    let extractedLevel = "";
    let extractedCategory = "";
    let extractedSubType = "";

    if (fee.positionPath && typeof fee.positionPath === "string") {
      const parts = fee.positionPath.split(".");
      if (parts.length >= 2) {
        // First part is the election type (already have that)
        // Second part is usually the level
        extractedLevel = parts[1] || "";

        // Third part is often the category (Youth, Women, etc.)
        if (parts.length >= 3) {
          extractedCategory = parts[2] || "";
        }

        // Last part is the specific position or subType
        if (parts.length >= 4) {
          extractedSubType = parts[parts.length - 1] || "";
        }
      }
    }

    // Create a new object with default values for missing fields
    return {
      id: fee.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      electionType: fee.electionType || "",
      level: fee.level || extractedLevel || "",
      category: fee.category || extractedCategory || "",
      subType: fee.subType || extractedSubType || "",
      position: fee.position || "",
      positionPath: fee.positionPath || "",
      amount: fee.amount !== undefined ? Number(fee.amount) : null,
      isActive: fee.isActive !== undefined ? fee.isActive : true,
      createdAt: fee.createdAt || "",
      updatedAt: fee.updatedAt || "",
    };
  }; // Apply filters to the fee data
  const filteredFees = useMemo(() => {
    if (!fees || !Array.isArray(fees)) {
      return [];
    }

    // Transform fees data to ensure proper structure
    const transformedFees = fees.map((fee) => fixFeeData(fee)).filter(Boolean); // Remove null values (invalid fees)

    // Apply filters
    return transformedFees.filter((fee) => {
      // If all filters are empty, show all fees
      if (
        !filters.electionType &&
        !filters.level &&
        !filters.position &&
        !filters.positionPath &&
        !filters.category
      ) {
        return true;
      }

      // Filter by election type if set
      if (filters.electionType && fee.electionType !== filters.electionType) {
        return false;
      }

      // Filter by level if set
      if (filters.level && fee.level !== filters.level) {
        return false;
      }

      // Filter by position if set (using subType field which represents the position)
      if (filters.position && fee.subType !== filters.position) {
        return false;
      }

      // Filter by position path if set (partial match for flexibility)
      if (
        filters.positionPath &&
        !fee.positionPath
          ?.toLowerCase()
          .includes(filters.positionPath.toLowerCase())
      ) {
        return false;
      }

      // Filter by category if set
      if (filters.category && fee.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [fees, filters]);
  // Get unique election types and levels for filter dropdowns
  const uniqueElectionTypes = useMemo(() => {
    if (!fees || !Array.isArray(fees) || fees.length === 0) return [];

    // Extract all election types, filtering out undefined/empty values
    const types = fees
      .map((fee) => fee?.electionType)
      .filter((type) => type && typeof type === "string");

    // Get unique values
    return [...new Set(types)];
  }, [fees]);

  const uniqueLevels = useMemo(() => {
    if (!fees || !Array.isArray(fees) || fees.length === 0) return [];

    // Extract all levels, filtering out undefined/empty values
    const levels = fees
      .map((fee) => fee?.level)
      .filter((level) => level && typeof level === "string");

    // Get unique values
    return [...new Set(levels)];
  }, [fees]);

  // Get unique positions for filter dropdown
  const uniquePositions = useMemo(() => {
    if (!fees || !Array.isArray(fees) || fees.length === 0) return [];

    // Extract all positions (subType), filtering out undefined/empty values
    const positions = fees
      .map((fee) => fee?.subType)
      .filter((position) => position && typeof position === "string");

    // Get unique values
    return [...new Set(positions)];
  }, [fees]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    if (!fees || !Array.isArray(fees) || fees.length === 0) return [];

    // Extract all categories, filtering out undefined/empty values
    const categories = fees
      .map((fee) => fee?.category)
      .filter((category) => category && typeof category === "string");

    // Get unique values
    return [...new Set(categories)];
  }, [fees]);

  // Get unique position paths for filter dropdown
  const uniquePositionPaths = useMemo(() => {
    if (!fees || !Array.isArray(fees) || fees.length === 0) return [];

    // Extract all position paths, filtering out undefined/empty values
    const paths = fees
      .map((fee) => fee?.positionPath)
      .filter((path) => path && typeof path === "string");

    // Get unique values
    return [...new Set(paths)];
  }, [fees]);
  useEffect(() => {
    const newDropdownLevels: string[][] = [];
    if (formData.electionType) {
      let currentConfigNode = positionFeesConfig[formData.electionType];

      if (currentConfigNode && typeof currentConfigNode === "object") {
        newDropdownLevels.push(Object.keys(currentConfigNode));
      }

      for (let i = 0; i < formData.selectedPathSegments.length; i++) {
        const segment = formData.selectedPathSegments[i];
        if (
          currentConfigNode &&
          typeof currentConfigNode === "object" &&
          segment in currentConfigNode
        ) {
          currentConfigNode = currentConfigNode[segment];

          if (currentConfigNode && typeof currentConfigNode === "object") {
            newDropdownLevels.push(Object.keys(currentConfigNode));
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
    setDropdownLevels(newDropdownLevels);

    if (formData.electionType) {
      const path = [
        formData.electionType,
        ...formData.selectedPathSegments,
      ].join(".");
      setFormData((prev) => ({ ...prev, positionPath: path }));
    } else {
      setFormData((prev) => ({ ...prev, positionPath: "" }));
    }
  }, [formData.electionType, formData.selectedPathSegments]);

  const handleSegmentChange = (segmentIndex: number, value: string) => {
    const newSelectedSegments = formData.selectedPathSegments.slice(
      0,
      segmentIndex
    );
    if (value) {
      newSelectedSegments.push(value);
    }

    setFormData((prev) => ({
      ...prev,
      selectedPathSegments: newSelectedSegments,
    }));
  };

  const isFinalPositionSelected = () => {
    if (!formData.electionType || formData.selectedPathSegments.length === 0) {
      return false;
    }
    let currentLevel: any = positionFeesConfig[formData.electionType];
    for (const segment of formData.selectedPathSegments) {
      if (
        currentLevel &&
        typeof currentLevel === "object" &&
        segment in currentLevel
      ) {
        currentLevel = currentLevel[segment];
      } else {
        return false;
      }
    }
    return currentLevel === null;
  };
  const columns: GridColDef[] = [
    {
      field: "electionType",
      headerName: "Election Type",
      width: 150,
      renderCell: (params) => {
        const value = params.row?.electionType;
        return <div>{value ? value.replace(/_/g, " ") : "N/A"}</div>;
      },
    },
    {
      field: "level",
      headerName: "Level",
      width: 150,
      renderCell: (params) => {
        const value = params.row?.level;
        return <div>{value ? value.replace(/_/g, " ") : "N/A"}</div>;
      },
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => {
        const value = params.row?.category;
        return <div>{value ? value.replace(/_/g, " ") : "N/A"}</div>;
      },
    },
    {
      field: "subType",
      headerName: "Position",
      width: 150,
      renderCell: (params) => {
        const value = params.row?.subType;
        return <div>{value ? value.replace(/_/g, " ") : "N/A"}</div>;
      },
    },
    {
      field: "positionPath",
      headerName: "Position Path",
      width: 300,
      renderCell: (params) => {
        const value = params.row?.positionPath;
        return <div>{value || "N/A"}</div>;
      },
    },
    {
      field: "amount",
      headerName: "Fee Amount (UGX)",
      width: 150,
      renderCell: (params) => {
        const value = params.row?.amount;
        return (
          <div>
            {value !== undefined && value !== null
              ? Number(value).toLocaleString()
              : "N/A"}
          </div>
        );
      },
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <AlertCircle className="text-red-500" />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => {
        if (!params?.row) return null;

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(params.row)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit Fee"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSelectedFee(params.row);
                setShowHistory(true);
              }}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="View History"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];
  const handleEdit = (fee: any) => {
    setEditingFee(fee);
    setTempFee(fee.amount);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingFee) return;

    if (tempFee === null || tempFee < 0) {
      setOperationResult({
        success: false,
        message: "Invalid amount.",
      });
      return;
    }

    try {
      await updateFee({
        id: editingFee.id,
        updates: {
          amount: tempFee,
        },
      }).unwrap();

      setEditingFee(null);
      setShowEditModal(false);
      setTempFee(null);
      setOperationResult({
        success: true,
        message: "Fee updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update fee",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinalPositionSelected()) {
      setOperationResult({
        success: false,
        message: "Please select a complete position path to define a fee.",
      });
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) < 0) {
      setOperationResult({
        success: false,
        message: "Please enter a valid, non-negative amount.",
      });
      return;
    }

    const payloadElectionType = formData.electionType;
    if (!payloadElectionType) {
      setOperationResult({
        success: false,
        message:
          "Top-level Election Type (e.g., PRIMARIES, INTERNAL_PARTY) is not selected.",
      });
      return;
    }

    const positionNameSubType =
      formData.selectedPathSegments[formData.selectedPathSegments.length - 1];
    if (!positionNameSubType) {
      setOperationResult({
        success: false,
        message:
          "The specific position name (subType) is missing from the end of the path.",
      });
      return;
    }

    const electionLevel = formData.selectedPathSegments[0]; // This is the first segment after the electionType, e.g., DISTRICT_LEVEL_POSITIONS
    if (!electionLevel) {
      setOperationResult({
        success: false,
        message:
          "The election level (e.g., DISTRICT_LEVEL_POSITIONS) is missing from the path.",
      });
      return;
    }

    const feePayload = {
      positionPath: formData.positionPath,
      amount: parseFloat(formData.amount),
      isActive: true,
      electionType: payloadElectionType,
      level: electionLevel, // Add the level to the payload
      subType: positionNameSubType,
    };
    console.log("Fee Payload:", feePayload); // Debugging line to check the payload before sending it

    try {
      await createFee(feePayload).unwrap();
      setOperationResult({
        success: true,
        message: "Fee created successfully.",
      });
      setShowForm(false);
      setFormData({
        electionType: "",
        selectedPathSegments: [],
        positionPath: "",
        amount: "",
      });
      setEditingId(null);
      setTempFee(null);
    } catch (err: any) {
      setOperationResult({
        success: false,
        message:
          err.data?.message ||
          "Failed to create fee. Please check details and try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      electionType: "",
      selectedPathSegments: [],
      positionPath: "",
      amount: "",
    });
    setEditingId(null);
    setTempFee(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {" "}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Fee Settings Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
            title="Filter Fees"
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
              setOperationResult(null);
            }}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors duration-150 ${
              showForm
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {showForm ? (
              <span className="flex items-center">
                <X className="h-5 w-5 mr-2" /> Cancel
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="h-5 w-5 mr-2" /> Add New Fee
              </span>
            )}
          </button>
        </div>
      </div>
      {operationResult && (
        <div
          className={`p-4 mb-4 rounded-md text-sm ${
            operationResult.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
          role="alert"
        >
          <span className="font-medium">
            {operationResult.success ? "Success!" : "Error!"}
          </span>{" "}
          {operationResult.message}
        </div>
      )}
      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            {editingId ? "Edit Fee" : "Create New Fee"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="electionType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Election Type
              </label>
              <select
                id="electionType"
                name="electionType"
                value={formData.electionType}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    electionType: e.target.value as ElectionType,
                    selectedPathSegments: [],
                    positionPath: "",
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Election Type</option>
                {Object.keys(positionFeesConfig).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {formData.electionType &&
              dropdownLevels.map(
                (options, levelIndex) =>
                  levelIndex <= formData.selectedPathSegments.length &&
                  options.length > 0 && (
                    <div key={`segment-dropdown-${levelIndex}`}>
                      <label
                        htmlFor={`segment-${levelIndex}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Level {levelIndex + 1} :{" "}
                        {formData.selectedPathSegments[levelIndex - 1] ||
                          formData.electionType}
                      </label>
                      <select
                        id={`segment-${levelIndex}`}
                        value={formData.selectedPathSegments[levelIndex] || ""}
                        onChange={(e) =>
                          handleSegmentChange(levelIndex, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required={
                          !isFinalPositionSelected() &&
                          levelIndex < dropdownLevels.length - 1
                        }
                      >
                        <option value="">Select Option</option>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
              )}

            {isFinalPositionSelected() && (
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fee Amount (UGX)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter fee amount"
                  required
                  min="0"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setOperationResult(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFinalPositionSelected() || !formData.amount}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {editingId ? "Update Fee" : "Save Fee"}
              </button>
            </div>
          </form>
        </div>
      )}{" "}
      {/* Filter Panel - Now positioned at the top of the table */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Filter Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Election Type
              </label>
              <select
                value={filters.electionType}
                onChange={(e) =>
                  setFilters({ ...filters, electionType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Election Types</option>
                {uniqueElectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) =>
                  setFilters({ ...filters, level: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Levels</option>
                {uniqueLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filters.position}
                onChange={(e) =>
                  setFilters({ ...filters, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Positions</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {position.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Path
              </label>
              <input
                type="text"
                value={filters.positionPath}
                onChange={(e) =>
                  setFilters({ ...filters, positionPath: e.target.value })
                }
                placeholder="Search position path..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredFees.length} of {fees?.length || 0} fees
            </div>
            <button
              onClick={() =>
                setFilters({
                  electionType: "",
                  level: "",
                  position: "",
                  positionPath: "",
                  category: "",
                })
              }
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md">
        {/* Display a message if there are no fees or they're still loading */}
        {filteredFees.length === 0 && !isLoading && (
          <div className="p-4 text-center text-gray-600">
            No fees found.{" "}
            {fees?.length
              ? "Try adjusting your filters."
              : 'Please add fees using the "Add New Fee" button.'}
          </div>
        )}
        {/* Stats information */}
        <div className="p-2 bg-gray-100 text-xs">
          <div>Total fees: {fees?.length || 0}</div>
          <div>Filtered fees: {filteredFees.length}</div>
        </div>
        <CustomDataGrid
          rows={filteredFees.map((fee) => ({
            ...fee,
            id: fee.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
          }))}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
      {/* Edit Modal */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Edit Fee</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Position</p>
              <p className="text-md">
                {editingFee.subType?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Election Type
              </p>
              <p className="text-md">
                {editingFee.electionType?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Level</p>
              <p className="text-md">
                {editingFee.level?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Path</p>
              <p className="text-md truncate" title={editingFee.positionPath}>
                {editingFee.positionPath}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Amount (UGX)
              </label>
              <input
                type="number"
                value={tempFee ?? ""}
                onChange={(e) => setTempFee(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeSettingsDashboard;
