import { baseApi } from './baseApi';

// Define the type for a nomination request
interface NominationRequest {
  candidateId: number;
  participationId: number;
  electionType: string;
  level: string;
  positionPath?: string;
  notes?: string;
  reasonForNomination?: string;
}

// Define the type for a nomination removal request
interface RemoveNominationRequest {
  nominationId: number;
  electionType: string;
  level: string;
}

// Define the nomination API slice
export const nominationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all candidates eligible for nomination
    getCandidatesForNomination: builder.query({
      query: (params) => ({
        url: `/nominations/test-params`,
        method: 'GET',
        params,
      }),
      providesTags: ['Nominations'],
    }),

    // Get all nominated candidates
    getNominatedCandidates: builder.query({
      query: (params) => ({
        url: `/nominations/nominated`,
        method: 'GET',
        params,
      }),
      providesTags: ['Nominations'],
    }),    // Nominate a candidate
    nominateCandidate: builder.mutation({
      query: (data: NominationRequest) => ({
        url: `/nominations/nominate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Nominations'],
    }),

    // Remove a nomination
    removeNomination: builder.mutation({
      query: (data: RemoveNominationRequest) => ({
        url: `/nominations/remove`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Nominations'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetCandidatesForNominationQuery,
  useGetNominatedCandidatesQuery,
  useNominateCandidateMutation,
  useRemoveNominationMutation,
} = nominationsApi;
