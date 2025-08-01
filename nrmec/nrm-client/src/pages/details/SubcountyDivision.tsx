import { useParams, useLocation } from "react-router-dom";
import { useGetSubcountyDivisionDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import HierarchyInfo from "../../components/HierarchyInfo";

interface LocationState {
  parentConstituency?: {
    id: string;
    name: string;
    type?: string;
  };
  parentDistrict?: {
    id: string;
    name: string;
  };
  parentSubregion?: {
    id: string;
    name: string;
  };
  parentRegion?: {
    id: string;
    name: string;
  };
}

const SubcountyDivisionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { parentConstituency, parentDistrict, parentSubregion, parentRegion } = 
    (location.state as LocationState) || {};
  
  const { data: details, isLoading } = useGetSubcountyDivisionDetailsQuery(id ?? "");
console.log("sub",details)
  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = details?.hierarchy || {
    region: parentRegion,
    subregion: parentSubregion,
    district: parentDistrict,
    constituency: parentConstituency,
    subcounty: {
      id,
      name: details?.name,
      type: details?.type
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: 'regions', name: 'Regions', path: '/administrative-units/regions' },
    ...(hierarchyData.region ? [{ id: hierarchyData.region.id, name: hierarchyData.region.name, path: `/regions/${hierarchyData.region.id}` }] : []),
    ...(hierarchyData.subregion ? [{ id: hierarchyData.subregion.id, name: hierarchyData.subregion.name, path: `/subregions/${hierarchyData.subregion.id}` }] : []),
    ...(hierarchyData.district ? [{ id: hierarchyData.district.id, name: hierarchyData.district.name, path: `/districts/${hierarchyData.district.id}` }] : []),
    ...(hierarchyData.constituency ? [{ 
      id: hierarchyData.constituency.id, 
      name: hierarchyData.constituency.name, 
      path: `/constituencies-municipalities/${hierarchyData.constituency.id}` 
    }] : []),
    { id: id || '', name: details?.name || 'Subcounty/Division Details', path: `/subcounties-divisions/${id}` }
  ];

  // Detailed breakdown columns - showing counts per parish/ward
  const detailedColumns: GridColDef[] = [
    { field: "name", headerName: "Parish/Ward", flex: 1,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/parishes-wards/${params.row.id}`, {
            state: {
              parentSubcounty: {
                id,
                name: details?.name,
                type: details?.type
              },
              parentConstituency: hierarchyData.constituency,
              parentDistrict: hierarchyData.district,
              parentSubregion: hierarchyData.subregion,
              parentRegion: hierarchyData.region
            }
          })}
        >
          {params.value}
        </div>
      ),
    },
    { field: "villagesCount", headerName: "Villages/Cells", flex: 1 },
  ];

  const detailedRows = details?.parishBreakdown?.map(
    (parish: any) => ({
      id: parish.id,
      name: parish.name,
      villagesCount: parish.villagesCount,
    })
  ) || [];

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={breadcrumbItems}
        currentEntityHierarchy={hierarchyData}
      />
       <br></br>


      <h1 className="text-2xl font-bold mb-6">
        {details?.name} {details?.type === 'subcounty' ? 'Subcounty' : 'Division'} Details
      </h1>

      {/* Hierarchy Information */}
      {(hierarchyData.region || hierarchyData.subregion || hierarchyData.district || hierarchyData.constituency) && (
          <HierarchyInfo 
            items={[
              ...(hierarchyData.region ? [{ 
                label: "Region", 
                value: hierarchyData.region.name, 
                id: `region-${hierarchyData.region.id || '1'}` 
              }] : []),
              
              ...(hierarchyData.subregion ? [{ 
                label: "Subregion", 
                value: hierarchyData.subregion.name, 
                id: `subregion-${hierarchyData.subregion.id || '1'}` 
              }] : []),
              
              ...(hierarchyData.district ? [{ 
                label: "District", 
                value: hierarchyData.district.name, 
                id: `district-${hierarchyData.district.id || '1'}` 
              }] : []),
              
              ...(hierarchyData.constituency ? [{ 
                label: hierarchyData.constituency.type === 'constituency' ? 'Constituency' : 'Municipality', 
                value: hierarchyData.constituency.name, 
                id: `constituency-${hierarchyData.constituency.id || '1'}` 
              }] : [])
            ]}
          />
        )}
         <br></br>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Parishes/Wards</div>
          <div className="text-3xl font-bold">{details?.parishesCount || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Villages/Cells</div>
          <div className="text-3xl font-bold">{details?.villagesCount || 0}</div>
        </div>
      </div>

      {/* Parish-wise Breakdown Table */}
      <div className="bg-white rounded shadow">
        <div className="grid grid-cols-2 p-4 border-b font-medium">
          <div className="col-span-1">Parish/Ward</div>
          <div className="col-span-1">Villages/Cells</div>
        </div>

        {detailedRows.map((parish) => (
          <div 
            key={parish.id} 
            className="grid grid-cols-2 p-4 border-b bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
            onClick={() => navigate(`/parishes-wards/${parish.id}`, {
              state: {
                parentSubcounty: {
                  id,
                  name: details?.name,
                  type: details?.type
                },
                parentConstituency: hierarchyData.constituency,
                parentDistrict: hierarchyData.district,
                parentSubregion: hierarchyData.subregion,
                parentRegion: hierarchyData.region
              }
            })}
          >
            <div className="col-span-1">{parish.name}</div>
            <div className="col-span-1">{parish.villagesCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubcountyDivisionDetails;