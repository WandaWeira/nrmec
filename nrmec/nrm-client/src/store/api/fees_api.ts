import { baseApi } from './baseApi';

// Define fee types
interface Fee {
  id: number;
  positionPath: string;
  amount: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeHistory {
  id: string;
  date: string;
  amount: number;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the fees API slice
export const feesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all fees
    getFees: builder.query<Fee[], void>({
      query: () => '/fees',
      providesTags: ['Fees'],
    }),

    // Get fees by election type
    getFeesByElectionType: builder.query<Fee[], string>({
      query: (electionType) => `/fees/election-type/${electionType}`,
      providesTags: ['Fees'],
    }),

    // Get fees by sub type
    getFeesBySubType: builder.query<Fee[], string>({
      query: (subType) => `/fees/sub-type/${subType}`,
      providesTags: ['Fees'],
    }),

    // Add a new fee
    addFee: builder.mutation({
      query: (data) => ({
        url: '/fees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Fees'],
    }),

    // Update a fee
    updateFee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/fees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Fees'],
    }),

    // Delete a fee
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `/fees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Fees'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetFeesQuery,
  useGetFeesByElectionTypeQuery,
  useGetFeesBySubTypeQuery,
  useAddFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feesApi;
