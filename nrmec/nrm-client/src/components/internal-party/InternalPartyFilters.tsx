import React, { useEffect, useState } from 'react';
import {
  useGetAvailableRegionsQuery,
  useGetAvailableSubregionsQuery,
  useGetAvailableDistrictsQuery,
  useGetAvailableConstituenciesQuery,
  useGetAvailableSubcountiesQuery,
  useGetAvailableParishesQuery,
  useGetAvailableVillagesQuery,
} from '../../store/api/internal_elections_api';
import internalPartyElectionsConfig from '../../config/intenal_party_elections_config.json';

import { Filter } from 'lucide-react';

interface InternalPartyFiltersProps {
  onFilterChange: (filters: {
    regionId?: number;
    subregionId?: number;
    districtId?: number;
    constituencyMunicipalityId?: number;
    subcountyDivisionId?: number;
    parishWardId?: number;
    villageCellId?: number;
    category?: string;
    position?: string;
  }) => void;
  level: string;
}

const InternalPartyFilters: React.FC<InternalPartyFiltersProps> = ({ onFilterChange, level }) => {
  const [filters, setFilters] = useState({
    regionId: undefined,
    subregionId: undefined,
    districtId: undefined,
    constituencyMunicipalityId: undefined,
    subcountyDivisionId: undefined,
    parishWardId: undefined,
    villageCellId: undefined,
    category: undefined,
    position: undefined,
  });
  
  // Get categories and positions from config
  const levelConfig = internalPartyElectionsConfig.INTERNAL_PARTY[level];
  const categories = Object.keys(levelConfig || {});
  const positions = filters.category && levelConfig ? Object.keys(levelConfig[filters.category] || {}) : [];
  
  // Fetch admin units using RTK Query hooks for internal party elections
  const { data: regions = [] } = useGetAvailableRegionsQuery({ level });
  const { data: subregions = [] } = useGetAvailableSubregionsQuery(
    filters.regionId ? { regionId: filters.regionId } : { regionId: 0 },
    { skip: !filters.regionId }
  );
  const { data: districts = [] } = useGetAvailableDistrictsQuery(
    filters.subregionId ? { subregionId: filters.subregionId } : { subregionId: 0 },
    { skip: !filters.subregionId }
  );
  const { data: constituencies = [] } = useGetAvailableConstituenciesQuery(
    filters.districtId ? { districtId: filters.districtId } : { districtId: 0 },
    { skip: !filters.districtId }
  );
  const { data: subcounties = [] } = useGetAvailableSubcountiesQuery(
    filters.constituencyMunicipalityId ? { constituencyMunicipalityId: filters.constituencyMunicipalityId } : { constituencyMunicipalityId: 0 },
    { skip: !filters.constituencyMunicipalityId }
  );
  const { data: parishes = [] } = useGetAvailableParishesQuery(
    filters.subcountyDivisionId ? { subcountyDivisionId: filters.subcountyDivisionId } : { subcountyDivisionId: 0 },
    { skip: !filters.subcountyDivisionId }
  );
  const { data: villages = [] } = useGetAvailableVillagesQuery(
    filters.parishWardId ? { parishWardId: filters.parishWardId } : { parishWardId: 0 },
    { skip: !filters.parishWardId }
  );

  // Reset lower-level filters when a parent changes
  useEffect(() => {
    setFilters(f => ({ ...f, subregionId: undefined, districtId: undefined, constituencyMunicipalityId: undefined, subcountyDivisionId: undefined, parishWardId: undefined, villageCellId: undefined }));
  }, [filters.regionId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, districtId: undefined, constituencyMunicipalityId: undefined, subcountyDivisionId: undefined, parishWardId: undefined, villageCellId: undefined }));
  }, [filters.subregionId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, constituencyMunicipalityId: undefined, subcountyDivisionId: undefined, parishWardId: undefined, villageCellId: undefined }));
  }, [filters.districtId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, subcountyDivisionId: undefined, parishWardId: undefined, villageCellId: undefined }));
  }, [filters.constituencyMunicipalityId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, parishWardId: undefined, villageCellId: undefined }));
  }, [filters.subcountyDivisionId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, villageCellId: undefined }));
  }, [filters.parishWardId]);
  
  useEffect(() => {
    setFilters(f => ({ ...f, position: undefined }));
  }, [filters.category]);

  // Notify parent on filter change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Determine which filters to show based on level
  const showRegionFilter = true;
  const showSubregionFilter = showRegionFilter && level !== 'NATIONAL';
  const showDistrictFilter = showSubregionFilter && level !== 'REGION';
  const showConstituencyFilter = showDistrictFilter && !['REGION', 'DISTRICT'].includes(level);
  const showSubcountyFilter = showConstituencyFilter && !['REGION', 'DISTRICT', 'CONSTITUENCY_MUNICIPALITY'].includes(level);
  const showParishFilter = showSubcountyFilter && !['REGION', 'DISTRICT', 'CONSTITUENCY_MUNICIPALITY', 'SUBCOUNTY_DIVISION'].includes(level);
  const showVillageFilter = showParishFilter && !['REGION', 'DISTRICT', 'CONSTITUENCY_MUNICIPALITY', 'SUBCOUNTY_DIVISION', 'PARISH_WARD'].includes(level);
  const showCategoryFilter = true;
  const showPositionFilter = !!filters.category;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          className="md:hidden flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={16} />
          <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${isFilterOpen ? 'block' : 'hidden md:grid'}`}>
        {showCategoryFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">League/Committee</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {showPositionFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.position || ''}
              onChange={(e) => setFilters({ ...filters, position: e.target.value || undefined })}
            >
              <option value="">All</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRegionFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.regionId || ''}
              onChange={(e) => setFilters({ ...filters, regionId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSubregionFilter && filters.regionId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subregion</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.subregionId || ''}
              onChange={(e) => setFilters({ ...filters, subregionId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {subregions.map((subregion) => (
                <option key={subregion.id} value={subregion.id}>
                  {subregion.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showDistrictFilter && filters.subregionId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.districtId || ''}
              onChange={(e) => setFilters({ ...filters, districtId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showConstituencyFilter && filters.districtId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Constituency/Municipality</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.constituencyMunicipalityId || ''}
              onChange={(e) => setFilters({ ...filters, constituencyMunicipalityId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {constituencies.map((constituency) => (
                <option key={constituency.id} value={constituency.id}>
                  {constituency.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSubcountyFilter && filters.constituencyMunicipalityId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcounty/Division</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.subcountyDivisionId || ''}
              onChange={(e) => setFilters({ ...filters, subcountyDivisionId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {subcounties.map((subcounty) => (
                <option key={subcounty.id} value={subcounty.id}>
                  {subcounty.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showParishFilter && filters.subcountyDivisionId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parish/Ward</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.parishWardId || ''}
              onChange={(e) => setFilters({ ...filters, parishWardId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {parishes.map((parish) => (
                <option key={parish.id} value={parish.id}>
                  {parish.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showVillageFilter && filters.parishWardId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village/Cell</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.villageCellId || ''}
              onChange={(e) => setFilters({ ...filters, villageCellId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalPartyFilters;
