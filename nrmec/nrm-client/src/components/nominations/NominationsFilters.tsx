import React, { useState, useEffect } from "react";
import { ChevronDown, Filter } from "lucide-react";
import {
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetSubcountyDivisionsQuery,
  useGetParishWardsQuery,
  useGetVillageCellsQuery
} from "../../store/api/admin_units_api";

interface NominationsFiltersProps {
  electionType: "PRIMARIES" | "INTERNAL_PARTY";
  level: string;
  categories: string[];
  levelConfig: any;
  onFilterChange: (filters: any) => void;
}

const NominationsFilters: React.FC<NominationsFiltersProps> = ({
  electionType,
  level,
  categories,
  levelConfig,
  onFilterChange,
}) => {
  // State for filter values
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedNestedCategory, setSelectedNestedCategory] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<number | "">("");
  const [selectedSubregion, setSelectedSubregion] = useState<number | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState<number | "">("");
  const [selectedConstituencyMunicipality, setSelectedConstituencyMunicipality] = useState<number | "">("");
  const [selectedSubcountyDivision, setSelectedSubcountyDivision] = useState<number | "">("");
  const [selectedParishWard, setSelectedParishWard] = useState<number | "">("");
  const [selectedVillageCell, setSelectedVillageCell] = useState<number | "">("");
  const [feesPaidFilter, setFeesPaidFilter] = useState<string>("");
  const [nominationStatusFilter, setNominationStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);  // Get administrative units data
  const { data: regions = [] } = useGetRegionsQuery();
  const { data: subregions = [] } = useGetSubregionsQuery();
  const { data: districts = [] } = useGetDistrictsQuery();
  const { data: constituencyMunicipalities = [] } = useGetConstituenciesAndMunicipalitiesQuery();
  const { data: subcountyDivisions = [] } = useGetSubcountyDivisionsQuery();
  const { data: parishWards = [] } = useGetParishWardsQuery();
  const { data: villagesData = { villageCells: [] } } = useGetVillageCellsQuery({});
  const villageCells = villagesData.villageCells;

  // Filter subunits based on parent selection
  const filteredSubregions = selectedRegion
    ? subregions.filter((sr: any) => sr.regionId === selectedRegion)
    : subregions;

  const filteredDistricts = selectedSubregion
    ? districts.filter((d: any) => d.subregionId === selectedSubregion)
    : selectedRegion
    ? districts.filter((d: any) => {
        const subregion = subregions.find((sr: any) => sr.id === d.subregionId);
        return subregion && subregion.regionId === selectedRegion;
      })
    : districts;

  const filteredConstituencyMunicipalities = selectedDistrict
    ? constituencyMunicipalities.filter((cm: any) => cm.districtId === selectedDistrict)
    : constituencyMunicipalities;

  const filteredSubcountyDivisions = selectedConstituencyMunicipality
    ? subcountyDivisions.filter((sd: any) => sd.constituencyMunicipalityId === selectedConstituencyMunicipality)
    : selectedDistrict
    ? subcountyDivisions.filter((sd: any) => {
        const cm = constituencyMunicipalities.find((cm: any) => cm.id === sd.constituencyMunicipalityId);
        return cm && cm.districtId === selectedDistrict;
      })
    : subcountyDivisions;

  const filteredParishWards = selectedSubcountyDivision
    ? parishWards.filter((pw: any) => pw.subcountyDivisionId === selectedSubcountyDivision)
    : parishWards;

  const filteredVillageCells = selectedParishWard
    ? villageCells.filter((vc: any) => vc.parishWardId === selectedParishWard)
    : villageCells;

  // Logic for category/subcategory/position filters based on the selected category
  const categoryValue = levelConfig[selectedCategory];
  const isDirectPosition = categoryValue === null;
  
  // Handle subcategories (first level nesting)
  const subcategories = categoryValue && typeof categoryValue === "object"
    ? Object.keys(categoryValue)
    : [];
  const isSubcategory = subcategories.length > 0 && categoryValue && typeof categoryValue === "object";
  
  // Handle the subcategory value
  const subcategoryValue = isSubcategory ? categoryValue[selectedSubcategory] : null;
  const subcategoryIsDirectPosition = subcategoryValue === null;
  
  // Handle positions or further nesting
  const positions = [];
  let hasNestedCategories = false;
  let nestedCategories: string[] = [];

  // Dynamic analysis of the hierarchy
  if (subcategoryValue && typeof subcategoryValue === "object") {
    // Check if all values in this level are null (all are direct positions)
    const keys = Object.keys(subcategoryValue);
    const allValuesAreNull = keys.every(key => subcategoryValue[key] === null);
    
    // Check if at least one value is an object (might have nested structures)
    const hasObjectValues = keys.some(key => 
      subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
    );
    
    // Check if it's a mixed structure (some nulls, some objects)
    const isMixedStructure = !allValuesAreNull && !keys.every(key => 
      subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
    );
    
    if (allValuesAreNull) {
      // All items are positions, no further nesting needed
      keys.forEach(key => positions.push(key));
    } else if (hasObjectValues) {
      // Mixed structure or all objects - check the pattern
      hasNestedCategories = true;
      nestedCategories = keys;
      
      // If a nested category is selected, analyze its structure
      if (selectedNestedCategory) {
        const nestedValue = subcategoryValue[selectedNestedCategory];
        
        // Handle different nested value types
        if (nestedValue === null) {
          // This is a direct position at the nested level (no further selection needed)
        } else if (typeof nestedValue === "object") {
          // Check if all values at this nested level are null (all direct positions)
          const nestedKeys = Object.keys(nestedValue);
          const allNestedValuesAreNull = nestedKeys.every(key => nestedValue[key] === null);
          
          if (allNestedValuesAreNull) {
            // All nested values are direct positions
            nestedKeys.forEach(key => positions.push(key));
          } else {
            // Handle complex nested structures
            nestedKeys.forEach(key => {
              const finalValue = nestedValue[key];
              if (finalValue === null) {
                positions.push(key);
              }
            });
          }
        }
      }
    } else if (isMixedStructure) {
      // Mixed structure with some null values and some objects
      keys.forEach(key => {
        if (subcategoryValue[key] === null) {
          // This is a direct position
          positions.push(key);
        }
      });
      
      // Also identify nested categories
      hasNestedCategories = true;
      nestedCategories = keys.filter(key => 
        subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
      );
    } else {
      // Regular subcategory structure with position values
      Object.keys(subcategoryValue).forEach(key => positions.push(key));
    }
  }

  // Build positionPath based on current selections
  useEffect(() => {
    // Start with the base path
    let positionPath = `${electionType}.${level}`;
    
    // Add category if selected
    if (selectedCategory) {
      positionPath += `.${selectedCategory}`;
      
      // If this is a direct position, we're done
      if (isDirectPosition) {
        // This is the full path
      } else if (selectedSubcategory) {
        // Add subcategory
        positionPath += `.${selectedSubcategory}`;
        
        // If this is a direct position at subcategory level, we're done
        if (subcategoryIsDirectPosition) {
          // This is the full path
        } else if (hasNestedCategories && selectedNestedCategory) {
          // Add nested category
          positionPath += `.${selectedNestedCategory}`;
          
          // Check if we need to add a final position
          const nestedValue = subcategoryValue?.[selectedNestedCategory];
          if (nestedValue && typeof nestedValue === 'object' && selectedPosition) {
            // Add position
            positionPath += `.${selectedPosition}`;
          }
        } else if (selectedPosition) {
          // Add position
          positionPath += `.${selectedPosition}`;
        }
      }
    }

    // Build filter object
    const filters: any = {
      ...(positionPath !== `${electionType}.${level}` && { positionPath }),
      ...(selectedRegion !== "" && { regionId: selectedRegion }),
      ...(selectedSubregion !== "" && { subregionId: selectedSubregion }),
      ...(selectedDistrict !== "" && { districtId: selectedDistrict }),
      ...(selectedConstituencyMunicipality !== "" && {
        constituencyMunicipalityId: selectedConstituencyMunicipality,
      }),
      ...(selectedSubcountyDivision !== "" && {
        subcountyDivisionId: selectedSubcountyDivision,
      }),
      ...(selectedParishWard !== "" && { parishWardId: selectedParishWard }),
      ...(selectedVillageCell !== "" && { villageCellId: selectedVillageCell }),
      ...(feesPaidFilter !== "" && { feesPaid: feesPaidFilter === "paid" }),
      ...(nominationStatusFilter !== "" && { nominated: nominationStatusFilter === "nominated" }),
    };

    onFilterChange(filters);
  }, [
    electionType,
    level,
    selectedCategory,
    selectedSubcategory,
    selectedPosition,
    selectedNestedCategory,
    selectedRegion,
    selectedSubregion,
    selectedDistrict,
    selectedConstituencyMunicipality,
    selectedSubcountyDivision,
    selectedParishWard,
    selectedVillageCell,
    feesPaidFilter,
    nominationStatusFilter,
    isDirectPosition,
    subcategoryIsDirectPosition,
    hasNestedCategories,
    subcategoryValue,
    onFilterChange,
  ]);

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedPosition("");
    setSelectedNestedCategory("");
    setSelectedRegion("");
    setSelectedSubregion("");
    setSelectedDistrict("");
    setSelectedConstituencyMunicipality("");
    setSelectedSubcountyDivision("");
    setSelectedParishWard("");
    setSelectedVillageCell("");
    setFeesPaidFilter("");
    setNominationStatusFilter("");
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>
        <button
          className="text-sm flex items-center text-primary-600 hover:text-primary-700"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide" : "Show"} Filters
          <ChevronDown
            className={`h-4 w-4 ml-1 transition-transform ${
              showFilters ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category, Subcategory, Position Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("");
                  setSelectedPosition("");
                  setSelectedNestedCategory("");
                }}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {!isDirectPosition && selectedCategory && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isSubcategory ? "Subcategory" : "Position"}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setSelectedPosition("");
                    setSelectedNestedCategory("");
                  }}
                >
                  <option value="">
                    Select {isSubcategory ? "Subcategory" : "Position"}
                  </option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasNestedCategories && selectedSubcategory && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {nestedCategories.length > 0 ? "Category" : "Position"}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  value={selectedNestedCategory}
                  onChange={(e) => {
                    setSelectedNestedCategory(e.target.value);
                    setSelectedPosition("");
                  }}
                >
                  <option value="">
                    Select {nestedCategories.length > 0 ? "Category" : "Position"}
                  </option>
                  {nestedCategories.map((nestedCategory) => (
                    <option key={nestedCategory} value={nestedCategory}>
                      {nestedCategory.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {positions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  <option value="">Select Position</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Administrative Area Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedRegion}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedRegion(value);
                  setSelectedSubregion("");
                  setSelectedDistrict("");
                  setSelectedConstituencyMunicipality("");
                  setSelectedSubcountyDivision("");
                  setSelectedParishWard("");
                  setSelectedVillageCell("");
                }}
              >
                <option value="">All Regions</option>
                {regions.map((region: any) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subregion</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedSubregion}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedSubregion(value);
                  setSelectedDistrict("");
                  setSelectedConstituencyMunicipality("");
                  setSelectedSubcountyDivision("");
                  setSelectedParishWard("");
                  setSelectedVillageCell("");
                }}
                disabled={!selectedRegion}
              >
                <option value="">All Subregions</option>
                {filteredSubregions.map((subregion: any) => (
                  <option key={subregion.id} value={subregion.id}>
                    {subregion.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedDistrict}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedDistrict(value);
                  setSelectedConstituencyMunicipality("");
                  setSelectedSubcountyDivision("");
                  setSelectedParishWard("");
                  setSelectedVillageCell("");
                }}
                disabled={!selectedRegion}
              >
                <option value="">All Districts</option>
                {filteredDistricts.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* More Administrative Area Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Constituency/Municipality
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedConstituencyMunicipality}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedConstituencyMunicipality(value);
                  setSelectedSubcountyDivision("");
                  setSelectedParishWard("");
                  setSelectedVillageCell("");
                }}
                disabled={!selectedDistrict}
              >
                <option value="">All Constituencies/Municipalities</option>
                {filteredConstituencyMunicipalities.map((cm: any) => (
                  <option key={cm.id} value={cm.id}>
                    {cm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subcounty/Division
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedSubcountyDivision}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedSubcountyDivision(value);
                  setSelectedParishWard("");
                  setSelectedVillageCell("");
                }}
                disabled={!selectedDistrict}
              >
                <option value="">All Subcounties/Divisions</option>
                {filteredSubcountyDivisions.map((sd: any) => (
                  <option key={sd.id} value={sd.id}>
                    {sd.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Parish/Ward
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedParishWard}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedParishWard(value);
                  setSelectedVillageCell("");
                }}
                disabled={!selectedSubcountyDivision}
              >
                <option value="">All Parishes/Wards</option>
                {filteredParishWards.map((pw: any) => (
                  <option key={pw.id} value={pw.id}>
                    {pw.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filters and Reset */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Village/Cell
              </label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={selectedVillageCell}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedVillageCell(value);
                }}
                disabled={!selectedParishWard}
              >
                <option value="">All Villages/Cells</option>
                {filteredVillageCells.map((vc: any) => (
                  <option key={vc.id} value={vc.id}>
                    {vc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fees Status</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={feesPaidFilter}
                onChange={(e) => setFeesPaidFilter(e.target.value)}
              >
                <option value="">All Candidates</option>
                <option value="paid">Fees Paid</option>
                <option value="unpaid">Fees Not Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nomination Status</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                value={nominationStatusFilter}
                onChange={(e) => setNominationStatusFilter(e.target.value)}
              >
                <option value="">All Candidates</option>
                <option value="nominated">Nominated</option>
                <option value="not_nominated">Not Nominated</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                className="w-full p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NominationsFilters;
