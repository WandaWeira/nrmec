// import { useState } from "react";
import {
  // useGetRegionsQuery,
  // useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetSubcountyDivisionsQuery,
  useGetParishWardsQuery,
  useGetVillageCellsQuery,
} from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

const AdminUnits = () => {
  // const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery();
  const { data: districts, isLoading: districtsLoading } =
    useGetDistrictsQuery();
  const { data: constituencies, isLoading: constituenciesLoading } =
    useGetConstituenciesAndMunicipalitiesQuery();
  const { data: subcounties, isLoading: subcountiesLoading } =
    useGetSubcountyDivisionsQuery();
  const { data: parishes, isLoading: parishesLoading } =
    useGetParishWardsQuery();
  const { data: villages, isLoading: villagesLoading } =
    useGetVillageCellsQuery({ all: true });

  const isLoading =
    districtsLoading ||
    constituenciesLoading ||
    subcountiesLoading ||
    parishesLoading ||
    villagesLoading;

  const handleExport = () => {
    // Prepare data for export
    const data = [
      [
        "S/NO",
        "DISTRICT",
        "COUNTIES",
        "CONSTITUENCIES",
        "SUBCOUNTIES/TOWNS/DIVISIONS",
        "PARISHES/WARDS",
        "VILLAGES",
      ],
      ...(districts?.map((district, index) => {
        const districtConstituencies =
          constituencies?.filter((c) => c.districtId === district.id) || [];
        const districtSubcounties =
          subcounties?.filter((s) =>
            districtConstituencies.some(
              (c) => c.id === s.constituencyDivisionId
            )
          ) || [];
        const districtParishes =
          parishes?.filter((p) =>
            districtSubcounties.some((s) => s.id === p.subcountyDivisionId)
          ) || [];
        const districtVillages =
          villages?.villageCells.filter((v) =>
            districtParishes.some((p) => p.id === v.parishWardId)
          ) || [];

        return [
          index + 1,
          district.name,
          districtConstituencies.length,
          districtConstituencies.length,
          districtSubcounties.length,
          districtParishes.length,
          districtVillages.length,
        ];
      }) || []),
      // Add totals row
      [
        "TOTAL",
        districts?.length || 0,
        constituencies?.length || 0,
        constituencies?.length || 0,
        subcounties?.length || 0,
        parishes?.length || 0,
        villages?.villageCells.length || 0,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Administrative Units");
    XLSX.writeFile(wb, "administrative_units.xlsx");
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            SUMMARY OF ADMINISTRATIVE UNITS
          </h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S/NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DISTRICT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COUNTIES
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CONSTITUENCIES
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SUBCOUNTIES/TOWNS/DIVISIONS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PARISHES/WARDS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VILLAGES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {districts?.map((district, index) => {
                const districtConstituencies =
                  constituencies?.filter((c) => c.districtId === district.id) ||
                  [];
                const districtSubcounties =
                  subcounties?.filter((s) =>
                    districtConstituencies.some(
                      (c) => c.id === s.constituencyDivisionId
                    )
                  ) || [];
                const districtParishes =
                  parishes?.filter((p) =>
                    districtSubcounties.some(
                      (s) => s.id === p.subcountyDivisionId
                    )
                  ) || [];
                const districtVillages =
                  villages?.villageCells.filter((v) =>
                    districtParishes.some((p) => p.id === v.parishWardId)
                  ) || [];

                return (
                  <tr key={district.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {district.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {districtConstituencies.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {districtConstituencies.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {districtSubcounties.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {districtParishes.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {districtVillages.length}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap">TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {districts?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {constituencies?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {constituencies?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {subcounties?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parishes?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {villages?.villageCells.length || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUnits;
