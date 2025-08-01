import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Filter,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Printer,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useGetNominatedCandidatesQuery } from "../../store/api/nominations_api";
import primariesElectionsConfig from "../../config/primaries_elections_config.json";
import internalPartyElectionsConfig from "../../config/intenal_party_elections_config.json";
import Loading from "../Loading";

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
  isNominated?: boolean;
  feesPaid?: boolean;
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    electionType: string;
    gender?: string;
  };
  region?: { id: number; name: string };
  subregion?: { id: number; name: string };
  district?: { id: number; name: string };
  constituencyMunicipality?: { id: number; name: string };
  subcountyDivision?: { id: number; name: string };
  parishWard?: { id: number; name: string };
  villageCell?: { id: number; name: string };
}

interface NominationsReportProps {
  electionType: "PRIMARIES" | "INTERNAL_PARTY";
}

const NominationsReport: React.FC<NominationsReportProps> = ({
  electionType,
}) => {
  const [filters, setFilters] = useState<any>({
    level: "",
    category: "",
    position: "",
    regionId: "",
    districtId: "",
  });

  const [reportData, setReportData] = useState<{
    totalNominated: number;
    byLevel: { [key: string]: number };
    byDistrict: { [key: string]: number };
    byPosition: { [key: string]: number };
    byGender: { [key: string]: number };
    candidates: CandidateParticipation[];
  }>({
    totalNominated: 0,
    byLevel: {},
    byDistrict: {},
    byPosition: {},
    byGender: {},
    candidates: [],
  });

  // Get configuration
  const config =
    electionType === "INTERNAL_PARTY"
      ? internalPartyElectionsConfig?.INTERNAL_PARTY
      : primariesElectionsConfig?.PRIMARIES;
  const levels = Object.keys(config || {});

  // Get nominated candidates
  const {
    data: nominatedCandidates = [],
    isLoading,
    refetch,
  } = useGetNominatedCandidatesQuery({
    electionType,
    ...filters,
  });

  // Process data for reports
  useEffect(() => {
    if (nominatedCandidates.length > 0) {
      const totalNominated = nominatedCandidates.length;

      // Group by level
      const byLevel = nominatedCandidates.reduce((acc: any, candidate) => {
        const level = candidate.level.replace(/_/g, " ");
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      // Group by district
      const byDistrict = nominatedCandidates.reduce((acc: any, candidate) => {
        const district = candidate.district?.name || "Unknown";
        acc[district] = (acc[district] || 0) + 1;
        return acc;
      }, {});

      // Group by position
      const byPosition = nominatedCandidates.reduce((acc: any, candidate) => {
        const position = candidate.position;
        acc[position] = (acc[position] || 0) + 1;
        return acc;
      }, {});

      // Group by gender
      const byGender = nominatedCandidates.reduce((acc: any, candidate) => {
        const gender = candidate.candidate?.gender || "Unknown";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {});

      setReportData({
        totalNominated,
        byLevel,
        byDistrict,
        byPosition,
        byGender,
        candidates: nominatedCandidates,
      });
    }
  }, [nominatedCandidates]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Name",
        "NIN",
        "Phone",
        "Gender",
        "Level",
        "Position",
        "District",
        "Category",
        "Votes",
      ],
      ...reportData.candidates.map((candidate) => [
        `${candidate.candidate?.firstName} ${candidate.candidate?.lastName}`,
        candidate.candidate?.ninNumber,
        candidate.candidate?.phoneNumber,
        candidate.candidate?.gender || "",
        candidate.level.replace(/_/g, " "),
        candidate.position,
        candidate.district?.name || "",
        candidate.category,
        candidate.vote.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nominations-report-${electionType.toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLevelConfig = (selectedLevel: string) => {
    if (!selectedLevel || !config) return {};
    return config[selectedLevel] || {};
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Nominations Report
          </h1>
          <p className="text-gray-600 mt-2">
            {electionType === "INTERNAL_PARTY" ? "Internal Party" : "Primaries"}{" "}
            Elections Nominations Report
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<Printer />}
            onClick={exportToPDF}
            className="hidden sm:flex"
          >
            Print Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={filters.level}
                  label="Level"
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {filters.level && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {Object.keys(getLevelConfig(filters.level)).map(
                      (category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search Position"
                value={filters.position}
                onChange={(e) => handleFilterChange("position", e.target.value)}
                placeholder="Enter position name"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({})}
                className="h-14"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-blue-50">
            <CardContent className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <Typography variant="h4" className="font-bold text-blue-600">
                {reportData.totalNominated}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Nominated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-green-50">
            <CardContent className="text-center">
              <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <Typography variant="h4" className="font-bold text-green-600">
                {Object.keys(reportData.byDistrict).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Districts Covered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-purple-50">
            <CardContent className="text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <Typography variant="h4" className="font-bold text-purple-600">
                {Object.keys(reportData.byPosition).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Unique Positions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-orange-50">
            <CardContent className="text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <Typography variant="h4" className="font-bold text-orange-600">
                {Object.keys(reportData.byLevel).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Administrative Levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breakdown Charts/Tables */}
      <Grid container spacing={3}>
        {/* By Level */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Nominations by Administrative Level
              </Typography>
              <Box className="space-y-2">
                {Object.entries(reportData.byLevel).map(([level, count]) => (
                  <div
                    key={level}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <Typography variant="body2">{level}</Typography>
                    <Chip label={count} size="small" />
                  </div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* By Gender */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Nominations by Gender
              </Typography>
              <Box className="space-y-2">
                {Object.entries(reportData.byGender).map(([gender, count]) => (
                  <div
                    key={gender}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <Typography variant="body2">{gender}</Typography>
                    <Chip
                      label={count}
                      size="small"
                      color={
                        gender === "Female"
                          ? "secondary"
                          : gender === "Male"
                          ? "primary"
                          : "default"
                      }
                    />
                  </div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Breakdowns */}
      <div className="space-y-4">
        {/* By District */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              Nominations by District (
              {Object.keys(reportData.byDistrict).length} districts)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(reportData.byDistrict).map(
                ([district, count]) => (
                  <Grid item xs={12} sm={6} md={4} key={district}>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <Typography variant="body2">{district}</Typography>
                      <Chip label={count} size="small" color="primary" />
                    </div>
                  </Grid>
                )
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* By Position */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              Nominations by Position (
              {Object.keys(reportData.byPosition).length} positions)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(reportData.byPosition).map(
                ([position, count]) => (
                  <Grid item xs={12} sm={6} md={4} key={position}>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <Typography variant="body2">{position}</Typography>
                      <Chip label={count} size="small" color="secondary" />
                    </div>
                  </Grid>
                )
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Detailed Candidates Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Detailed Nominations List ({reportData.candidates.length}{" "}
            candidates)
          </Typography>

          <TableContainer component={Paper} className="max-h-96 overflow-auto">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>NIN</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>Votes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.candidate?.firstName}{" "}
                      {candidate.candidate?.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {candidate.candidate?.ninNumber}
                    </TableCell>
                    <TableCell>{candidate.candidate?.phoneNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={candidate.candidate?.gender || "N/A"}
                        size="small"
                        color={
                          candidate.candidate?.gender === "Female"
                            ? "secondary"
                            : "primary"
                        }
                      />
                    </TableCell>
                    <TableCell>{candidate.level.replace(/_/g, " ")}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>{candidate.district?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={candidate.vote}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NominationsReport;
