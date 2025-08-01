import { useParams, useLocation } from "react-router-dom";
import { useGetParishWardDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import HierarchyInfo from "../../components/HierarchyInfo";

interface LocationState {
  parentSubcounty?: {
    id: string;
    name: string;
    type?: string;
  };
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

const ParishWardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { parentSubcounty, parentConstituency, parentDistrict, parentSubregion, parentRegion } = 
    (location.state as LocationState) || {};
  
  const { data: details, isLoading } = useGetParishWardDetailsQuery(id ?? "");
   console.log("parish-wards",details)
  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = details?.hierarchy || {
    region: parentRegion,
    subregion: parentSubregion,
    district: parentDistrict,
    constituency: parentConstituency,
    subcounty: parentSubcounty,
    parish: {
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
    ...(hierarchyData.subcounty ? [{ 
      id: hierarchyData.subcounty.id, 
      name: hierarchyData.subcounty.name, 
      path: `/subcounties-divisions/${hierarchyData.subcounty.id}` 
    }] : []),
    { id: id || '', name: details?.name || 'Parish/Ward Details', path: `/parishes-wards/${id}` }
  ];

  // Detailed breakdown columns - showing villages/cells
  const detailedColumns: GridColDef[] = [
    { field: "name", headerName: "Village/Cell", flex: 1,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/villages-cells/${params.row.id}`, {
            state: {
              parentParish: {
                id,
                name: details?.name,
                type: details?.type
              },
              parentSubcounty: hierarchyData.subcounty,
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
  ];

  const detailedRows = details?.villageBreakdown?.map(
    (village: any) => ({
      id: village.id,
      name: village.name,
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

      

      <h1 className="text-2xl font-bold mb-6">
        {details?.name} {details?.type === 'parish' ? 'Parish' : 'Ward'} Details
      </h1>

      {/* Hierarchy Information */}
      {(hierarchyData.region || hierarchyData.subregion || hierarchyData.district || hierarchyData.constituency || hierarchyData.subcounty) && (
  <HierarchyInfo 
    items={[
      ...(hierarchyData.region ? [{ 
        label: "Region", 
        value: hierarchyData.region.name, 
        id: `region-${hierarchyData.region.id}` 
      }] : []),
      
      ...(hierarchyData.subregion ? [{ 
        label: "Subregion", 
        value: hierarchyData.subregion.name, 
        id: `subregion-${hierarchyData.subregion.id}` 
      }] : []),
      
      ...(hierarchyData.district ? [{ 
        label: "District", 
        value: hierarchyData.district.name, 
        id: `district-${hierarchyData.district.id}` 
      }] : []),
      
      ...(hierarchyData.constituency ? [{ 
        label: hierarchyData.constituency.type === 'constituency' ? 'Constituency' : 'Municipality', 
        value: hierarchyData.constituency.name, 
        id: `constituency-${hierarchyData.constituency.id}` 
      }] : []),
      
      ...(hierarchyData.subcounty ? [{ 
        label: hierarchyData.subcounty.type === 'subcounty' ? 'Subcounty' : 'Division', 
        value: hierarchyData.subcounty.name, 
        id: `subcounty-${hierarchyData.subcounty.id}` 
      }] : [])
    ]}
  />
)}


<br></br>


      {/* Summary Card */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <div className="text-gray-600">Villages/Cells</div>
        <div className="text-3xl font-bold">{details?.villagesCount || 0}</div>
      </div>

      {/* Village-wise Breakdown Table */}
      <div className="bg-white rounded shadow">
        <div className="grid grid-cols-1 p-4 border-b font-medium">
          <div className="col-span-1">Village/Cell</div>
        </div>

        {detailedRows.map((village) => (
          <div 
            key={village.id} 
            className="grid grid-cols-1 p-4 border-b bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
            onClick={() => navigate(`/villages-cells/${village.id}`, {
              state: {
                parentParish: {
                  id,
                  name: details?.name,
                  type: details?.type
                },
                parentSubcounty: hierarchyData.subcounty,
                parentConstituency: hierarchyData.constituency,
                parentDistrict: hierarchyData.district,
                parentSubregion: hierarchyData.subregion,
                parentRegion: hierarchyData.region
              }
            })}
          >
            <div className="col-span-1">{village.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParishWardDetails;