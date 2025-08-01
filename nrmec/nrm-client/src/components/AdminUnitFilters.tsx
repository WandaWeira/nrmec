import React, { useEffect, useState } from 'react';
import {
  useGetAvailablePrimariesRegionsQuery,
  useGetAvailablePrimariesSubregionsQuery,
  useGetAvailablePrimariesDistrictsQuery,
  useGetAvailablePrimariesConstituenciesQuery,
  useGetAvailablePrimariesSubcountiesQuery,
  useGetAvailablePrimariesParishesQuery,
  useGetAvailablePrimariesVillagesQuery,
} from '../store/api/primaries_elections_api';
import primariesElectionsConfig from '../config/primaries_elections_config.json';
import { Filter } from 'lucide-react';

interface AdminUnitFiltersProps {
  onChange: (filters: {
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

const AdminUnitFilters: React.FC<AdminUnitFiltersProps> = ({ onChange, level }) => {
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
  const levelConfig = primariesElectionsConfig.PRIMARIES[level];
  const categories = Object.keys(levelConfig);
  const positions = filters.category ? Object.keys(levelConfig[filters.category]) : [];
  // Fetch admin units using RTK Query hooks
  const { data: regions = [] } = useGetAvailablePrimariesRegionsQuery({ level });
  const { data: subregions = [] } = useGetAvailablePrimariesSubregionsQuery(
    filters.regionId ? { regionId: filters.regionId } : { regionId: 0 },
    { skip: !filters.regionId }
  );
  const { data: districts = [] } = useGetAvailablePrimariesDistrictsQuery(
    filters.subregionId ? { subregionId: filters.subregionId } : { subregionId: 0 },
    { skip: !filters.subregionId }
  );
  const { data: constituencies = [] } = useGetAvailablePrimariesConstituenciesQuery(
    filters.districtId ? { districtId: filters.districtId } : { districtId: 0 },
    { skip: !filters.districtId }
  );
  const { data: subcounties = [] } = useGetAvailablePrimariesSubcountiesQuery(
    filters.constituencyMunicipalityId ? { constituencyMunicipalityId: filters.constituencyMunicipalityId } : { constituencyMunicipalityId: 0 },
    { skip: !filters.constituencyMunicipalityId }
  );
  const { data: parishes = [] } = useGetAvailablePrimariesParishesQuery(
    filters.subcountyDivisionId ? { subcountyDivisionId: filters.subcountyDivisionId } : { subcountyDivisionId: 0 },
    { skip: !filters.subcountyDivisionId }
  );
  const { data: villages = [] } = useGetAvailablePrimariesVillagesQuery(
    filters.parishWardId ? { parishWardId: filters.parishWardId } : { parishWardId: 0 },
    { skip: !filters.parishWardId }
  );

  console.log("regions",regions)
  console.log("subregions",subregions)
  console.log(filters)

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
    onChange(filters);
  }, [filters, onChange]);  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Filter Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-gray-600" />
        <h3 className="font-semibold text-gray-800">Filters</h3>
      </div>
      
      {/* Horizontal Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* League/Committee (Category) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">League/Committee</label>
          <select
            value={filters.category || ''}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Region</label>
          <select
            value={filters.regionId || ''}
            onChange={e => setFilters(f => ({ ...f, regionId: Number(e.target.value) || undefined }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {/* Subregion */}
        {filters.regionId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Subregion</label>
            <select
              value={filters.subregionId || ''}
              onChange={e => setFilters(f => ({ ...f, subregionId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {subregions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* District */}
        {filters.subregionId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">District</label>
            <select
              value={filters.districtId || ''}
              onChange={e => setFilters(f => ({ ...f, districtId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {/* Constituency/Municipality */}
        {filters.districtId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Constituency/Municipality</label>
            <select
              value={filters.constituencyMunicipalityId || ''}
              onChange={e => setFilters(f => ({ ...f, constituencyMunicipalityId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Subcounty/Division */}
        {filters.constituencyMunicipalityId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Subcounty/Division</label>
            <select
              value={filters.subcountyDivisionId || ''}
              onChange={e => setFilters(f => ({ ...f, subcountyDivisionId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {subcounties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* Parish/Ward */}
        {filters.subcountyDivisionId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Parish/Ward</label>
            <select
              value={filters.parishWardId || ''}
              onChange={e => setFilters(f => ({ ...f, parishWardId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* Village/Cell */}
        {filters.parishWardId && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Village/Cell</label>
            <select
              value={filters.villageCellId || ''}
              onChange={e => setFilters(f => ({ ...f, villageCellId: Number(e.target.value) || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        )}

        {/* Position */}
        {filters.category && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Position</label>
            <select
              value={filters.position || ''}
              onChange={e => setFilters(f => ({ ...f, position: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {positions.map(position => (
                <option key={position} value={position}>{position.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Reset Filters Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            setFilters({
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
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AdminUnitFilters;