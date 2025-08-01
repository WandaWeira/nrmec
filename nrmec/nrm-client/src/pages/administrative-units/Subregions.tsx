import { useState } from "react";
import {
  useGetSubregionsQuery,
  useAddSubregionMutation,
  useUpdateSubregionMutation,
  useDeleteSubregionMutation,
  useGetRegionsQuery,
} from "../../store/api/baseApi";
import { AlertCircle, CheckCircle, Edit, Trash, X, Search } from "lucide-react";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface Subregion {
  id: number;
  name: string;
  regionId: number;
}

// interface Region {
//   id: number;
//   name: string;
// }

const Subregions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: subregions, isLoading, refetch } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();
  const [addSubregion] = useAddSubregionMutation();
  const [updateSubregion] = useUpdateSubregionMutation();
  const [deleteSubregion] = useDeleteSubregionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubregion, setEditingSubregion] = useState<Subregion | null>(
    null
  );
  const [newSubregion, setNewSubregion] = useState<Partial<Subregion>>({});
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Filter subregions based on user role and permissions
  const getFilteredSubregions = () => {
    if (!subregions) return [];

    switch (user?.role) {
      case "PEO":
      case "Accountant":
      case "SuperAdmin":
        return subregions; // Can see all subregions

      case "RegionalCoordinator":
        // Only show the subregion assigned to the coordinator
        return subregions.filter(
          (subregion) => subregion.id === Number(user?.subregion)
        );

      default:
        return [];
    }
  };

  // Filter subregions based on search term and user role
  const filteredSubregions = getFilteredSubregions()
    ?.map((subregion) => ({
      ...subregion,
      regionName: regions?.find((r) => r.id === subregion.regionId)?.name,
    }))
    .filter((subregion) =>
      subregion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Modify the add button visibility based on role
  const canAddSubregion = user?.role === "PEO" || user?.role === "SuperAdmin";

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/subregions/${params.row.id}`)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "regionName",
      headerName: "Region",
      width: 200,
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation when clicking edit
              setEditingSubregion(params.row);
              setNewSubregion(params.row);
              setIsModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation when clicking delete
              handleDeleteSubregion(params.row.id);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleAddSubregion = async () => {
    try {
      await addSubregion(newSubregion as Subregion).unwrap();
      setIsModalOpen(false);
      setNewSubregion({});
      refetch();
      setOperationResult({
        success: true,
        message: "Subregion added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add subregion",
      });
    }
  };

  const handleUpdateSubregion = async () => {
    if (!editingSubregion) return;
    try {
      await updateSubregion({
        id: editingSubregion.id,
        updates: newSubregion as Subregion,
      }).unwrap();
      setIsModalOpen(false);
      setEditingSubregion(null);
      setNewSubregion({});
      refetch();
      setOperationResult({
        success: true,
        message: "Subregion updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update subregion",
      });
    }
  };

  const handleDeleteSubregion = async (id: number) => {
    try {
      await deleteSubregion(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "Subregion deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete subregion",
      });
    }
  };

  const handleExport = () => {
    try {
      if (!subregions || subregions.length === 0) {
        setOperationResult({
          success: false,
          message: "No data available to export",
        });
        return;
      }

      const headers = ["Name", "Region"];
      const csvData = subregions.map((subregion) => {
        const regionName = regions?.find(
          (r) => r.id === subregion.regionId
        )?.name;
        return `${subregion.name},${regionName}`;
      });

      const csvContent = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `subregions_${new Date().toISOString().split("T")[0]}.csv`);

      setOperationResult({
        success: true,
        message: "Subregions exported successfully",
      });
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to export subregions",
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mb-6 gap-12">
          <h1 className="text-2xl font-semibold text-gray-900">Subregions</h1>
          {canAddSubregion && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              <span className="text-xl">+</span> Add Subregion
            </button>
          )}
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
          placeholder="Search subregion"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      <CustomDataGrid
        rows={filteredSubregions || []}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        checkboxSelection
      />

      {operationResult && (
        <div
          className={`${
            operationResult.success ? "bg-green-100" : "bg-red-100"
          } p-4 mb-4 rounded flex items-center`}
        >
          {operationResult.success ? (
            <CheckCircle className="mr-2" />
          ) : (
            <AlertCircle className="mr-2" />
          )}
          {operationResult.message}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingSubregion ? "Edit Subregion" : "Add Subregion"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subregion Name"
                value={newSubregion.name || ""}
                onChange={(e) =>
                  setNewSubregion({ ...newSubregion, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
              <select
                value={newSubregion.regionId || ""}
                onChange={(e) =>
                  setNewSubregion({
                    ...newSubregion,
                    regionId: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select Region</option>
                {regions?.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingSubregion ? handleUpdateSubregion : handleAddSubregion
                }
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {editingSubregion ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subregions;