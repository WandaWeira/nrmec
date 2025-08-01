import { useState } from "react";
import { Search, Plus, Edit2 } from "lucide-react";
import { GridColDef } from "@mui/x-data-grid";
import {
  useGetPollingStationsQuery,
  useCreatePollingStationMutation,
  useUpdatePollingStationMutation,
} from "../../store/api/polling_stations_api";
import {
  useGetParishWardsQuery,
  useGetSubcountyDivisionsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetDistrictsQuery,
  useGetSubregionsQuery,
  useGetRegionsQuery,
} from "../../store/api/admin_units_api";
import CustomDataGrid from "../../components/CustomDataGrid";
import Loading from "../../components/Loading";
import PollingStationModal from "../../components/PollingStationModal";

interface PollingStation {
  id: number;
  name: string;
  code: string;
  parishWardName: string;
  parishWardType: string;
  subcountyDivisionName: string;
  subcountyDivisionType: string;
  constituencyMunicipalityName: string;
  constituencyMunicipalityType: string;
  districtName: string;
  subregionName: string;
  regionName: string;
}

const PollingStations = () => {
  const { data: pollingStations, isLoading } = useGetPollingStationsQuery();
  const { data: parishWards } = useGetParishWardsQuery();
  const { data: subcountyDivisions } = useGetSubcountyDivisionsQuery();
  const { data: constituenciesMunicipalities } =
    useGetConstituenciesAndMunicipalitiesQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);
  const [createPollingStation] = useCreatePollingStationMutation();
  const [updatePollingStation] = useUpdatePollingStationMutation();

  const transformedData =
    pollingStations?.map((station) => {
      const parishWard = parishWards?.find(
        (p) => p.id === station.parishWardId
      );
      const subcountyDivision = subcountyDivisions?.find(
        (s) => s.id === parishWard?.subcountyDivisionId
      );
      const constituencyMunicipality = constituenciesMunicipalities?.find(
        (c) => c.id === subcountyDivision?.constituencyDivisionId
      );
      const district = districts?.find(
        (d) => d.id === constituencyMunicipality?.districtId
      );
      const subregion = subregions?.find((s) => s.id === district?.subregionId);
      const region = regions?.find((r) => r.id === subregion?.regionId);

      return {
        id: station.id,
        name: station.name || station.code || "-",
        code: station.code || "-",
        parishWardName: parishWard?.name || "-",
        parishWardType: parishWard?.type || "-",
        subcountyDivisionName: subcountyDivision?.name || "-",
        subcountyDivisionType: subcountyDivision?.type || "-",
        constituencyMunicipalityName: constituencyMunicipality?.name || "-",
        constituencyMunicipalityType: constituencyMunicipality?.type || "-",
        districtName: district?.name || "-",
        subregionName: subregion?.name || "-",
        regionName: region?.name || "-",
      };
    }) || [];

  const filteredData = transformedData.filter((station) =>
    Object.values(station).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = () => {
    setSelectedStation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (station: PollingStation) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedStation) {
        await updatePollingStation({
          id: selectedStation.id,
          updates: data,
        }).unwrap();
      } else {
        await createPollingStation(data).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving polling station:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Polling Station",
      width: 180,
      renderCell: (params) => params.row.name || params.row.code || "-",
    },
    {
      field: "parishWardName",
      headerName: "Parish/Ward",
      width: 150,
      renderCell: (params) =>
        `${params.row.parishWardName} (${params.row.parishWardType})`,
    },
    {
      field: "subcountyDivisionName",
      headerName: "Subcounty/Division",
      width: 180,
      renderCell: (params) =>
        `${params.row.subcountyDivisionName} (${params.row.subcountyDivisionType})`,
    },
    {
      field: "constituencyMunicipalityName",
      headerName: "Constituency/Municipality",
      width: 200,
      renderCell: (params) =>
        `${params.row.constituencyMunicipalityName} (${params.row.constituencyMunicipalityType})`,
    },
    {
      field: "districtName",
      headerName: "District",
      width: 150,
    },
    {
      field: "subregionName",
      headerName: "Subregion",
      width: 150,
    },
    {
      field: "regionName",
      headerName: "Region",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <button
          onClick={() => handleEdit(params.row)}
          className="p-2 text-gray-600 hover:text-yellow-600"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Polling Stations
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Polling Station
        </button>
      </div>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search polling stations..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <CustomDataGrid
        rows={filteredData}
        columns={columns}
        loading={isLoading}
      />

      <PollingStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedStation}
      />
    </div>
  );
};

export default PollingStations;
