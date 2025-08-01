import {
  useGetStatsQuery,
  useGetDashboardStatsQuery,
} from "../store/api/baseApi";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Map,
  LandPlot,
  Home,
  Trees,
  FileText,
  DollarSign,
  Users,
  BarChart3,
} from "lucide-react";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import DashboardSearchBar from "../components/DashboardSearchBar "; // Adjust path as needed
import CandidateStatsSection from "../components/CandidateStatsSection";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface AdminUnit {
  name: string;
  value: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useGetStatsQuery();
  const { data: chartStats } = useGetDashboardStatsQuery({});

  // Add these console logs
  // console.log("chartStats:", chartStats);
  // console.log("statsPerSubregion:", chartStats?.statsPerSubregion);

  // Handle unauthorized error
  useEffect(() => {
    if (error && "status" in error && error.status === 401) {
      navigate("/login");
      localStorage.removeItem("token");
    }
  }, [error, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading stats</div>;
  }

  const defaultStats = {
    regions: "0",
    subregions: "0",
    constituenciesMunicipalities: "0",
    subcountiesDivisions: "0",
    parishesWards: "0",
    villagesCells: "0",
    districts: "0",
  };

  const displayStats = stats || defaultStats;

  // Transform the data for the pie chart
  const adminUnitsData: AdminUnit[] = chartStats?.adminUnitsDistribution
    ? Object.entries(chartStats.adminUnitsDistribution).map(([key, value]) => ({
        name: key,
        value: Number(value) || 0,
      }))
    : [];

  return (
    <>
      <DashboardSearchBar />

      {/* Original Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Regions Card */}
        <div
          onClick={() => navigate("/administrative-units/regions")}
          className="bg-blue-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-full">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">REGIONS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.regions}
              </p>
            </div>
          </div>
        </div>

        {/* Subregions Card */}
        <div
          onClick={() => navigate("/administrative-units/subregions")}
          className="bg-green-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SUBREGIONS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.subregions}
              </p>
            </div>
          </div>
        </div>

        {/* Districts Card */}
        <div
          onClick={() => navigate("/administrative-units/districts")}
          className="bg-yellow-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">DISTRICTS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.districts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Constituencies/Municipalities Card */}
        <div
          onClick={() => navigate("/administrative-units/constituencies")}
          className="bg-purple-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-full">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                CONSTITUENCIES/MUNICIPALITIES
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.constituenciesMunicipalities}
              </p>
            </div>
          </div>
        </div>
        {/* Subcounties/Divisions Card */}
        <div
          onClick={() => navigate("/administrative-units/subcounties")}
          className="bg-orange-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-full">
              <LandPlot className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                SUBCOUNTIES/DIVISIONS
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.subcountiesDivisions}
              </p>
            </div>
          </div>
        </div>

        {/* Parishes/Wards Card */}
        <div
          onClick={() => navigate("/administrative-units/parishes")}
          className="bg-pink-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-pink-500 p-3 rounded-full">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                PARISHES/WARDS
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.parishesWards}
              </p>
            </div>
          </div>
        </div>

        {/* Villages/Cells Card */}
        <div
          onClick={() => navigate("/administrative-units/villages")}
          className="bg-teal-100 rounded-lg p-6 shadow hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-teal-500 p-3 rounded-full">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                VILLAGES/CELLS
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayStats.villagesCells}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Statistics Section */}
      <CandidateStatsSection className="mb-8" />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Districts per Region Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">
            Districts Distribution by Region
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.districtsPerRegion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="districtCount"
                  fill="#3b82f6"
                  name="Number of Districts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Districts per Subregion */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">
            Districts per Subregion
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.statsPerSubregion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subregionName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="districtCount"
                  fill="#0088FE"
                  name="Number of Districts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">
            Constituencies per Subregion
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.statsPerSubregion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subregionName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="constituencyCount"
                  fill="#00C49F"
                  name="Number of Constituencies"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">
            Subcounties per Subregion
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.statsPerSubregion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subregionName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="subcountyCount"
                  fill="#FFBB28"
                  name="Number of Subcounties"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Parishes per Subregion</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.statsPerSubregion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subregionName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="parishCount"
                  fill="#FF8042"
                  name="Number of Parishes"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Villages per Subregion</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStats?.statsPerSubregion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subregionName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="villageCount"
                  fill="#8884d8"
                  name="Number of Villages"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
