import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import {
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetSubcountyDivisionsQuery,
  useGetParishWardsQuery,
  useGetVillagesByParishQuery,
} from "../../store/api/baseApi";
import primariesElectionsConfig from "../../config/primaries_elections_config.json";

interface CandidateFormModalProps {
  open: boolean;
  onClose: () => void;
  candidate: any;
  setCandidate: (candidate: any) => void;
  onSave: () => void;
  isEditing: boolean;
  title: string;
  level: string;
  // Category and Position fields
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  subcategories: string[];
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  positions: string[];
  selectedPosition: string;
  setSelectedPosition: (position: string) => void;
  isDirectPosition: boolean;
  isSubcategory: boolean;
  subcategoryIsDirectPosition: boolean;
  positionFieldName: string;
  categoryFieldName: string;
}

const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  open,
  onClose,
  candidate,
  setCandidate,
  onSave,
  isEditing,
  title,
  level,
  categories,
  selectedCategory,
  setSelectedCategory,
  subcategories,
  selectedSubcategory,
  setSelectedSubcategory,
  positions,
  selectedPosition,
  setSelectedPosition,
  isDirectPosition,
  isSubcategory,
  subcategoryIsDirectPosition,
  positionFieldName,
  categoryFieldName
}) => {
  if (!open) return null;
  // Utility function to build expected position path
  const buildExpectedPositionPath = (candidateData: any, level: string) => {
    if (!candidateData.category) return "";
    
    const categoryValue = primariesElectionsConfig?.PRIMARIES?.[level]?.[candidateData.category];
    
    if (categoryValue === null) {
      // Direct position
      return `PRIMARIES.${level}.${candidateData.category}`;
    } else if (candidateData.subcategory) {
      const subcategoryValue = categoryValue?.[candidateData.subcategory];
      
      if (subcategoryValue === null) {
        // Direct subcategory position
        return `PRIMARIES.${level}.${candidateData.category}.${candidateData.subcategory}`;
      } else if (candidateData.position) {
        // Regular nested position
        return `PRIMARIES.${level}.${candidateData.category}.${candidateData.subcategory}.${candidateData.position}`;
      }
    }
    
    return "";
  };

  // Form validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Admin unit selection state and API queries
  const { data: regions = [] } = useGetRegionsQuery();
  
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(
    candidate?.regionId
  );
  
  const { data: subregions = [] } = useGetSubregionsQuery();
  
  const [selectedSubregionId, setSelectedSubregionId] = useState<number | undefined>(
    candidate?.subregionId
  );
  
  const { data: districts = [] } = useGetDistrictsQuery();
  
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>(
    candidate?.districtId
  );
  
  const { data: constituencies = [] } = useGetConstituenciesAndMunicipalitiesQuery();
  
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | undefined>(
    candidate?.constituencyMunicipalityId
  );
  
  const { data: subcounties = [] } = useGetSubcountyDivisionsQuery();
  
  const [selectedSubcountyId, setSelectedSubcountyId] = useState<number | undefined>(
    candidate?.subcountyDivisionId
  );
  
  const { data: parishes = [] } = useGetParishWardsQuery();
  
  const [selectedParishId, setSelectedParishId] = useState<number | undefined>(
    candidate?.parishWardId
  );
    const { data: villages = { villageCells: [] } } = useGetVillagesByParishQuery(selectedParishId || 0, {
    skip: !selectedParishId
  });  // Initialize the fields when editing
  useEffect(() => {
    if (isEditing && candidate) {
      // Set administrative units
      setSelectedRegionId(candidate.regionId);
      setSelectedSubregionId(candidate.subregionId);
      setSelectedDistrictId(candidate.districtId);
      setSelectedConstituencyId(candidate.constituencyMunicipalityId);
      setSelectedSubcountyId(candidate.subcountyDivisionId);
      setSelectedParishId(candidate.parishWardId);
        // First check if this is a direct category position
      const categoryValue = level && candidate.category ? 
        primariesElectionsConfig?.PRIMARIES?.[level]?.[candidate.category] : undefined;
      const isDirectCategory = categoryValue === null;
        
      console.log("Initializing edit form - Category:", candidate.category, "Position:", candidate.position, "Is direct:", isDirectCategory);
      console.log("Category value:", categoryValue);
      
      if (isDirectCategory) {
        // Direct position - ensure position matches category
        setSelectedPosition(candidate.category);
        
        // Fix any inconsistency in the data
        if (candidate.position !== candidate.category) {
          console.log("Fixing position mismatch for direct category:", candidate.category);
          setCandidate({
            ...candidate,
            position: candidate.category,
            subcategory: null  // Ensure subcategory is cleared for direct positions
          });
        }
      } else if (isSubcategory && candidate.position && categoryValue) {
        // Check if the position is a direct subcategory
        const subcategoryKeys = Object.keys(categoryValue);
        for (const subcategory of subcategoryKeys) {
          if (categoryValue[subcategory] === null && subcategory === candidate.position) {
            setSelectedSubcategory(subcategory);
            setSelectedPosition(subcategory);
            break;
          }
        }
        
        // If not a direct subcategory, find the correct subcategory for this position
        if (!selectedSubcategory) {
          for (const subcategory of subcategoryKeys) {
            const subCatValue = categoryValue[subcategory];
            if (subCatValue && typeof subCatValue === 'object' && 
                Object.keys(subCatValue).includes(candidate.position)) {
              setSelectedSubcategory(subcategory);
              setSelectedPosition(candidate.position);
              break;
            }
          }
        }
      }
      
      // For cases when we're editing and we have a position but not UI state yet
      if (candidate.position && !selectedPosition) {
        setSelectedPosition(candidate.position);
      }
    }
  }, [isEditing, candidate, isDirectPosition, subcategoryIsDirectPosition, selectedCategory, selectedSubcategory, level]);  // Special case handler to ensure direct positions are immediately fixed after selection
  useEffect(() => {
    if (candidate && candidate.category) {
      const categoryValue = level && candidate.category ? 
        primariesElectionsConfig?.PRIMARIES?.[level]?.[candidate.category] : undefined;
      const isDirectCategory = categoryValue === null;
        
      console.log("Position path check - Category:", candidate.category, "Is direct:", isDirectCategory);
      console.log("Category value:", categoryValue);
      
      // Build proper position path for the API using the utility function
      const expectedPath = buildExpectedPositionPath(candidate, level);
      
      if (isDirectCategory) {
        // Direct position format: PRIMARIES.LEVEL.POSITION (e.g., PRIMARIES.VILLAGE_CELL.LC1)
        console.log("Setting direct position path:", expectedPath);
        setCandidate({
          ...candidate,
          positionPath: expectedPath,
          position: candidate.category,  // Ensure position matches category for direct positions
          subcategory: null  // Clear subcategory for direct positions
        });
      } else if (candidate.subcategory && candidate.position && categoryValue) {
        // Position with subcategory: PRIMARIES.LEVEL.CATEGORY.SUBCATEGORY.POSITION
        // (e.g., PRIMARIES.VILLAGE_CELL.SIG_COMMITTEE.YOUTH.CHAIRPERSON)
        const subcategoryValue = categoryValue[candidate.subcategory];
        
        if (subcategoryValue === null) {
          // Direct subcategory (subcategory is the position)
          console.log("Setting direct subcategory position path:", expectedPath);
          setCandidate({
            ...candidate,
            positionPath: expectedPath,
            position: candidate.subcategory
          });
        } else {
          // Regular nested position
          console.log("Setting regular position path:", expectedPath);
          setCandidate({
            ...candidate,
            positionPath: expectedPath
          });
        }
      }
      
      // Validate position path consistency
      if (candidate.positionPath && candidate.positionPath !== expectedPath) {
        console.warn(`Position path mismatch detected. Expected: ${expectedPath}, Current: ${candidate.positionPath}`);
        if (expectedPath) {
          setCandidate({
            ...candidate,
            positionPath: expectedPath
          });
        }
      }
    }
  }, [candidate?.category, candidate?.subcategory, candidate?.position, level]);

  // Update the candidate object when admin units change
  useEffect(() => {
    setCandidate({
      ...candidate,
      regionId: selectedRegionId,
      subregionId: selectedSubregionId,
      districtId: selectedDistrictId,
      constituencyMunicipalityId: selectedConstituencyId,
      subcountyDivisionId: selectedSubcountyId,
      parishWardId: selectedParishId,
    });
  }, [
    selectedRegionId,
    selectedSubregionId,
    selectedDistrictId,
    selectedConstituencyId,
    selectedSubcountyId,
    selectedParishId
  ]);


   console.log("Candidate form modal initialized with candidate:", candidate);  // Category/Position selection handlers
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setSelectedPosition("");
    
    const categoryValue = level && category ? 
      primariesElectionsConfig?.PRIMARIES?.[level]?.[category] : undefined;
    const isDirectCategory = categoryValue === null;
    
    console.log("Category changed:", category, "Is direct position:", isDirectCategory);
    console.log("Category value:", categoryValue);
    
    // If it's a direct position (no subcategories/positions)
    if (isDirectCategory) {
      // For direct positions, set both category and position to the same value
      console.log("Setting direct position - category and position both set to:", category);
      setSelectedPosition(category); // Update the UI state first
      
      // Then update the data model
      setCandidate((prevCandidate) => ({
        ...prevCandidate,
        category: category,
        subcategory: null, // Clear subcategory for direct positions
        position: category,
        positionPath: `PRIMARIES.${level}.${category}` // Set correct position path for direct positions
      }));
      
      // Clear any validation error if it was related to position
      if (validationError === "Position is required") {
        setValidationError(null);
      }
    } else {
      setCandidate((prevCandidate) => ({
        ...prevCandidate,
        category: category,
        subcategory: null, // Clear subcategory when changing category
        position: ""
      }));
    }
  };
  
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setSelectedPosition("");
    
    const categoryObj = level && selectedCategory ? 
      (primariesElectionsConfig?.PRIMARIES?.[level]?.[selectedCategory] || {}) : {};
    
    console.log("Subcategory changed:", subcategory, "Is direct position:", categoryObj[subcategory] === null);
        // If subcategory is a direct position
    if (categoryObj[subcategory] === null) {
      console.log("Direct subcategory selected - setting position to:", subcategory);
      // Set UI state first
      setSelectedPosition(subcategory);
      
      // Then update the data model
      setCandidate((prevCandidate) => ({
        ...prevCandidate,
        category: selectedCategory,
        subcategory: subcategory,  // Ensure subcategory is set for direct subcategory positions
        position: subcategory
      }));
      
      // Clear any validation error if it was related to position
      if (validationError === "Position is required") {
        setValidationError(null);
      }    } else {
      setCandidate((prevCandidate) => ({
        ...prevCandidate,
        category: selectedCategory,
        subcategory: subcategory,  // Set subcategory for non-direct subcategory positions
        position: ""
      }));
    }
  };
  
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const position = e.target.value;
    setSelectedPosition(position);
      // Update the position in the model and clear any related validation errors
    setCandidate({
      ...candidate,
      category: selectedCategory,
      subcategory: selectedSubcategory,  // Ensure subcategory is maintained when position is selected
      position: position
    });
    
    // Clear position validation error if it exists
    if (validationError === "Position is required") {
      setValidationError(null);
    }
    
    console.log("Position manually selected:", position);
  };

  // Candidate details update handlers
  const updateCandidateField = (field: string, value: string) => {
    console.log("Candidate field updated -----", field, value);
    setCandidate({
      ...candidate,
      candidate: {
        ...candidate.candidate,
        [field]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto">          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are required.
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category and Position Selection */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-3">Position Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                {/* Category Selection */}                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={`w-full border ${!candidate.category && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                  >                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>{/* Subcategory Selection (if applicable) */}
                {isSubcategory && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">Subcategory</label>
                    <select
                      value={selectedSubcategory}
                      onChange={handleSubcategoryChange}
                      className="w-full border p-2.5 rounded"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub} value={sub}>                        {sub.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}{/* Position Selection (if applicable) */}
                {/* Show editable position dropdown for non-direct positions */}
                {isSubcategory && !subcategoryIsDirectPosition && selectedSubcategory && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">Position</label>
                    <select
                      value={selectedPosition}
                      onChange={handlePositionChange}
                      className="w-full border p-2.5 rounded"
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                  {/* Show read-only position field for direct positions */}
                {((isDirectPosition && selectedCategory) || 
                  (isSubcategory && subcategoryIsDirectPosition && selectedSubcategory)) && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Position <span className="text-green-600">(Auto-selected)</span>
                    </label>
                    <div className="w-full border border-green-200 bg-green-50 p-2.5 rounded text-gray-700 flex items-center">
                      <span className="bg-green-100 rounded-full px-2 py-1 text-xs text-green-800 mr-2">Auto</span>
                      {isDirectPosition && selectedCategory 
                        ? selectedCategory.replace(/_/g, " ")
                        : selectedSubcategory.replace(/_/g, " ")}
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                      This position is automatically set when you select the {isDirectPosition ? "category" : "subcategory"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">                <div>
                  <label className="block mb-1 text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </label>                  <input
                    type="text"
                    value={candidate.candidate?.firstName || ""}
                    onChange={(e) => updateCandidateField("firstName", e.target.value)}
                    className={`w-full border ${!candidate.candidate?.firstName && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    placeholder="First Name"
                  />
                </div>                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </label>                  <input
                    type="text"
                    value={candidate.candidate?.lastName || ""}
                    onChange={(e) => updateCandidateField("lastName", e.target.value)}
                    className={`w-full border ${!candidate.candidate?.lastName && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    placeholder="Last Name"
                  />
                </div>                <div>
                  <label className="block mb-1 text-sm font-medium">
                    NIN Number <span className="text-red-500">*</span>
                  </label>                  <input
                    type="text"
                    value={candidate.candidate?.ninNumber || ""}
                    onChange={(e) => updateCandidateField("ninNumber", e.target.value)}
                    className={`w-full border ${!candidate.candidate?.ninNumber && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    placeholder="NIN Number"
                  />
                </div>                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>                  <input
                    type="tel"
                    value={candidate.candidate?.phoneNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\+?\d*$/.test(value) && value.length <= 13) {
                        updateCandidateField("phoneNumber", value);
                      }
                    }}
                    className={`w-full border ${!candidate.candidate?.phoneNumber && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    placeholder="+256XXXXXXXXX or 0XXXXXXXXX"
                  />
                </div>                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>                  <select
                    value={candidate.candidate?.gender || ""}
                    onChange={(e) => updateCandidateField("gender", e.target.value)}
                    className={`w-full border ${!candidate.candidate?.gender && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={candidate.candidate?.dateOfBirth || ""}
                    onChange={(e) => updateCandidateField("dateOfBirth", e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded"
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Level of Education
                  </label>
                  <select
                    value={candidate.candidate?.levelOfEducation || ""}
                    onChange={(e) => updateCandidateField("levelOfEducation", e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded"
                  >
                    <option value="">Select Education Level</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary (O-Level)</option>
                    <option value="Advanced">Advanced (A-Level)</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Administrative Units */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-3">Administrative Units</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Region Selection */}                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Region <span className="text-red-500">*</span>
                  </label>                  <select
                    value={selectedRegionId || ""}
                    onChange={(e) => {
                      const regionId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedRegionId(regionId);
                      // Reset lower-level selections
                      setSelectedSubregionId(undefined);
                      setSelectedDistrictId(undefined);
                      setSelectedConstituencyId(undefined);
                      setSelectedSubcountyId(undefined);
                      setSelectedParishId(undefined);
                    }}
                    className={`w-full border ${!selectedRegionId && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subregion Selection */}
                {selectedRegionId && (                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Subregion <span className="text-red-500">*</span>
                    </label>                    <select
                      value={selectedSubregionId || ""}
                      onChange={(e) => {
                        const subregionId = e.target.value ? Number(e.target.value) : undefined;
                        setSelectedSubregionId(subregionId);
                        // Reset lower-level selections
                        setSelectedDistrictId(undefined);
                        setSelectedConstituencyId(undefined);
                        setSelectedSubcountyId(undefined);
                        setSelectedParishId(undefined);
                      }}
                      className={`w-full border ${!selectedSubregionId && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    >
                      <option value="">Select Subregion</option>
                      {subregions
                        ?.filter((subregion) => subregion.regionId === selectedRegionId)
                        .map((subregion) => (
                          <option key={subregion.id} value={subregion.id}>
                            {subregion.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* District Selection */}
                {selectedSubregionId && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrictId || ""}
                      onChange={(e) => {
                        const districtId = e.target.value ? Number(e.target.value) : undefined;
                        setSelectedDistrictId(districtId);
                        // Reset lower-level selections
                        setSelectedConstituencyId(undefined);
                        setSelectedSubcountyId(undefined);
                        setSelectedParishId(undefined);
                      }}
                      className={`w-full border ${!selectedDistrictId && validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2.5 rounded`}
                    >
                      <option value="">Select District</option>
                      {districts
                        ?.filter((district) => district.subregionId === selectedSubregionId)
                        .map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Constituency/Municipality Selection */}
                {selectedDistrictId && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Constituency/Municipality
                    </label>
                    <select
                      value={selectedConstituencyId || ""}
                      onChange={(e) => {
                        const constituencyId = e.target.value ? Number(e.target.value) : undefined;
                        setSelectedConstituencyId(constituencyId);
                        // Reset lower-level selections
                        setSelectedSubcountyId(undefined);
                        setSelectedParishId(undefined);
                      }}
                      className="w-full border p-2.5 rounded"
                    >
                      <option value="">Select Constituency/Municipality</option>
                      {constituencies
                        ?.filter((constituency) => constituency.districtId === selectedDistrictId)
                        .map((constituency) => (
                        <option key={constituency.id} value={constituency.id}>
                          {constituency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subcounty/Division Selection */}
                {selectedConstituencyId && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Subcounty/Division
                    </label>
                    <select
                      value={selectedSubcountyId || ""}
                      onChange={(e) => {
                        const subcountyId = e.target.value ? Number(e.target.value) : undefined;
                        setSelectedSubcountyId(subcountyId);
                        // Reset lower-level selection
                        setSelectedParishId(undefined);
                      }}
                      className="w-full border p-2.5 rounded"
                    >                      <option value="">Select Subcounty/Division</option>
                      {subcounties
                        ?.filter((subcounty) => subcounty.constituencyDivisionId === selectedConstituencyId)
                        .map((subcounty) => (
                          <option key={subcounty.id} value={subcounty.id}>
                            {subcounty.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Parish/Ward Selection */}
                {selectedSubcountyId && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Parish/Ward
                    </label>
                    <select
                      value={selectedParishId || ""}
                      onChange={(e) => {
                        const parishId = e.target.value ? Number(e.target.value) : undefined;
                        setSelectedParishId(parishId);
                      }}
                      className="w-full border p-2.5 rounded"
                    >
                      <option value="">Select Parish/Ward</option>
                      {parishes
                        ?.filter((parish) => parish.subcountyDivisionId === selectedSubcountyId)
                        .map((parish) => (
                        <option key={parish.id} value={parish.id}>
                          {parish.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Village/Cell Selection */}
                {selectedParishId && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Village/Cell
                    </label>                    <select
                      value={candidate.villageCellId || ""}
                      onChange={(e) => {
                        const villageId = e.target.value ? Number(e.target.value) : undefined;
                        setCandidate({
                          ...candidate,
                          villageCellId: villageId
                        });
                      }}
                      className="w-full border p-2.5 rounded"
                    >
                      <option value="">Select Village/Cell</option>
                      {villages?.villageCells?.map((village) => (
                        <option key={village.id} value={village.id}>
                          {village.name}
                        </option>
                      )) || []}
                    </select>
                  </div>
                )}
              </div>
            </div>          </div>
            {/* Validation error message */}
          {validationError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start shadow-sm">
              <AlertCircle className="text-red-600 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Form Validation Error</p>
                <p className="text-red-700">{validationError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button              onClick={() => {
                // Validate required fields
                const phoneRegex = /^(\+256|0)[1-9][0-9]{8}$/;
                console.log("Candidate object -----", candidate);
                if (!candidate.candidate?.firstName) {
                  setValidationError("First name is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                
                if (!candidate.candidate?.lastName) {
                  setValidationError("Last name is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                  if (!candidate.candidate?.ninNumber) {
                  setValidationError("NIN number is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                
                if (!candidate.candidate?.phoneNumber) {
                  setValidationError("Phone number is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                
                if (!phoneRegex.test(candidate.candidate?.phoneNumber || "")) {
                  setValidationError("Please enter a valid Ugandan phone number (e.g., +256712345678 or 0712345678)");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                  if (!candidate.category) {
                  setValidationError("Election category is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }                // Check if position is required
                // For direct positions (where position should equal category)
                const categoryValue = level && candidate.category ? 
                  primariesElectionsConfig?.PRIMARIES?.[level]?.[candidate.category] : undefined;
                const isDirectPosition = categoryValue === null;
                
                console.log("Validation - Category:", candidate.category, "Position:", candidate.position, "Is direct:", isDirectPosition);
                console.log("Category value:", categoryValue);
                console.log(candidate)
                
                // Fix inconsistencies immediately before validation
                if (isDirectPosition) {
                  // This is a direct position, position should equal category and subcategory should be null
                  if (candidate.position !== candidate.category || candidate.subcategory !== null) {
                    console.log("Auto-fixing direct position mismatch during validation");
                    // Update both the state and form model
                    setSelectedPosition(candidate.category);
                    setSelectedSubcategory(null);
                    setCandidate((prevCandidate) => ({
                      ...prevCandidate,
                      position: candidate.category,
                      subcategory: null
                    }));
                    // Continue with validation - no need to return since we fixed it
                  }                } else if (isSubcategory && selectedSubcategory) {
                  // Check if subcategory is a direct position
                  const subcategoryValue = categoryValue?.[selectedSubcategory];
                  if (subcategoryValue === null && candidate.position !== selectedSubcategory) {
                    console.log("Auto-fixing subcategory direct position mismatch during validation");
                    // Update both the state and form model
                    setSelectedPosition(selectedSubcategory);
                    setCandidate((prevCandidate) => ({
                      ...prevCandidate,
                      position: selectedSubcategory
                    }));
                    // Continue with validation - no need to return since we fixed it
                  }
                } else if (!candidate.position) {
                  // Position is still required for non-direct positions
                  console.log(candidate)
                  setValidationError("Position is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                
                if (!selectedRegionId) {
                  setValidationError("Region is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }                if (!selectedSubregionId) {
                  setValidationError("Subregion is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                  if (!selectedDistrictId) {
                  setValidationError("District is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                  if (!candidate.candidate?.gender) {
                  setValidationError("Gender is required");
                  document.querySelector('.bg-red-50')?.scrollIntoView({ behavior: 'smooth' });
                  return;
                }                // If all validations pass, perform a final check on position consistency
                // This ensures that direct position values are set even if our other checks missed something
                if (candidate.category) {
                  const finalCategoryObj = level && candidate.category ? 
                    (primariesElectionsConfig?.PRIMARIES?.[level]?.[candidate.category] || {}) : {};
                  
                  // Final check for direct positions
                  if (finalCategoryObj === null && candidate.position !== candidate.category) {
                    console.log("Final check caught a direct position mismatch - fixing before save");
                    setCandidate((prevCandidate) => ({
                      ...prevCandidate,
                      position: candidate.category,
                      subcategory: null
                    }));
                  }
                  
                  // Final position path validation
                  const expectedPath = buildExpectedPositionPath(candidate, level);
                  if (expectedPath && candidate.positionPath !== expectedPath) {
                    console.log("Final position path validation - correcting path from", candidate.positionPath, "to", expectedPath);
                    setCandidate((prevCandidate) => ({
                      ...prevCandidate,
                      positionPath: expectedPath
                    }));
                  }
                }
                
                // Clear any errors and proceed with save
                setValidationError(null);
                onSave();
              }}
              className="px-5 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFormModal;
