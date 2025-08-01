import { baseApi } from './baseApi';

// Define the PollingStation interface
interface PollingStation {
  id: number;
  name: string;
  code: string;
  villageId: number;
  villageName: string;
  parishWardId: number;
  parishWardName: string;
  subcountyDivisionId: number;
  subcountyDivisionName: string;
  constituencyMunicipalityId: number;
  constituencyMunicipalityName: string;
  districtId: number;
  districtName: string;
  subregionId: number;
  subregionName: string;
  regionId: number;
  regionName: string;
}

// Define the polling stations API slice
export const pollingStationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all polling stations
    getPollingStations: builder.query<PollingStation[], any>({
      query: (params) => ({
        url: '/polling-stations',
        method: 'GET',
        params,
      }),
      providesTags: ['PollingStations'],
    }),

    // Create a new polling station
    createPollingStation: builder.mutation({
      query: (data) => ({
        url: '/polling-stations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PollingStations'],
    }),

    // Update a polling station
    updatePollingStation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/polling-stations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PollingStations'],
    }),

    // Delete a polling station
    deletePollingStation: builder.mutation({
      query: (id) => ({
        url: `/polling-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PollingStations'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetPollingStationsQuery,
  useCreatePollingStationMutation,
  useUpdatePollingStationMutation,
  useDeletePollingStationMutation,
} = pollingStationsApi;
