import { baseApi } from './baseApi';

// Define the candidates API slice
export const candidatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all national candidates
    getNationals: builder.query({
      query: (params) => ({
        url: '/nationals',
        method: 'GET',
        params,
      }),
    }),

    // Get all district candidates
    getDistrictCandidates: builder.query({
      query: (params) => ({
        url: '/district-candidates',
        method: 'GET',
        params,
      }),
    }),

    // Get all constituency and municipality candidates
    getConstituencyMunicipalityCandidates: builder.query({
      query: (params) => ({
        url: '/constituency-municipality-candidates',
        method: 'GET',
        params,
      }),
    }),

    // Get all subcounty and division candidates
    getSubcountyDivisionCandidates: builder.query({
      query: (params) => ({
        url: '/subcounty-division-candidates',
        method: 'GET',
        params,
      }),
    }),

    // Get all parish and ward candidates
    getParishWardCandidates: builder.query({
      query: (params) => ({
        url: '/parish-ward-candidates',
        method: 'GET',
        params,
      }),
    }),

    // Get all village and cell candidates
    getVillageCellCandidates: builder.query({
      query: (params) => ({
        url: '/village-cell-candidates',
        method: 'GET',
        params,
      }),
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetNationalsQuery,
  useGetDistrictCandidatesQuery,
  useGetConstituencyMunicipalityCandidatesQuery,
  useGetSubcountyDivisionCandidatesQuery,
  useGetParishWardCandidatesQuery,
  useGetVillageCellCandidatesQuery,
} = candidatesApi;
