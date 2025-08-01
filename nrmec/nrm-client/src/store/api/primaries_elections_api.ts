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

// Create a local API instance for primaries with the correct tagTypes
export const primariesElectionsApi = baseApi.injectEndpoints({

  endpoints: (builder) => ({
    getPrimariesCandidates: builder.query<CandidateParticipation[], { 
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
        url: `/primaries-elections/candidates/${level}`,
        method: 'GET',
        params
      }),
      providesTags: ['PrimariesCandidates']
    }),

    createPrimariesCandidate: builder.mutation<CandidateParticipation, Partial<CandidateParticipation>>({
      query: (data) => ({
        url: '/primaries-elections/candidates',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PrimariesCandidates']
    }),

    updatePrimariesCandidate: builder.mutation<CandidateParticipation, { id: number; updates: Partial<CandidateParticipation> }>({
      query: ({ id, updates }) => ({
        url: `/primaries-elections/candidates/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['PrimariesCandidates']
    }),

    deletePrimariesCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/primaries-elections/candidates/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['PrimariesCandidates']
    }),

    getAvailableRegions: builder.query<any[], { level: string }>({
      query: ({ level }) => ({
        url: `/primaries-elections/available-regions`,
        method: 'GET',
        params: { level },
      }),
    }),
    getAvailableSubregions: builder.query<any[], { regionId: number }>({
      query: ({ regionId }) => ({
        url: `/primaries-elections/available-subregions`,
        method: 'GET',
        params: { regionId },
      }),
    }),
    getAvailableDistricts: builder.query<any[], { subregionId: number }>({
      query: ({ subregionId }) => ({
        url: `/primaries-elections/available-districts`,
        method: 'GET',
        params: { subregionId },
      }),
    }),
    getAvailableConstituencies: builder.query<any[], { districtId: number }>({
      query: ({ districtId }) => ({
        url: `/primaries-elections/available-constituencies`,
        method: 'GET',
        params: { districtId },
      }),
    }),
    getAvailableSubcounties: builder.query<any[], { constituencyMunicipalityId: number }>({
      query: ({ constituencyMunicipalityId }) => ({
        url: `/primaries-elections/available-subcounties`,
        method: 'GET',
        params: { constituencyMunicipalityId },
      }),
    }),
    getAvailableParishes: builder.query<any[], { subcountyDivisionId: number }>({
      query: ({ subcountyDivisionId }) => ({
        url: `/primaries-elections/available-parishes`,
        method: 'GET',
        params: { subcountyDivisionId },
      }),
    }),
    getAvailableVillages: builder.query<any[], { parishWardId: number }>({
      query: ({ parishWardId }) => ({
        url: `/primaries-elections/available-villages`,
        method: 'GET',
        params: { parishWardId },
      }),
    }),
  })
});

export const {
  useGetPrimariesCandidatesQuery,
  useCreatePrimariesCandidateMutation,
  useUpdatePrimariesCandidateMutation,
  useDeletePrimariesCandidateMutation,
  useGetAvailableRegionsQuery: useGetAvailablePrimariesRegionsQuery,
  useGetAvailableSubregionsQuery: useGetAvailablePrimariesSubregionsQuery,
  useGetAvailableDistrictsQuery: useGetAvailablePrimariesDistrictsQuery,
  useGetAvailableConstituenciesQuery: useGetAvailablePrimariesConstituenciesQuery,
  useGetAvailableSubcountiesQuery: useGetAvailablePrimariesSubcountiesQuery,
  useGetAvailableParishesQuery: useGetAvailablePrimariesParishesQuery,
  useGetAvailableVillagesQuery: useGetAvailablePrimariesVillagesQuery,
} = primariesElectionsApi;
