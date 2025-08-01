import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseApi } from './baseApi';

interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  electionType: string;
  gender?: string;
}

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
  category: string;
  position: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
  year: number;
  status: string;
  isQualified: boolean;
  vote: number;
  candidate?: Candidate;
  region?: {
    id: number;
    name: string;
  };
  subregion?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  constituencyMunicipality?: {
    id: number;
    name: string;
  };
  subcountyDivision?: {
    id: number;
    name: string;
  };
  parishWard?: {
    id: number;
    name: string;
  };
  villageCell?: {
    id: number;
    name: string;
  };
}

export const internalElectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInternalPartyCandidates: builder.query<CandidateParticipation[], { 
      level: string;
      regionId?: number;
      subregionId?: number;
      districtId?: number;
      constituencyMunicipalityId?: number;
      subcountyDivisionId?: number;
      parishWardId?: number;
      villageCellId?: number;
    }>({
      query: ({ level, ...params }) => ({
        url: `/internal-elections/candidates/${level}`,
        method: 'GET',
        params
      }),
      providesTags: ['InternalPartyCandidates']
    }),

    createInternalPartyCandidate: builder.mutation<CandidateParticipation, Partial<CandidateParticipation>>({
      query: (data) => ({
        url: '/internal-elections/candidates',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['InternalPartyCandidates']
    }),

    updateInternalPartyCandidate: builder.mutation<CandidateParticipation, { id: number; updates: Partial<CandidateParticipation> }>({
      query: ({ id, updates }) => ({
        url: `/internal-elections/candidates/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['InternalPartyCandidates']
    }),

    deleteInternalPartyCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/internal-elections/candidates/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['InternalPartyCandidates']
    }),

    getAvailableRegions: builder.query<any[], { level: string }>({
      query: ({ level }) => ({
        url: `/internal-elections/available-regions`,
        method: 'GET',
        params: { level },
      }),
    }),
    getAvailableSubregions: builder.query<any[], { regionId: number }>({
      query: ({ regionId }) => ({
        url: `/internal-elections/available-subregions`,
        method: 'GET',
        params: { regionId },
      }),
    }),
    getAvailableDistricts: builder.query<any[], { subregionId: number }>({
      query: ({ subregionId }) => ({
        url: `/internal-elections/available-districts`,
        method: 'GET',
        params: { subregionId },
      }),
    }),
    getAvailableConstituencies: builder.query<any[], { districtId: number }>({
      query: ({ districtId }) => ({
        url: `/internal-elections/available-constituencies`,
        method: 'GET',
        params: { districtId },
      }),
    }),
    getAvailableSubcounties: builder.query<any[], { constituencyMunicipalityId: number }>({
      query: ({ constituencyMunicipalityId }) => ({
        url: `/internal-elections/available-subcounties`,
        method: 'GET',
        params: { constituencyMunicipalityId },
      }),
    }),
    getAvailableParishes: builder.query<any[], { subcountyDivisionId: number }>({
      query: ({ subcountyDivisionId }) => ({
        url: `/internal-elections/available-parishes`,
        method: 'GET',
        params: { subcountyDivisionId },
      }),
    }),
    getAvailableVillages: builder.query<any[], { parishWardId: number }>({
      query: ({ parishWardId }) => ({
        url: `/internal-elections/available-villages`,
        method: 'GET',
        params: { parishWardId },
      }),
    }),
  })
});

export const {
  useGetInternalPartyCandidatesQuery,
  useCreateInternalPartyCandidateMutation,
  useUpdateInternalPartyCandidateMutation,
  useDeleteInternalPartyCandidateMutation,
  useGetAvailableRegionsQuery,
  useGetAvailableSubregionsQuery,
  useGetAvailableDistrictsQuery,
  useGetAvailableConstituenciesQuery,
  useGetAvailableSubcountiesQuery,
  useGetAvailableParishesQuery,
  useGetAvailableVillagesQuery,
} = internalElectionsApi;
