// nrm-client/src/pages/administrative-units/SubregionDetails.tsx
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useGetSubregionDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import HierarchyInfo from "../../components/HierarchyInfo";
import { GridColDef } from "@mui/x-data-grid";
import { Card, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface LocationState {
  parentRegion?: {
    id: string;
    name: string;
  };
}

const SubregionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { parentRegion } = (location.state as LocationState) || {};
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: subregionDetails, isLoading } = useGetSubregionDetailsQuery(id);

  // Check if user has access to this subregion
  const hasAccess = () => {
    if (!user) return false;

    switch (user.role) {
      case "PEO":
      case "Accountant":
      case "SuperAdmin":
        return true; // Can access all subregions

      case "RegionalCoordinator":
        return Number(id) === Number(user.subregion); // Can only access their assigned subregion

      default:
        return false;
    }
  };

  if (!hasAccess()) {
    return <Navigate to="/administrative-units/subregions" replace />;
  }

  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = subregionDetails?.hierarchy || {
    region: parentRegion,
    subregion: {
      id,
      name: subregionDetails?.name
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: 'regions', name: 'Regions', path: '/administrative-units/regions' },
    ...(hierarchyData.region ? [{ id: hierarchyData.region.id, name: hierarchyData.region.name, path: `/regions/${hierarchyData.region.id}` }] : []),
    { id: id || '', name: subregionDetails?.name || 'Subregion Details', path: `/subregions/${id}` }
  ];

  // Hierarchy information for the HierarchyInfo component
  const hierarchyItems = hierarchyData.region ? [
    { label: 'Region', value: hierarchyData.region.name, id: hierarchyData.region.id }
  ] : [];

  // Detailed breakdown columns - showing counts per district
  const detailedColumns: GridColDef[] = [
    { field: "name", headerName: "District", flex: 1,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/districts/${params.row.id}`, {
            state: {
              parentSubregion: {
                id: id,
                name: subregionDetails?.name
              },
              parentRegion: hierarchyData.region
            }
          })}
        >
          {params.value}
        </div>
      ),
    },
    { field: "constituenciesCount", headerName: "Constituencies/Municipalities", flex: 1 },
    { field: "subcountiesCount", headerName: "Subcounties/Divisions", flex: 1 },
    { field: "parishesCount", headerName: "Parishes/Wards", flex: 1 },
    { field: "villagesCount", headerName: "Villages/Cells", flex: 1 },
  ];

  const detailedRows =
    subregionDetails?.districtBreakdown?.map((district: any) => ({
      id: district.id,
      name: district.name,
      constituenciesCount: district.constituenciesCount,
      subcountiesCount: district.subcountiesCount,
      parishesCount: district.parishesCount,
      villagesCount: district.villagesCount,
    })) || [];

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={breadcrumbItems}
        currentEntityHierarchy={hierarchyData}
      />
      <br></br>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {subregionDetails?.name} Subregion Details
      </h1>

      {/* Hierarchy Information */}
      {hierarchyItems.length > 0 && (
        <HierarchyInfo items={hierarchyItems} />
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Districts
            </Typography>
            <Typography variant="h4" className="mt-2">
              {subregionDetails?.districtsCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Constituencies/Municipalities
            </Typography>
            <Typography variant="h4" className="mt-2">
              {subregionDetails?.constituenciesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Subcounties/Divisions
            </Typography>
            <Typography variant="h4" className="mt-2">
              {subregionDetails?.subcountiesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Parishes/Wards
            </Typography>
            <Typography variant="h4" className="mt-2">
              {subregionDetails?.parishesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Villages/Cells
            </Typography>
            <Typography variant="h4" className="mt-2">
              {subregionDetails?.villagesCount || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* District-wise Breakdown Table */}
      <div>
        <CustomDataGrid
          rows={detailedRows}
          columns={detailedColumns}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default SubregionDetails;