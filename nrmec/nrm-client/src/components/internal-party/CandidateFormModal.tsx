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
import internalPartyElectionsConfig from "../../config/intenal_party_elections_config.json";

interface CandidateFormModalProps {
  isOpen: boolean;
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
  // Added nested category support
  hasNestedCategories?: boolean;
  nestedCategories?: string[];
  selectedNestedCategory?: string;
  setSelectedNestedCategory?: (nestedCategory: string) => void;
  positionFieldName: string;
  categoryFieldName: string;
}

const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
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
  hasNestedCategories,
  nestedCategories,
  selectedNestedCategory,
  setSelectedNestedCategory,
  positionFieldName,
  categoryFieldName
}) => {
  if (!isOpen) return null;
  
  // Form validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Note: "Region/League Type" has been renamed to "Subcategory 2" for UI consistency
  
  // Position field read-only state (when a position is auto-selected)
  const [isPositionReadOnly, setIsPositionReadOnly] = useState<boolean>(false);
  
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
  

  console.log("Selected Parish ID:", selectedParishId);
 const { data: villages = { villageCells: [] } } = useGetVillagesByParishQuery(selectedParishId || 0, {
    skip: !selectedParishId
  });
  
  const [selectedVillageId, setSelectedVillageId] = useState<number | undefined>(
    candidate?.villageCellId
  );
  // Update candidate state when selections change
  useEffect(() => {
    setCandidate({
      ...candidate,
      regionId: selectedRegionId,
      subregionId: selectedSubregionId,
      districtId: selectedDistrictId,
      constituencyMunicipalityId: selectedConstituencyId,
      subcountyDivisionId: selectedSubcountyId,
      parishWardId: selectedParishId,
      villageCellId: selectedVillageId,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      nestedCategory: selectedNestedCategory,
      position: selectedPosition,
    });
  }, [
    selectedRegionId,
    selectedSubregionId,
    selectedDistrictId,
    selectedConstituencyId,
    selectedSubcountyId,
    selectedParishId,
    selectedVillageId,
    selectedCategory,
    selectedSubcategory,
    selectedNestedCategory,
    selectedPosition,
  ]);
  // Reset dependent selections when parent changes
  useEffect(() => {
    if (!selectedRegionId) {
      setSelectedSubregionId(undefined);
      setSelectedDistrictId(undefined);
      setSelectedConstituencyId(undefined);
      setSelectedSubcountyId(undefined);
      setSelectedParishId(undefined);
      setSelectedVillageId(undefined);
    }
  }, [selectedRegionId]);

  useEffect(() => {
    if (!selectedSubregionId) {
      setSelectedDistrictId(undefined);
      setSelectedConstituencyId(undefined);
      setSelectedSubcountyId(undefined);
      setSelectedParishId(undefined);
      setSelectedVillageId(undefined);
    }
  }, [selectedSubregionId]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setSelectedConstituencyId(undefined);
      setSelectedSubcountyId(undefined);
      setSelectedParishId(undefined);
      setSelectedVillageId(undefined);
    }
  }, [selectedDistrictId]);
  
  // Clear subcategory selections when category changes
  useEffect(() => {
    if (setSelectedSubcategory) {
      setSelectedSubcategory("");
    }
    if (setSelectedNestedCategory) {
      setSelectedNestedCategory("");
    }
    if (setSelectedPosition) {
      setSelectedPosition("");
    }
  }, [selectedCategory, setSelectedSubcategory, setSelectedNestedCategory, setSelectedPosition]);

  // Clear nested category and position when subcategory changes
  useEffect(() => {
    if (setSelectedNestedCategory) {
      setSelectedNestedCategory("");
    }
    if (setSelectedPosition) {
      setSelectedPosition("");
    }
  }, [selectedSubcategory, setSelectedNestedCategory, setSelectedPosition]);
  // Clear position when nested category changes
  useEffect(() => {
    if (setSelectedPosition) {
      setSelectedPosition("");
      setIsPositionReadOnly(false);
    }
  }, [selectedNestedCategory, setSelectedPosition]);
  
  // Auto-select position if there's only one option
  useEffect(() => {
    if (positions.length === 1 && setSelectedPosition) {
      setSelectedPosition(positions[0]);
      setIsPositionReadOnly(true);
    } else {
      setIsPositionReadOnly(false);
    }
  }, [positions, setSelectedPosition]);

  useEffect(() => {
    if (!selectedConstituencyId) {
      setSelectedSubcountyId(undefined);
      setSelectedParishId(undefined);
      setSelectedVillageId(undefined);
    }
  }, [selectedConstituencyId]);

  useEffect(() => {
    if (!selectedSubcountyId) {
      setSelectedParishId(undefined);
      setSelectedVillageId(undefined);
    }
  }, [selectedSubcountyId]);

  useEffect(() => {
    if (!selectedParishId) {
      setSelectedVillageId(undefined);
    }
  }, [selectedParishId]);

  // Handle candidate field changes
  const handleCandidateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('candidate.')) {
      const candidateField = name.split('.')[1];
      setCandidate({
        ...candidate,
        candidate: {
          ...candidate.candidate,
          [candidateField]: value
        }
      });
    } else {
      setCandidate({
        ...candidate,
        [name]: value
      });
    }
  };
  // Handle save
  const handleSave = () => {
    // Validate form
    if (!candidate?.candidate?.firstName || 
        !candidate?.candidate?.lastName || 
        !candidate?.candidate?.ninNumber || 
        !candidate?.candidate?.phoneNumber) {
      setValidationError("Please fill in all required candidate fields");
      return;
    }

    if (!selectedCategory) {
      setValidationError("Please select a category");
      return;
    }    if (isSubcategory && !selectedSubcategory) {
      setValidationError("Please select a subcategory");
      return;
    }
    
    // Add validation for nested categories
    if (hasNestedCategories && !selectedNestedCategory) {
      setValidationError("Please select a Subcategory 2");
      return;
    }

    if (!isDirectPosition && !subcategoryIsDirectPosition && !selectedPosition) {
      setValidationError("Please select a position");
      return;
    }

    // Level-specific validation for administrative units
    if (level === "VILLAGE_CELL" && !selectedVillageId) {
      setValidationError("Please select a village/cell");
      return;
    } else if (level === "PARISH_WARD" && !selectedParishId) {
      setValidationError("Please select a parish/ward");
      return;
    } else if (level === "SUBCOUNTY_DIVISION" && !selectedSubcountyId) {
      setValidationError("Please select a subcounty/division");
      return;
    } else if (level === "CONSTITUENCY_MUNICIPALITY" && !selectedConstituencyId) {
      setValidationError("Please select a constituency/municipality");
      return;
    } else if (level === "DISTRICT" && !selectedDistrictId) {
      setValidationError("Please select a district");
      return;
    } else if (level === "NATIONAL") {
      // For national level, no specific area is required
    }

    // Clear validation error and save
    setValidationError(null);
    onSave();
  };

  // Get filtered units based on parent selections
  const filteredSubregions = subregions?.filter(
    (subregion) => subregion.regionId === selectedRegionId
  );

  const filteredDistricts = districts?.filter(
    (district) => district.subregionId === selectedSubregionId
  );

  const filteredConstituencies = constituencies?.filter(
    (constituency) => constituency.districtId === selectedDistrictId
  );

  console.log("--->", selectedDistrictId);
  console.log("--->", selectedConstituencyId);
  const filteredSubcounties = subcounties?.filter(
    (subcounty) => subcounty.constituencyDivisionId === selectedConstituencyId
  );

  const filteredParishes = parishes?.filter(
    (parish) => parish.subcountyDivisionId === selectedSubcountyId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              name="candidate.firstName"
              value={candidate?.candidate?.firstName || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              name="candidate.lastName"
              value={candidate?.candidate?.lastName || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIN Number*
            </label>
            <input
              type="text"
              name="candidate.ninNumber"
              value={candidate?.candidate?.ninNumber || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="text"
              name="candidate.phoneNumber"
              value={candidate?.candidate?.phoneNumber || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="candidate.gender"
              value={candidate?.candidate?.gender || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="candidate.dateOfBirth"
              value={candidate?.candidate?.dateOfBirth || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level of Education
            </label>
            <select
              name="candidate.levelOfEducation"
              value={candidate?.candidate?.levelOfEducation || ""}
              onChange={handleCandidateChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <h3 className="text-lg font-semibold mb-2 border-b pb-2">Election Position</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {categoryFieldName || "Category"}*
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select {categoryFieldName || "Category"}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {isSubcategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory*
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Nested categories (Subcategory 2) */}
          {isSubcategory && hasNestedCategories && nestedCategories && nestedCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory 2*
              </label>
              <select
                value={selectedNestedCategory || ""}
                onChange={(e) => setSelectedNestedCategory && setSelectedNestedCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Subcategory 2</option>
                {nestedCategories.map((nestedCategory) => (
                  <option key={nestedCategory} value={nestedCategory}>
                    {nestedCategory.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}{!isDirectPosition && !subcategoryIsDirectPosition && positions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {positionFieldName || "Position"}*
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => !isPositionReadOnly && setSelectedPosition(e.target.value)}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isPositionReadOnly ? 'bg-gray-100' : ''
                }`}
                disabled={isPositionReadOnly}
                required
              >
                <option value="">Select {positionFieldName || "Position"}</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {isPositionReadOnly && (
                <p className="text-xs text-gray-500 mt-1">Position auto-selected as it's the only available option</p>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 border-b pb-2">Administrative Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={selectedRegionId || ""}
              onChange={(e) => setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Region</option>
              {regions.map((region: any) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subregion
            </label>
            <select
              value={selectedSubregionId || ""}
              onChange={(e) => setSelectedSubregionId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedRegionId}
            >
              <option value="">Select Subregion</option>
              {filteredSubregions?.map((subregion: any) => (
                <option key={subregion.id} value={subregion.id}>
                  {subregion.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
              {level === "DISTRICT" && " *"}
            </label>
            <select
              value={selectedDistrictId || ""}
              onChange={(e) => setSelectedDistrictId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedSubregionId}
              required={level === "DISTRICT"}
            >
              <option value="">Select District</option>
              {filteredDistricts?.map((district: any) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Constituency/Municipality
              {level === "CONSTITUENCY_MUNICIPALITY" && " *"}
            </label>
            <select
              value={selectedConstituencyId || ""}
              onChange={(e) => setSelectedConstituencyId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedDistrictId}
              required={level === "CONSTITUENCY_MUNICIPALITY"}
            >
              <option value="">Select Constituency/Municipality</option>
              {filteredConstituencies?.map((constituency: any) => (
                <option key={constituency.id} value={constituency.id}>
                  {constituency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcounty/Division
              {level === "SUBCOUNTY_DIVISION" && " *"}
            </label>
            <select
              value={selectedSubcountyId || ""}
              onChange={(e) => setSelectedSubcountyId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedConstituencyId}
              required={level === "SUBCOUNTY_DIVISION"}
            >
              <option value="">Select Subcounty/Division</option>
              {filteredSubcounties?.map((subcounty: any) => (
                <option key={subcounty.id} value={subcounty.id}>
                  {subcounty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parish/Ward
              {level === "PARISH_WARD" && " *"}
            </label>
            <select
              value={selectedParishId || ""}
              onChange={(e) => setSelectedParishId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedSubcountyId}
              required={level === "PARISH_WARD"}
            >
              <option value="">Select Parish/Ward</option>
              {filteredParishes?.map((parish: any) => (
                <option key={parish.id} value={parish.id}>
                  {parish.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Village/Cell
              {level === "VILLAGE_CELL" && " *"}
            </label>
            <select
              value={selectedVillageId || ""}
              onChange={(e) => setSelectedVillageId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedParishId}
              required={level === "VILLAGE_CELL"}
            >
              <option value="">Select Village/Cell</option>
              {villages?.villageCells?.map((village) => (
                        <option key={village.id} value={village.id}>
                          {village.name}
                        </option>
                      )) || []}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateFormModal;
