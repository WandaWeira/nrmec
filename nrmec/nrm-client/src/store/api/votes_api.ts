import { baseApi } from './baseApi';

// Define the type for a vote record request
interface VoteRecordRequest {
  candidateParticipationId: number;
  votes: number;
  electionType: string;
  level: string;
  positionPath?: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
  notes?: string;
}

// Define the type for vote deletion request
interface DeleteVoteRequest {
  voteId: number;
}

// Define the type for candidate vote query parameters
interface CandidateVoteParams {
  electionType: string;
  level: string;
  positionPath?: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
}

// Define the type for vote summary query parameters
interface VoteSummaryParams {
  electionType: string;
  level: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
}

// Define the type for specific candidate votes query
interface SpecificCandidateVoteParams {
  candidateParticipationId: number;
}

// Define the votes API slice
export const votesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all nominated candidates eligible for voting
    getCandidatesForVoting: builder.query({
      query: (params: CandidateVoteParams) => ({
        url: `/votes/candidates`,
        method: 'GET',
        params,
      }),
      providesTags: ['Votes', 'Nominations'],
    }),

    // Get vote summary statistics grouped by position
    getVoteSummary: builder.query({
      query: (params: VoteSummaryParams) => ({
        url: `/votes/summary`,
        method: 'GET',
        params,
      }),
      providesTags: ['Votes'],
    }),

    // Get votes for a specific candidate
    getCandidateVotes: builder.query({
      query: ({ candidateParticipationId }: SpecificCandidateVoteParams) => ({
        url: `/votes/candidate/${candidateParticipationId}`,
        method: 'GET',
      }),
      providesTags: ['Votes'],
    }),

    // Record or update votes for a candidate
    recordVote: builder.mutation({
      query: (data: VoteRecordRequest) => ({
        url: `/votes/record`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Votes'],
    }),

    // Delete a vote record
    deleteVote: builder.mutation({
      query: ({ voteId }: DeleteVoteRequest) => ({
        url: `/votes/delete/${voteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Votes'],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetCandidatesForVotingQuery,
  useGetVoteSummaryQuery,
  useGetCandidateVotesQuery,
  useRecordVoteMutation,
  useDeleteVoteMutation,
} = votesApi;