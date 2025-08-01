import { useState } from "react";
import {
  useGetDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
  useGetSubregionsQuery,
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

interface District {
  id: number;
  name: string;
  subregionId: number;
  hasCity: boolean;
}

const Districts = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: districts, isLoading, refetch } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();
  const [createDistrict] = useCreateDistrictMutation();
  const [updateDistrict] = useUpdateDistrictMutation();
  const [deleteDistrict] = useDeleteDistrictMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [newDistrict, setNewDistrict] = useState<Partial<District>>({});
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Filter districts based on user role and permissions
  const getFilteredDistricts = () => {
    if (!districts) return [];

    switch (user?.role) {
      case "PEO":
      case "Accountant":
      case "SuperAdmin":
        return districts; // Can see all districts

      case "DistrictRegistra":
        // The user.district is the district ID number assigned to the user
        return districts.filter((district) => {
          return district.id === Number(user?.district);
        });

      case "RegionalCoordinator":
        // Filter districts that belong to the coordinator's subregion
        return districts.filter((district) =>
          subregions?.find(
            (s) =>
              s.id === district.subregionId && s.id === Number(user?.subregion)
          )
        );

      default:
        return [];
    }
  };

  // Update the filteredDistricts to use the role-based filter first
  const filteredDistricts = getFilteredDistricts()
    ?.map((district) => ({
      ...district,
      subregionName: subregions?.find((s) => s.id === district.subregionId)
        ?.name,
      regionName: regions?.find(
        (r) =>
          r.id ===
          subregions?.find((s) => s.id === district.subregionId)?.regionId
      )?.name,
    }))
    .filter(
      (district) =>
        district.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Modify the add button visibility based on role
  const canAddDistrict = user?.role === "PEO" || user?.role === "SuperAdmin";

  const handleAddDistrict = async () => {
    try {
      await createDistrict(newDistrict).unwrap();
      setIsModalOpen(false);
      setNewDistrict({});
      refetch();
      setOperationResult({
        success: true,
        message: "District added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add district",
      });
    }
  };

  const handleUpdateDistrict = async () => {
    if (editingDistrict) {
      try {
        await updateDistrict({
          id: editingDistrict.id,
          updates: newDistrict,
        }).unwrap();
        setIsModalOpen(false);
        setEditingDistrict(null);
        setNewDistrict({});
        refetch();
        setOperationResult({
          success: true,
          message: "District updated successfully",
        });
      } catch (error: any) {
        setOperationResult({
          success: false,
          message: error.data?.message || "Failed to update district",
        });
      }
    }
  };

  const handleDeleteDistrict = async (id: number) => {
    try {
      await deleteDistrict(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "District deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete district",
      });
    }
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    setNewDistrict({
      name: district.name,
      subregionId: district.subregionId,
      hasCity: district.hasCity,
    });
    setIsModalOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "District Name",
      width: 200,
      minWidth: 150,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/districts/${params.row.id}`)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "subregionName",
      headerName: "Subregion",
      width: 200,
      minWidth: 150,
    },
    {
      field: "regionName",
      headerName: "Region",
      width: 200,
      minWidth: 150,
    },
    {
      field: "hasCity",
      headerName: "Has City",
      width: 120,
      type: "boolean",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        canAddDistrict && (
          <div className="flex gap-2">
            <IconButton
              onClick={() => handleEditDistrict(params.row)}
              className="text-gray-600 hover:text-gray-700"
            >
              <Edit size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteDistrict(params.row.id)}
              className="text-gray-600 hover:text-gray-700"
            >
              <Trash size={16} />
            </IconButton>
          </div>
        ),
    },
  ];

  const handleExport = () => {
    try {
      if (!districts || districts.length === 0) {
        setOperationResult({
          success: false,
          message: "No data available to export",
        });
        return;
      }

      const headers = ["Name", "Subregion", "Region", "Has City"];
      const csvData = districts.map((district) => {
        const subregionName = subregions?.find(
          (s) => s.id === district.subregionId
        )?.name;
        const regionName = regions?.find(
          (r) =>
            r.id ===
            subregions?.find((s) => s.id === district.subregionId)?.regionId
        )?.name;
        return `${district.name},${subregionName || ""},${regionName || ""},${
          district.hasCity
        }`;
      });

      const csvContent = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `districts_${new Date().toISOString().split("T")[0]}.csv`);

      setOperationResult({
        success: true,
        message: "Districts exported successfully",
      });
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to export districts",
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mb-6 gap-12">
          <h1 className="text-2xl font-semibold text-gray-900">Districts</h1>
          {canAddDistrict && (
            <button
              onClick={() => {
                setEditingDistrict(null);
                setNewDistrict({});
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              <span className="text-xl">+</span> Add District
            </button>
          )}
        </div>

        {canAddDistrict && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 hover:text-gray-800 bg-gray-800 px-4 py-2 rounded-lg text-white"
            >
              <span className="text-lg">↑</span> Export
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search district"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      <CustomDataGrid
        rows={filteredDistricts || []}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        checkboxSelection
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editingDistrict ? "Edit District" : "Add New District"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="District Name"
                value={newDistrict.name || ""}
                onChange={(e) =>
                  setNewDistrict({ ...newDistrict, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
              <select
                value={newDistrict.subregionId || ""}
                onChange={(e) =>
                  setNewDistrict({
                    ...newDistrict,
                    subregionId: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select Subregion</option>
                {subregions?.map((subregion) => (
                  <option key={subregion.id} value={subregion.id}>
                    {subregion.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newDistrict.hasCity || false}
                  onChange={(e) =>
                    setNewDistrict({
                      ...newDistrict,
                      hasCity: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label>Has City</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingDistrict ? handleUpdateDistrict : handleAddDistrict
                  }
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  {editingDistrict ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {operationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-2xl relative">
            <div
              className={`flex items-center mb-4 ${
                operationResult.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {operationResult.success ? (
                <CheckCircle className="mr-2 h-6 w-6" />
              ) : (
                <AlertCircle className="mr-2 h-6 w-6" />
              )}
              <h2 className="text-2xl font-bold">
                {operationResult.success ? "Success" : "Error"}
              </h2>
            </div>
            <p className="text-lg mb-6">{operationResult.message}</p>
            <button
              onClick={() => setOperationResult(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={() => setOperationResult(null)}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-yellow-950 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Districts;
