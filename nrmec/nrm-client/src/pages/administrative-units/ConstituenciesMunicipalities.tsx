import { useState } from "react";
import {
  useGetConstituenciesAndMunicipalitiesQuery,
  useCreateConstituencyMunicipalityMutation,
  useUpdateConstituencyMunicipalityMutation,
  useDeleteConstituencyMunicipalityMutation,
  useGetDistrictsQuery,
  useGetSubregionsQuery,
  useGetRegionsQuery,
} from "../../store/api/baseApi";
import { AlertCircle, CheckCircle, Edit, Trash } from "lucide-react";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { saveAs } from "file-saver";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface ConstituencyMunicipality {
  id: number;
  name: string;
  type: "constituency" | "municipality";
  districtId: number;
}

const ConstituenciesMunicipalities = () => {
  const {
    data: entities,
    isLoading,
    refetch,
  } = useGetConstituenciesAndMunicipalitiesQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();
  const [createEntity] = useCreateConstituencyMunicipalityMutation();
  const [updateEntity] = useUpdateConstituencyMunicipalityMutation();
  const [deleteEntity] = useDeleteConstituencyMunicipalityMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] =
    useState<ConstituencyMunicipality | null>(null);
  const [newEntity, setNewEntity] = useState<Partial<ConstituencyMunicipality>>(
    {}
  );
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const getFilteredEntities = () => {
    if (!entities) return [];

    switch (user?.role) {
      case "PEO":
      case "Accountant":
      case "SuperAdmin":
        return entities; // Can see all entities

      case "DistrictRegistra":
        // Filter to only show constituencies in user's district
        return entities.filter(
          (entity) => entity.districtId === Number(user?.district)
        );

      case "RegionalCoordinator":
        // Filter constituencies that belong to the coordinator's subregion
        return entities.filter((entity) => {
          const district = districts?.find((d) => d.id === entity.districtId);
          return district?.subregionId === Number(user?.subregion);
        });

      default:
        return [];
    }
  };

  const filteredEntities = getFilteredEntities()
    ?.map((entity) => {
      const district = districts?.find((d) => d.id === entity.districtId);
      const subregion = subregions?.find((s) => s.id === district?.subregionId);
      const region = regions?.find((r) => r.id === subregion?.regionId);

      return {
        ...entity,
        districtName: district?.name,
        subregionName: subregion?.name,
        regionName: region?.name,
      };
    })
    .filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() =>
            navigate(`/constituencies-municipalities/${params.row.id}`)
          }
        >
          {params.value}
        </div>
      ),
    },
    { field: "type", headerName: "Type", width: 200 },
    { field: "districtName", headerName: "District", width: 200 },
    { field: "subregionName", headerName: "Subregion", width: 200 },
    { field: "regionName", headerName: "Region", width: 200 },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => {
              setEditingEntity(params.row);
              setNewEntity(params.row);
              setIsModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteEntity(params.row.id)}
            className="text-gray-600 hover:text-gray-700"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleAddEntity = async () => {
    try {
      await createEntity(newEntity).unwrap();
      setIsModalOpen(false);
      setNewEntity({});
      refetch();
      setOperationResult({
        success: true,
        message: "Entity added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add entity",
      });
    }
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity) return;
    try {
      await updateEntity({
        id: editingEntity.id,
        updates: newEntity,
      }).unwrap();
      setIsModalOpen(false);
      setEditingEntity(null);
      setNewEntity({});
      refetch();
      setOperationResult({
        success: true,
        message: "Entity updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update entity",
      });
    }
  };

  const handleDeleteEntity = async (id: number) => {
    try {
      await deleteEntity(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "Entity deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete entity",
      });
    }
  };

  const handleExport = () => {
    try {
      if (!entities || entities.length === 0) {
        setOperationResult({
          success: false,
          message: "No data available to export",
        });
        return;
      }

      const headers = ["Name", "Type", "District", "Subregion", "Region"];
      const csvData = entities.map((entity) => {
        const district = districts?.find((d) => d.id === entity.districtId);
        const subregion = subregions?.find(
          (s) => s.id === district?.subregionId
        );
        const region = regions?.find((r) => r.id === subregion?.regionId);
        return `${entity.name},${entity.type},${district?.name || ""},${
          subregion?.name || ""
        },${region?.name || ""}`;
      });

      const csvContent = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(
        blob,
        `constituencies-municipalities_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );

      setOperationResult({
        success: true,
        message: "Data exported successfully",
      });
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to export data",
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mb-6 gap-12">
          <h1 className="text-2xl font-semibold text-gray-900">
            Constituencies and Municipalities
          </h1>
          <button
            onClick={() => {
              setEditingEntity(null);
              setNewEntity({});
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            <span className="text-xl">+</span> Add New
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 hover:text-gray-800 bg-gray-800 px-4 py-2 rounded-lg text-white"
          >
            <span className="text-lg">↑</span> Export
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      <CustomDataGrid
        rows={filteredEntities || []}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        checkboxSelection
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editingEntity ? "Edit Entity" : "Add New Entity"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newEntity.name || ""}
                onChange={(e) =>
                  setNewEntity({ ...newEntity, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
              <select
                value={newEntity.type || ""}
                onChange={(e) =>
                  setNewEntity({
                    ...newEntity,
                    type: e.target.value as "constituency" | "municipality",
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select Type</option>
                <option value="constituency">Constituency</option>
                <option value="municipality">Municipality</option>
              </select>
              <select
                value={newEntity.districtId || ""}
                onChange={(e) =>
                  setNewEntity({
                    ...newEntity,
                    districtId: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select District</option>
                {districts?.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={editingEntity ? handleUpdateEntity : handleAddEntity}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  {editingEntity ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {operationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <div
              className={`flex items-center ${
                operationResult.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {operationResult.success ? (
                <CheckCircle className="mr-2" />
              ) : (
                <AlertCircle className="mr-2" />
              )}
              <h3 className="text-lg font-bold">
                {operationResult.success ? "Success" : "Error"}
              </h3>
            </div>
            <p className="mt-2">{operationResult.message}</p>
            <button
              onClick={() => setOperationResult(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstituenciesMunicipalities;
