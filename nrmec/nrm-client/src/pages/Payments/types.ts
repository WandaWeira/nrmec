// types.ts
interface LocationDetails {
    regionName: string;
    subregionName: string;
    districtName: string;
    constituencyName?: string;
    subcountyName?: string;
    parishName?: string;
    villageName?: string;
  }
  
  interface CandidateFeeDetails {
    id: string;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    electionType: string;
    category?: string;
    position?: string;
    fee: number;
    location: LocationDetails;
  }