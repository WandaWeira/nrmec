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

interface VotesFiltersProps {
  electionType: "PRIMARIES" | "INTERNAL_PARTY";
  level: string;
  categories: string[];
  levelConfig: any;
  onFilterChange: (filters: any) => void;
}

const VotesFilters: React.FC<VotesFiltersProps> = ({
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
  const [voteStatusFilter, setVoteStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  // Get administrative units data
  const { data: regions = [] } = useGetRegionsQuery({});
  const { data: subregions = [] } = useGetSubregionsQuery({});
  const { data: districts = [] } = useGetDistrictsQuery({});
  const { data: constituencyMunicipalities = [] } = useGetConstituenciesAndMunicipalitiesQuery({});
  const { data: subcountyDivisions = [] } = useGetSubcountyDivisionsQuery({});
  const { data: parishWards = [] } = useGetParishWardsQuery({});
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
  const categoryValue = levelConfig && selectedCategory ? levelConfig[selectedCategory] : undefined;
  const isDirectPosition = categoryValue === null;
  
  // Handle subcategories (first level nesting)
  const subcategories = categoryValue && typeof categoryValue === "object"
    ? Object.keys(categoryValue)
    : [];
  const isSubcategory = subcategories.length > 0 && categoryValue && typeof categoryValue === "object";
  
  // Handle the subcategory value
  const subcategoryValue = isSubcategory && selectedSubcategory ? categoryValue[selectedSubcategory] : null;
  const subcategoryIsDirectPosition = subcategoryValue === null;
  
  // Handle positions or further nesting
  const positions = subcategoryIsDirectPosition 
    ? [] 
    : (subcategoryValue && typeof subcategoryValue === "object" 
        ? Object.keys(subcategoryValue)
        : []);
    // Handle nested categories (third level)
  const positionValue = subcategoryValue && typeof subcategoryValue === "object" && selectedPosition
    ? subcategoryValue[selectedPosition] 
    : null;
  const positionIsDirectSelection = positionValue === null;
  
  const nestedCategories = positionIsDirectSelection 
    ? [] 
    : (positionValue && typeof positionValue === "object" 
        ? Object.keys(positionValue)
        : []);

  // Build position path for filtering
  const buildPositionPath = () => {
    let path = "";
    
    if (selectedCategory) {
      path = selectedCategory;
      
      if (selectedSubcategory && !isDirectPosition) {
        path += ` > ${selectedSubcategory}`;
        
        if (selectedPosition && !subcategoryIsDirectPosition) {
          path += ` > ${selectedPosition}`;
          
          if (selectedNestedCategory && !positionIsDirectSelection) {
            path += ` > ${selectedNestedCategory}`;
          }
        }
      }
    }
    
    return path;
  };

  // Update filters when any filter value changes
  useEffect(() => {
    const filters: any = {
      ...(selectedRegion && { regionId: selectedRegion }),
      ...(selectedSubregion && { subregionId: selectedSubregion }),
      ...(selectedDistrict && { districtId: selectedDistrict }),
      ...(selectedConstituencyMunicipality && { constituencyMunicipalityId: selectedConstituencyMunicipality }),
      ...(selectedSubcountyDivision && { subcountyDivisionId: selectedSubcountyDivision }),
      ...(selectedParishWard && { parishWardId: selectedParishWard }),
      ...(selectedVillageCell && { villageCellId: selectedVillageCell }),
      ...(voteStatusFilter && { voteStatus: voteStatusFilter }),
    };

    const positionPath = buildPositionPath();
    if (positionPath) {
      filters.positionPath = positionPath;
    }

    onFilterChange(filters);
  }, [
    selectedRegion,
    selectedSubregion,
    selectedDistrict,
    selectedConstituencyMunicipality,
    selectedSubcountyDivision,
    selectedParishWard,
    selectedVillageCell,
    selectedCategory,
    selectedSubcategory,
    selectedPosition,
    selectedNestedCategory,
    voteStatusFilter,
  ]);

  // Reset child selections when parent changes
  useEffect(() => {
    setSelectedSubregion("");
    setSelectedDistrict("");
    setSelectedConstituencyMunicipality("");
    setSelectedSubcountyDivision("");
    setSelectedParishWard("");
    setSelectedVillageCell("");
  }, [selectedRegion]);

  useEffect(() => {
    setSelectedDistrict("");
    setSelectedConstituencyMunicipality("");
    setSelectedSubcountyDivision("");
    setSelectedParishWard("");
    setSelectedVillageCell("");
  }, [selectedSubregion]);

  useEffect(() => {
    setSelectedConstituencyMunicipality("");
    setSelectedSubcountyDivision("");
    setSelectedParishWard("");
    setSelectedVillageCell("");
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedSubcountyDivision("");
    setSelectedParishWard("");
    setSelectedVillageCell("");
  }, [selectedConstituencyMunicipality]);

  useEffect(() => {
    setSelectedParishWard("");
    setSelectedVillageCell("");
  }, [selectedSubcountyDivision]);

  useEffect(() => {
    setSelectedVillageCell("");
  }, [selectedParishWard]);

  // Reset position-related selections when category changes
  useEffect(() => {
    setSelectedSubcategory("");
    setSelectedPosition("");
    setSelectedNestedCategory("");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedPosition("");
    setSelectedNestedCategory("");
  }, [selectedSubcategory]);

  useEffect(() => {
    setSelectedNestedCategory("");
  }, [selectedPosition]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-medium text-gray-900">Filters</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            showFilters ? "rotate-180" : ""
          }`}
        />
      </button>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"              >
                <option value="">All Categories</option>
                {(categories || []).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategory Filter */}
          {isSubcategory && subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subcategories</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Position Filter */}
          {!subcategoryIsDirectPosition && positions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nested Category Filter */}
          {!positionIsDirectSelection && nestedCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nested Category
              </label>
              <select
                value={selectedNestedCategory}
                onChange={(e) => setSelectedNestedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {nestedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vote Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vote Status
            </label>
            <select
              value={voteStatusFilter}
              onChange={(e) => setVoteStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Candidates</option>
              <option value="voted">Votes Recorded</option>
              <option value="not_voted">No Votes Recorded</option>
            </select>
          </div>

          {/* Administrative Unit Filters */}
          {(level === "REGIONAL" || level === "DISTRICT" || level === "CONSTITUENCY_MUNICIPALITY" || 
            level === "SUBCOUNTY_DIVISION" || level === "PARISH_WARD" || level === "VILLAGE_CELL") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {regions.map((region: any) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "DISTRICT" || level === "CONSTITUENCY_MUNICIPALITY" || 
            level === "SUBCOUNTY_DIVISION" || level === "PARISH_WARD" || level === "VILLAGE_CELL") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subregion
              </label>
              <select
                value={selectedSubregion}
                onChange={(e) => setSelectedSubregion(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subregions</option>
                {filteredSubregions.map((subregion: any) => (
                  <option key={subregion.id} value={subregion.id}>
                    {subregion.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "CONSTITUENCY_MUNICIPALITY" || level === "SUBCOUNTY_DIVISION" || 
            level === "PARISH_WARD" || level === "VILLAGE_CELL") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Districts</option>
                {filteredDistricts.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "SUBCOUNTY_DIVISION" || level === "PARISH_WARD" || level === "VILLAGE_CELL") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Constituency/Municipality
              </label>
              <select
                value={selectedConstituencyMunicipality}
                onChange={(e) => setSelectedConstituencyMunicipality(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Constituencies/Municipalities</option>
                {filteredConstituencyMunicipalities.map((cm: any) => (
                  <option key={cm.id} value={cm.id}>
                    {cm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(level === "PARISH_WARD" || level === "VILLAGE_CELL") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcounty/Division
              </label>
              <select
                value={selectedSubcountyDivision}
                onChange={(e) => setSelectedSubcountyDivision(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subcounties/Divisions</option>
                {filteredSubcountyDivisions.map((sd: any) => (
                  <option key={sd.id} value={sd.id}>
                    {sd.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {level === "VILLAGE_CELL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parish/Ward
              </label>
              <select
                value={selectedParishWard}
                onChange={(e) => setSelectedParishWard(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Parishes/Wards</option>
                {filteredParishWards.map((pw: any) => (
                  <option key={pw.id} value={pw.id}>
                    {pw.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VotesFilters;
