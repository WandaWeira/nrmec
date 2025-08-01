// nrm-client/src/pages/administrative-units/RegionDetails.tsx
import { useParams } from "react-router-dom";
import { useGetRegionDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { GridColDef } from "@mui/x-data-grid";
import { Card, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: regionDetails, isLoading } = useGetRegionDetailsQuery(id);

  // Create a hierarchyData object from the API response
  const hierarchyData = regionDetails?.hierarchy || {
    region: {
      id,
      name: regionDetails?.name
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: 'regions', name: 'Regions', path: '/administrative-units/regions' },
    { id: id || '', name: regionDetails?.name || 'Region Details', path: `/regions/${id}` }
  ];

  // Detailed breakdown columns - showing counts per subregion
  const detailedColumns: GridColDef[] = [
    { field: "name", headerName: "Subregion", flex: 1 ,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/subregions/${params.row.id}`, {
            state: {
              parentRegion: {
                id: id,
                name: regionDetails?.name
              }
            }
          })}
        >
          {params.value}
        </div>
      ),
    },
    { field: "districtsCount", headerName: "Districts", flex: 1 },
    {
      field: "constituenciesCount",
      headerName: "Constituencies/Municipalities",
      flex: 1,
    },
    { field: "subcountiesCount", headerName: "Subcounties/Divisions", flex: 1 },
    { field: "parishesCount", headerName: "Parishes/Wards", flex: 1 },
    { field: "villagesCount", headerName: "Villages/Cells", flex: 1 },
  ];

  const detailedRows =
    regionDetails?.subregionBreakdown?.map((subregion: any, index: number) => ({
      id: subregion.id,
      name: subregion.name,
      districtsCount: subregion.districtsCount,
      constituenciesCount: subregion.constituenciesCount,
      subcountiesCount: subregion.subcountiesCount,
      parishesCount: subregion.parishesCount,
      villagesCount: subregion.villagesCount,
    })) || [];

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={breadcrumbItems} 
        currentEntityHierarchy={hierarchyData}
      />

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {regionDetails?.name} Region Details
      </h1>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Subregions
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.subregionsCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Districts
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.districtsCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Constituencies
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.constituenciesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Subcounties
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.subcountiesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Parishes
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.parishesCount || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="textSecondary">
              Villages
            </Typography>
            <Typography variant="h4" className="mt-2">
              {regionDetails?.villagesCount || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Subregion-wise Breakdown Table */}
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

export default RegionDetails;