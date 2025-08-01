import { baseApi } from './baseApi';

// Define the Registrar interface
interface Registrar {
  id: string;
  fullName: string;
  phoneNumber: string;
  administrativeUnitType: string;
  administrativeUnitId: number;
  administrativeUnitName: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

// Define the registrars API slice
export const registrarsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all registrars
    getRegistrars: builder.query<Registrar[], any>({
      query: (params) => ({
        url: '/registrars',
        method: 'GET',
        params,
      }),
      providesTags: ['Registrars'],
    }),

    // Create a new registrar
    createRegistrar: builder.mutation({
      query: (data) => ({
        url: '/registrars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Registrars'],
    }),

    // Update a registrar
    updateRegistrar: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/registrars/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Registrars'],
    }),

    // Delete a registrar
    deleteRegistrar: builder.mutation({
      query: (id) => ({
        url: `/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Registrars'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetRegistrarsQuery,
  useCreateRegistrarMutation,
  useUpdateRegistrarMutation,
  useDeleteRegistrarMutation,
} = registrarsApi;
