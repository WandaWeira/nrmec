import { baseApi } from './baseApi';

// Define the admin units API slice
export const adminUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all regions
    getRegions: builder.query({
      query: () => 'regions',
    }),

    // Get all subregions
    getSubregions: builder.query({
      query: (params) => ({
        url: 'subregions',
        method: 'GET',
        params,
      }),
    }),

    // Get all districts
    getDistricts: builder.query({
      query: (params) => ({
        url: 'districts',
        method: 'GET',
        params,
      }),
    }),

    // Get all constituencies and municipalities
    getConstituenciesAndMunicipalities: builder.query({
      query: (params) => ({
        url: 'constituencies-municipalities',
        method: 'GET',
        params,
      }),
    }),

    // Get all subcounties and divisions
    getSubcountyDivisions: builder.query({
      query: (params) => ({
        url: 'subcounty-divisions',
        method: 'GET',
        params,
      }),
    }),

    // Get all parishes and wards
    getParishWards: builder.query({
      query: (params) => ({
        url: 'parish-wards',
        method: 'GET',
        params,
      }),
    }),

    // Get all villages and cells
    getVillageCells: builder.query({
      query: (params) => ({
        url: 'village-cells',
        method: 'GET',
        params,
      }),
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetSubcountyDivisionsQuery,
  useGetParishWardsQuery,
  useGetVillageCellsQuery,
} = adminUnitsApi;
