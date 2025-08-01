import { baseApi } from './baseApi';

// Define payment types
interface Payment {
  id: number;
  candidateId: number;
  amount: number;
  paymentDate: string;
  positionPath: string;
  paymentMethod: string;
  transactionReference: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  id: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  electionType: string;
}

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
  category?: string;
  subcategory?: string;
  position: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
  year: number;
  isQualified?: boolean;
  vote?: number;
  status: string;
  isNominated: boolean;
  nominationNotes?: string;
  reasonForNomination?: string;
  nominatedBy?: number;
  nominatedAt?: string;
  // Relations
  region?: any;
  subregion?: any;
  district?: any;
  constituencyMunicipality?: any;
  subcountyDivision?: any;
  parishWard?: any;
  villageCell?: any;
  payments?: Payment[];
}

// Define the payments API slice
export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payments
    getPayments: builder.query<Payment[], any>({
      query: (params) => ({
        url: '/payments',
        method: 'GET',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // Get payments for a specific candidate
    getCandidatePayments: builder.query<Payment[], number>({
      query: (candidateId) => ({
        url: `/payments/candidate/${candidateId}`,
        method: 'GET',
      }),
      providesTags: (result, error, candidateId) => [{ type: 'Payments', id: candidateId }],
    }),    // Search candidates by name or NIN
    searchCandidates: builder.query<Candidate[], string>({
      query: (query) => ({
        url: `/candidate/search`,
        method: 'GET',
        params: { query },
      }),
      providesTags: ['Candidates'],
    }),

    // Get all participations for a candidate
    getCandidateParticipations: builder.query<CandidateParticipation[], number>({
      query: (candidateId) => ({
        url: `/candidate/participations/${candidateId}`,
        method: 'GET',
      }),
      providesTags: (result, error, candidateId) => [{ type: 'CandidateParticipations', id: candidateId }],
    }),

    // Add a new payment
    addPayment: builder.mutation({
      query: (data) => ({
        url: '/fees/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // Update a payment
    updatePayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/fees/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payments', id }],
    }),    // Delete a payment
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/fees/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),
    
    // Submit a payment
    submitPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetPaymentsQuery,
  useGetCandidatePaymentsQuery,
  useSearchCandidatesQuery,
  useGetCandidateParticipationsQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useSubmitPaymentMutation,
} = paymentsApi;
