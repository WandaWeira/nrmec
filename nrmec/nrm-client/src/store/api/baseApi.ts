import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface StatsResponse {
  regions: string;
  subregions: string;
  districts: string;
  constituenciesMunicipalities: string;
  subcountiesDivisions: string;
  parishesWards: string;
  villagesCells: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  ninNumber: string;
  phoneNumber: string;
  district: number | null;
  subregion: number | null;
}

interface District {
  id: number;
  name: string;
  hasCity: boolean;
  subregionId: number;
}

interface Subregion {
  id: number;
  name: string;
  regionId: number;
}

interface Region {
  id: number;
  name: string;
}

interface ConstituencyMunicipality {
  id: number;
  name: string;
  type: "constituency" | "municipality";
  districtId: number;
}

export interface SubcountyDivision {
  id: number;
  name: string;
  type: "subcounty" | "division";
  constituencyDivisionId: number;
}

export interface ParishWard {
  id: number;
  name: string;
  type: "parish" | "ward";
  subcountyDivisionId: number;
}

export interface VillageCell {
  id: number;
  name: string;
  type: "village" | "cell";
  parishWardId: number;
}

export interface VillageCellsParams {
  page?: number;
  limit?: number;
  all?: boolean;
  search?: string;
  parishWardId?: number;
}

export interface VillageCellsResponse {
  villageCells: VillageCell[];
  totalCount: number;
  totalPages: number;
}
export interface VillagesByParishResponse {
  villageCells: VillageCell[];
  totalCount: number;
}

interface National {
  isQualified: any;
  id: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category?: string;
  nationalElectionType: string;
  region: number;
  subregion: number;
  district: number;
  constituency?: number;
  subcounty?: number;
  parish?: number;
  village?: number;
  regionName?: string;
  subregionName?: string;
  districtName?: string;
  constituencyName?: string;
  subcountyName?: string;
  parishName?: string;
  villageName?: string;
  vote?: number;
}
// New interfaces for general results
interface WinningCandidate {
  id: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  electionType: string;
  category: string;
  votes: number;
  location: {
    region?: string;
    subregion?: string;
    district?: string;
    constituency?: string;
    subcounty?: string;
    parish?: string;
    village?: string;
  };
}

interface OppositionCandidate {
  id?: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  party: string;
  votes: number;
  winningCandidateId: number;
  electionType: string;
  category: string;
}
interface DistrictCandidate {
  id: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category?: string;
  position?: string;
  councilorType?: string;
  gender?: string;
  region: number;
  subregion: number;
  district: number;
  constituency?: number;
  subcounty?: number;
  parish?: number;
  village?: number;
  districtElectionType: string;
}

export interface ConstituencyMunicipalityCandidate {
  id?: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category?: string | null;
  position?: string | null;
  councilorType?: string | null;
  gender?: string | null;
  region: number;
  subregion: number;
  district: number;
  constituency: number;
  subcounty?: number | null;
  parish?: number | null;
  village?: number | null;
  constituencyMunicipalityElectionType:
    | "mps"
    | "partyStructure"
    | "municipalityMayor"
    | "municipalityMp"
    | "municipalityCouncillors"
    | "municipalitySIGCouncillors";
  vote?: number; // Make it optional with ?
  isSubmitted?: boolean; // Make it optional with ?
  isQualified: boolean;
}

interface FeeHistory {
  id: string;
  date: string;
  amount: number;
  updatedBy: string;
  feeId: string;
  createdAt: string;
  updatedAt: string;
}

interface Fee {
  id: string;
  electionType: string;
  level: string; // Added level
  subType: string;
  category: string | null;
  position: string | null;
  positionPath: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  feeHistory?: FeeHistory[];
}

interface CreateFeeDto {
  electionType: string;
  level: string; // Added level
  subType: string;
  category?: string;
  position?: string;
  positionPath: string;
  amount: number;
}

interface UpdateFeeDto {
  amount: number;
  isActive?: boolean;
}

// Renamed from PaymentSubmission to Payment and added fields
interface Payment {
  candidateId: string;
  amount: number;
  paymentMethod: string;
  transactionCode: string; 
  electionType: string;
  subType: string;
  category?: string;
  position?: string;
  positionPath: string; // Added positionPath
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
  candidateName: string;
  id: string;
  paymentDate: string; // Added paymentDate
}

// Add this interface
interface NationalOppositionCandidateInput {
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  party: string;
  nationalElectionType: string;
  region: string;
  subregion: string;
  district: string;
  constituency: string;
  subcounty: string;
  parish: string;
  vote: number;
}

// Add this interface
interface DistrictOppositionCandidateInput {
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  party: string;
  districtElectionType: string;
  region: string;
  subregion: string;
  district: string;
  constituency: string;
  subcounty: string;
  parish: string;
  vote: number;
}

interface Registrar {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  ninNumber: string;
  administrativeUnitType: 'village' | 'parish' | 'subcounty' | 'constituency';
  administrativeUnitId: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://nrm-elections-production.up.railway.app",
    // baseUrl: "https://version01.nrmec.co.ug",
    baseUrl: "http://localhost:8000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",  }),  tagTypes: [
    "ConstituencyMunicipalityCandidates",
    "Fees",
    "Payments",
    "PollingStations",
    "Registrars",
    "InternalPartyCandidates",
    "PrimariesCandidates",
    "Nominations",
    "Votes",
    "Candidates",
    "CandidateParticipations"
  ],
  endpoints: (builder) => ({
    getStats: builder.query<StatsResponse, void>({
      query: () => ({
        url: "stats/administrative-units",
        method: "GET",
      }),
    }),
    getUsers: builder.query<User[], void>({
      query: () => "users",
    }),
    addUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: "add-user",
        method: "POST",
        body: user,
      }),
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: `users/${user.id}`,
        method: "PUT",
        body: user,
      }),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
    }),
    getDistricts: builder.query<District[], void>({
      query: () => "districts",
    }),
    getSubregions: builder.query<Subregion[], void>({
      query: () => "subregions",
    }),
    getRegions: builder.query<Region[], void>({
      query: () => "regions",
    }),
    addRegion: builder.mutation<Region, Partial<Region>>({
      query: (region) => ({
        url: "regions",
        method: "POST",
        body: region,
      }),
    }),
    updateRegion: builder.mutation<Region, Region>({
      query: (region) => ({
        url: `regions/${region.id}`,
        method: "PUT",
        body: region,
      }),
    }),
    deleteRegion: builder.mutation<void, number>({
      query: (id) => ({
        url: `regions/${id}`,
        method: "DELETE",
      }),
    }),
    addSubregion: builder.mutation<Subregion, Partial<Subregion>>({
      query: (subregion) => ({
        url: "subregions",
        method: "POST",
        body: subregion,
      }),
    }),
    updateSubregion: builder.mutation<
      Subregion,
      { id: number; updates: Partial<Subregion> }
    >({
      query: ({ id, updates }) => ({
        url: `subregions/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteSubregion: builder.mutation<void, number>({
      query: (id) => ({
        url: `subregions/${id}`,
        method: "DELETE",
      }),
    }),
    createDistrict: builder.mutation<District, Partial<District>>({
      query: (district) => ({
        url: "districts",
        method: "POST",
        body: district,
      }),
    }),
    updateDistrict: builder.mutation<
      District,
      { id: number; updates: Partial<District> }
    >({
      query: ({ id, updates }) => ({
        url: `districts/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteDistrict: builder.mutation<void, number>({
      query: (id) => ({
        url: `districts/${id}`,
        method: "DELETE",
      }),
    }),
    getConstituenciesAndMunicipalities: builder.query<
      ConstituencyMunicipality[],
      void
    >({
      query: () => "constituencies-municipalities",
    }),
    createConstituencyMunicipality: builder.mutation<
      ConstituencyMunicipality,
      Partial<ConstituencyMunicipality>
    >({
      query: (entity) => ({
        url: "constituencies-municipalities",
        method: "POST",
        body: entity,
      }),
    }),
    updateConstituencyMunicipality: builder.mutation<
      ConstituencyMunicipality,
      { id: number; updates: Partial<ConstituencyMunicipality> }
    >({
      query: ({ id, updates }) => ({
        url: `constituencies-municipalities/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteConstituencyMunicipality: builder.mutation<void, number>({
      query: (id) => ({
        url: `constituencies-municipalities/${id}`,
        method: "DELETE",
      }),
    }),
    getSubcountyDivisions: builder.query<SubcountyDivision[], void>({
      query: () => "subcounty-divisions",
    }),
    createSubcountyDivision: builder.mutation<
      SubcountyDivision,
      Partial<SubcountyDivision>
    >({
      query: (body) => ({
        url: "subcounty-divisions",
        method: "POST",
        body,
      }),
    }),
    updateSubcountyDivision: builder.mutation<
      SubcountyDivision,
      { id: number; updates: Partial<SubcountyDivision> }
    >({
      query: ({ id, updates }) => ({
        url: `subcounty-divisions/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteSubcountyDivision: builder.mutation<void, number>({
      query: (id) => ({
        url: `subcounty-divisions/${id}`,
        method: "DELETE",
      }),
    }),
    getParishWards: builder.query<ParishWard[], void>({
      query: () => "parish-wards",
    }),
    createParishWard: builder.mutation<ParishWard, Partial<ParishWard>>({
      query: (body) => ({
        url: "parish-wards",
        method: "POST",
        body,
      }),
    }),
    updateParishWard: builder.mutation<
      ParishWard,
      { id: number; updates: Partial<ParishWard> }
    >({
      query: ({ id, updates }) => ({
        url: `parish-wards/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteParishWard: builder.mutation<void, number>({
      query: (id) => ({
        url: `parish-wards/${id}`,
        method: "DELETE",
      }),
    }),
    getVillageCells: builder.query<VillageCellsResponse, VillageCellsParams>({
      query: (params) => ({
        url: 'village-cells',
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
        },
      }),
    }),

    getVillagesByParish: builder.query<VillagesByParishResponse, number>({
      query: (parishId) => ({
        url: `village-cells/by-parish/${parishId}`,
        method: "GET",
      }),
    }),

    createVillageCell: builder.mutation<VillageCell, Partial<VillageCell>>({
      query: (body) => ({
        url: "village-cells",
        method: "POST",
        body,
      }),
    }),
    updateVillageCell: builder.mutation<
      VillageCell,
      { id: number; updates: Partial<VillageCell> }
    >({
      query: ({ id, updates }) => ({
        url: `village-cells/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteVillageCell: builder.mutation<void, number>({
      query: (id) => ({
        url: `village-cells/${id}`,
        method: "DELETE",
      }),
    }),
    getNationals: builder.query<National[], void>({
      query: () => "electoral-positions/national",
    }),
    createNational: builder.mutation<National, Partial<National>>({
      query: (national) => ({
        url: "electoral-positions/national",
        method: "POST",
        body: national,
      }),
    }),
    updateNational: builder.mutation<
      National,
      { id: number; updates: Partial<National> }
    >({
      query: ({ id, updates }) => ({
        url: `electoral-positions/national/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteNational: builder.mutation<void, number>({
      query: (id) => ({
        url: `electoral-positions/national/${id}`,
        method: "DELETE",
      }),
    }),
    getDistrictCandidates: builder.query<DistrictCandidate[], void>({
      query: () => "electoral-positions/district-candidates",
    }),
    createDistrictCandidate: builder.mutation<
      DistrictCandidate,
      Partial<DistrictCandidate>
    >({
      query: (candidate) => ({
        url: "electoral-positions//district-candidates",
        method: "POST",
        body: candidate,
      }),
    }),
    updateDistrictCandidate: builder.mutation<
      DistrictCandidate,
      { id: number; updates: Partial<DistrictCandidate> }
    >({
      query: ({ id, updates }) => ({
        url: `electoral-positions/district-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteDistrictCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `electoral-positions/district-candidates/${id}`,
        method: "DELETE",
      }),
    }),
    getConstituencyMunicipalityCandidates: builder.query<
      ConstituencyMunicipalityCandidate[],
      void
    >({
      query: () => "electoral-positions/constituency-municipality-candidates",
      providesTags: ["ConstituencyMunicipalityCandidates"],
    }),
    createConstituencyMunicipalityCandidate: builder.mutation<
      ConstituencyMunicipalityCandidate,
      Partial<ConstituencyMunicipalityCandidate>
    >({
      query: (candidate) => ({
        url: "electoral-positions/constituency-municipality-candidates",
        method: "POST",
        body: candidate,
      }),
      invalidatesTags: ["ConstituencyMunicipalityCandidates"],
    }),
    updateConstituencyMunicipalityCandidate: builder.mutation<
      ConstituencyMunicipalityCandidate,
      { id: number; updates: Partial<ConstituencyMunicipalityCandidate> }
    >({
      query: ({ id, updates }) => ({
        url: `electoral-positions/constituency-municipality-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["ConstituencyMunicipalityCandidates"],
    }),
    deleteConstituencyMunicipalityCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `electoral-positions/constituency-municipality-candidates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ConstituencyMunicipalityCandidates"],
    }),
    getSubcountyDivisionCandidates: builder.query({
      query: () => "electoral-positions/subcounties-divisions-candidates",
    }),

    createSubcountyDivisionCandidate: builder.mutation({
      query: (candidate) => ({
        url: "electoral-positions/subcounties-divisions-candidates",
        method: "POST",
        body: candidate,
      }),
    }),

    updateSubcountyDivisionCandidate: builder.mutation({
      query: ({ id, updates }) => ({
        url: `electoral-positions/subcounties-divisions-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),

    deleteSubcountyDivisionCandidate: builder.mutation({
      query: (id) => ({
        url: `electoral-positions/subcounties-divisions-candidates/${id}`,
        method: "DELETE",
      }),
    }),
    getParishWardCandidates: builder.query({
      query: () => "electoral-positions/parishes-wards-candidates",
    }),

    createParishWardCandidate: builder.mutation({
      query: (candidate) => ({
        url: "electoral-positions/parishes-wards-candidates",
        method: "POST",
        body: candidate,
      }),
    }),

    updateParishWardCandidate: builder.mutation({
      query: ({ id, updates }) => ({
        url: `electoral-positions/parishes-wards-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),

    deleteParishWardCandidate: builder.mutation({
      query: (id) => ({
        url: `electoral-positions/parishes-wards-candidates/${id}`,
        method: "DELETE",
      }),
    }),
    getVillageCellCandidates: builder.query({
      query: () => ({
        url: "electoral-positions/village-cell-candidates",
        method: "GET",
      }),
    }),
    createVillageCellCandidate: builder.mutation({
      query: (candidate) => ({
        url: "electoral-positions/village-cell-candidates",
        method: "POST",
        body: candidate,
      }),
    }),
    updateVillageCellCandidate: builder.mutation({
      query: ({ id, updates }) => ({
        url: `electoral-positions/village-cell-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteVillageCellCandidate: builder.mutation({
      query: (id) => ({
        url: `electoral-positions/village-cell-candidates/${id}`,
        method: "DELETE",
      }),
    }),

    // Get winning candidates grouped by category
    getWinningCandidates: builder.query<
      { [key: string]: WinningCandidate[] },
      void
    >({
      query: () => "general-results/winners",
    }),

    // Add opposition candidate
    // addOppositionCandidate: builder.mutation<
    //   OppositionCandidate,
    //   Partial<OppositionCandidate>
    // >({
    //   query: (candidate) => ({
    //     url: "general-results/opposition",
    //     method: "POST",
    //     body: candidate,
    //   }),
    // }),

    // Get opposition candidates
    getOppositionCandidates: builder.query<OppositionCandidate[], void>({
      query: () => "electoral-positions/opposition-candidates",
    }),

    createOppositionCandidate: builder.mutation<
      OppositionCandidate,
      Partial<OppositionCandidate>
    >({
      query: (candidate) => ({
        url: 'electoral-positions/opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),
    updateOppositionCandidate: builder.mutation<
      OppositionCandidate,
      { id: number; updates: Partial<OppositionCandidate> }
    >({
      query: ({ id, updates }) => ({
        url: `electoral-positions/opposition-candidates/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteOppositionCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `electoral-positions/opposition-candidates/${id}`,
        method: "DELETE",
      }),
    }),

    
    // nrm-client/src/store/api/baseApi.ts
    getRegionDetails: builder.query({
      query: (id) => `/regions/${id}/details`,
    }),

    getSubregionDetails: builder.query({
      query: (id) => `/subregions/${id}/details`,
    }),

    getDistrictDetails: builder.query<any, string>({
      query: (id) => `districts/${id}/details`,
    }),

    getConstituencyMunicipalityDetails: builder.query<any, string>({
      query: (id) => `/constituencies-municipalities/${id}/details`,
    }),

    getSubcountyDivisionDetails: builder.query<any, string>({
      query: (id) => `subcounty-divisions/${id}/details`,
    }),

    getParishWardDetails: builder.query<any, string>({
      query: (id) => `parish-wards/${id}/details`,
    }),

    getVillageCellDetails: builder.query<any, string>({
      query: (id) => `village-cells/${id}/details`,
    }),

    getRegionSummary: builder.query({
      query: () => "/regions/summary",
    }),


    getDashboardStats: builder.query({
      query: () => "stats/dashboard",
    }),

    getCandidateStats: builder.query<any, void>({
      query: () => "stats/candidates",
    }),
    
    getCandidateReport: builder.query<any, Record<string, any>>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        // Add all filters to query params
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        
        return `stats/candidates/report?${queryParams.toString()}`;
      },
    }),


//********************************************START OF FEES */

    // Get all fees
    getFees: builder.query<Fee[], void>({
      query: () => ({
        url: "/fees",
        method: "GET",
      }),
      providesTags: ["Fees"],
    }),

    // Get fees by election type
    getFeesByElectionType: builder.query<Fee[], string>({
      query: (electionType) => ({
        url: `/fees/election-type/${electionType}`,
        method: "GET",
      }),
      providesTags: ["Fees"],
    }),

    // Get fees by sub type
    getFeesBySubType: builder.query<Fee[], string>({
      query: (subType) => ({
        url: `/fees/sub-type/${subType}`,
        method: "GET",
      }),
      providesTags: ["Fees"],
    }),

    // Create new fee
    createFee: builder.mutation<Fee, CreateFeeDto>({
      query: (feeData) => ({
        url: "/fees",
        method: "POST",
        body: feeData,
      }),
      invalidatesTags: ["Fees"],
    }),

    // Update fee
    updateFee: builder.mutation<Fee, { id: string; updates: UpdateFeeDto }>({
      query: ({ id, updates }) => ({
        url: `/fees/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Fees"],
    }),

    // Get fee history
    getFeeHistory: builder.query<FeeHistory[], string>({
      query: (feeId) => ({
        url: `/fees/${feeId}/history`,
        method: "GET",
      }),
    }),

    // Get candidate fee
    getCandidateFee: builder.query<
      { fee: number },
      {
        ninNumber: string;
        electionType: string; // Changed from Fee["electionType"] to string
        subType: string;
        category?: string;
        position?: string;
      }
    >({
      query: (params) => ({
        url: "/fees/candidate-fee",
        method: "GET",
        params,
      }),
    }),

    getPayments: builder.query<Payment[], void>({ // Changed PaymentSubmission[] to Payment[]
      query: () => ({
        url: '/fees/payments',
        method: 'GET',
      }),
      providesTags: ['Payments'], // Add 'Payments' to your tagTypes array
    }),
    
    submitPayment: builder.mutation<Payment, Partial<Payment>>({ // Changed PaymentSubmission to Payment
      query: (payment) => ({
        url: '/fees/payments',
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Payments'], // This will refetch the payments list after a new payment
    }),
//********************************************START OF FEES */

    // Add this endpoint in baseApi endpoints
    createNationalOppositionCandidate: builder.mutation<any, NationalOppositionCandidateInput>({
      query: (candidate) => ({
        url: 'electoral-positions/national-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),
    getNationalOppositionCandidates: builder.query<NationalOppositionCandidateInput[], void>({
      query: () => 'electoral-positions/national-opposition-candidates',
    }),

    // Add these endpoints in the builder
    createDistrictOppositionCandidate: builder.mutation<any, DistrictOppositionCandidateInput>({
      query: (candidate) => ({
        url: 'electoral-positions/district-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),

    getDistrictOppositionCandidates: builder.query<DistrictOppositionCandidateInput[], void>({
      query: () => 'electoral-positions/district-opposition-candidates',
    }),

    // Add these endpoints in the builder
    createConstituencyMunicipalityOppositionCandidate: builder.mutation<any, any>({
      query: (candidate) => ({
        url: 'electoral-positions/constituency-municipality-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),

    getConstituencyMunicipalityOppositionCandidates: builder.query<any[], void>({
      query: () => 'electoral-positions/constituency-municipality-opposition-candidates',
    }),

    // Add these endpoints for subcounty opposition candidates
    createSubcountiesDivisionsOppositionCandidate: builder.mutation<any, any>({
      query: (candidate) => ({
        url: 'electoral-positions/subcounties-divisions-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),

    getSubcountiesDivisionsOppositionCandidates: builder.query<any[], void>({
      query: () => 'electoral-positions/subcounties-divisions-opposition-candidates',
    }),

    // Add these endpoints for parish/ward opposition candidates
    createParishesWardsOppositionCandidate: builder.mutation<any, any>({
      query: (candidate) => ({
        url: 'electoral-positions/parishes-wards-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),

    getParishesWardsOppositionCandidates: builder.query<any[], void>({
      query: () => 'electoral-positions/parishes-wards-opposition-candidates',
    }),

    // Add these endpoints for village/cell opposition candidates
    createVillageCellOppositionCandidate: builder.mutation<any, any>({
      query: (candidate) => ({
        url: 'electoral-positions/village-cell-opposition-candidates',
        method: 'POST',
        body: candidate,
      }),
    }),

    getVillageCellOppositionCandidates: builder.query<any[], void>({
      query: () => 'electoral-positions/village-cell-opposition-candidates',
    }),

    getPollingStations: builder.query<any[], void>({
      query: () => "polling-stations",
    }),

    createPollingStation: builder.mutation<any, Partial<any>>({
      query: (station) => ({
        url: "polling-stations",
        method: "POST",
        body: station,
      }),
      invalidatesTags: ["PollingStations"],
    }),

    updatePollingStation: builder.mutation<any, { id: number; updates: any }>({
      query: ({ id, updates }) => ({
        url: `polling-stations/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["PollingStations"],
    }),

    getRegistrars: builder.query<Registrar[], void>({
      query: () => 'registrars',
      providesTags: ['Registrars'],
    }),
    
    createRegistrar: builder.mutation({
      query: (data) => ({
        url: '/registrars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Registrars'],
    }),
    
    updateRegistrar: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/registrars/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Registrars'],
    }),
    
    deleteRegistrar: builder.mutation({
      query: (id) => ({
        url: `/registrars/${id}`,
        method: 'DELETE',
      }),
    }),

    searchAdministrativeUnits: builder.query({
      query: (searchTerm) => ({
        url: `/global/search?term=${encodeURIComponent(searchTerm)}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Don't cache search results
    }),

    searchVillagesWithHierarchy: builder.query({
      query: (searchTerm) => ({
        url: `/global/village?term=${encodeURIComponent(searchTerm)}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Don't cache search results
    }),

  }),
});

export const {
  useGetStatsQuery,
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDistrictsQuery,
  useGetSubregionsQuery,
  useGetRegionsQuery,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  useAddSubregionMutation,
  useUpdateSubregionMutation,
  useDeleteSubregionMutation,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
  useGetConstituenciesAndMunicipalitiesQuery,
  useCreateConstituencyMunicipalityMutation,
  useUpdateConstituencyMunicipalityMutation,
  useDeleteConstituencyMunicipalityMutation,
  useGetSubcountyDivisionsQuery,
  useCreateSubcountyDivisionMutation,
  useUpdateSubcountyDivisionMutation,
  useDeleteSubcountyDivisionMutation,
  useGetParishWardsQuery,
  useCreateParishWardMutation,
  useUpdateParishWardMutation,
  useDeleteParishWardMutation,
  useGetVillageCellsQuery,
  useCreateVillageCellMutation,
  useUpdateVillageCellMutation,
  useDeleteVillageCellMutation,
  useGetNationalsQuery,
  useCreateNationalMutation,
  useUpdateNationalMutation,
  useDeleteNationalMutation,
  useGetDistrictCandidatesQuery,
  useCreateDistrictCandidateMutation,
  useUpdateDistrictCandidateMutation,
  useDeleteDistrictCandidateMutation,
  useGetConstituencyMunicipalityCandidatesQuery,
  useCreateConstituencyMunicipalityCandidateMutation,
  useUpdateConstituencyMunicipalityCandidateMutation,
  useDeleteConstituencyMunicipalityCandidateMutation,
  useGetSubcountyDivisionCandidatesQuery,
  useCreateSubcountyDivisionCandidateMutation,
  useUpdateSubcountyDivisionCandidateMutation,
  useDeleteSubcountyDivisionCandidateMutation,
  useGetParishWardCandidatesQuery,
  useCreateParishWardCandidateMutation,
  useUpdateParishWardCandidateMutation,
  useDeleteParishWardCandidateMutation,
  useGetVillageCellCandidatesQuery,
  useCreateVillageCellCandidateMutation,
  useUpdateVillageCellCandidateMutation,
  useDeleteVillageCellCandidateMutation,

  // ... existing exports ...
  useGetWinningCandidatesQuery,
  // useAddOppositionCandidateMutation,
  useGetOppositionCandidatesQuery,
  useUpdateOppositionCandidateMutation,
  useCreateOppositionCandidateMutation,
  useDeleteOppositionCandidateMutation,
  useGetRegionDetailsQuery,
  useGetSubregionDetailsQuery,
  useGetDistrictDetailsQuery,
  useGetConstituencyMunicipalityDetailsQuery,
  useGetSubcountyDivisionDetailsQuery,
  useGetParishWardDetailsQuery,
  useGetVillageCellDetailsQuery,
  useGetRegionSummaryQuery,
  useGetDashboardStatsQuery,
  useGetCandidateStatsQuery,
  useGetCandidateReportQuery,

  useGetFeesQuery,
  useGetFeesByElectionTypeQuery,
  useGetFeesBySubTypeQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useGetFeeHistoryQuery,
  useGetCandidateFeeQuery,
  useSubmitPaymentMutation,
  useGetPaymentsQuery,
  useCreateNationalOppositionCandidateMutation,
  useGetNationalOppositionCandidatesQuery,
  useCreateDistrictOppositionCandidateMutation,
  useGetDistrictOppositionCandidatesQuery,
  useCreateConstituencyMunicipalityOppositionCandidateMutation,
  useGetConstituencyMunicipalityOppositionCandidatesQuery,
  useCreateSubcountiesDivisionsOppositionCandidateMutation,
  useGetSubcountiesDivisionsOppositionCandidatesQuery,
  useCreateParishesWardsOppositionCandidateMutation,
  useGetParishesWardsOppositionCandidatesQuery,
  useCreateVillageCellOppositionCandidateMutation,
  useGetVillageCellOppositionCandidatesQuery,
  useGetPollingStationsQuery,
  useCreatePollingStationMutation,
  useUpdatePollingStationMutation,
  useGetRegistrarsQuery,
  useCreateRegistrarMutation,
  useDeleteRegistrarMutation,

  useSearchAdministrativeUnitsQuery,
  useSearchVillagesWithHierarchyQuery,

  useGetVillagesByParishQuery
} = baseApi;

// Define nomination related types
interface NominationRequest {
  candidateId: number;
  participationId: number;
  electionType: string;
  level: string;
  positionPath?: string;
  notes?: string;
  reasonForNomination?: string;
}

interface RemoveNominationRequest {
  nominationId: number;
  electionType: string;
  level: string;
}

// Add nominations endpoints to baseApi
baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all candidates eligible for nomination
    getCandidatesForNomination: builder.query({
      query: (params) => ({
        url: `/nominations/candidates`,
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
    }),

    // Nominate a candidate
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
  overrideExisting: false,
});

// Export nomination hooks
export const {
  useGetCandidatesForNominationQuery,
  useGetNominatedCandidatesQuery,
  useNominateCandidateMutation,
  useRemoveNominationMutation,
} = baseApi;
