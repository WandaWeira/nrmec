import React, { useMemo } from "react";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface PaymentAnalyticsProps {
  payments: any[];
  fees: any[];
  className?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

export default function PaymentAnalytics({ 
  payments, 
  fees, 
  className = "" 
}: PaymentAnalyticsProps) {
  
  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!payments || payments.length === 0) return null;

    // Payment Methods Distribution
    const paymentMethods = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);    const paymentMethodsChart: ChartDataPoint[] = Object.entries(paymentMethods).map(([method, count], index) => ({
      label: method.charAt(0).toUpperCase() + method.slice(1),
      value: count as number,
      color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 5],
      percentage: ((count as number) / payments.length) * 100,
    }));

    // Daily Collections Trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyCollections = payments
      .filter(p => new Date(p.paymentDate) >= thirtyDaysAgo)
      .reduce((acc, p) => {
        const date = new Date(p.paymentDate).toLocaleDateString();
        acc[date] = (acc[date] || 0) + Number(p.amount);
        return acc;
      }, {} as Record<string, number>);    const dailyTrendChart: ChartDataPoint[] = Object.entries(dailyCollections)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => ({
        label: date,
        value: amount as number,
        color: "#3B82F6",
      }));

    // Election Type Distribution by Amount
    const electionTypeAmounts = payments.reduce((acc, p) => {
      const type = p.electionType;
      acc[type] = (acc[type] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);    const electionTypesChart: ChartDataPoint[] = Object.entries(electionTypeAmounts).map(([type, amount], index) => ({
      label: formatElectionType(type),
      value: amount as number,
      color: ["#059669", "#7C3AED", "#DC2626", "#D97706", "#1D4ED8"][index % 5],
    }));

    // Status Distribution
    const statusCounts = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);    const statusChart: ChartDataPoint[] = Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count as number,
      color: status === "completed" ? "#10B981" : status === "pending" ? "#F59E0B" : "#EF4444",
      percentage: ((count as number) / payments.length) * 100,
    }));

    // Monthly Trends
    const monthlyCollections = payments.reduce((acc, p) => {
      const month = new Date(p.paymentDate).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      acc[month] = (acc[month] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);    const monthlyTrendChart: ChartDataPoint[] = Object.entries(monthlyCollections)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, amount]) => ({
        label: month,
        value: amount as number,
        color: "#8B5CF6",
      }));

    // Regional Distribution (if available)
    const regionalCollections = payments.reduce((acc, p) => {
      const region = p.regionName || "Unknown";
      acc[region] = (acc[region] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);    const regionalChart: ChartDataPoint[] = Object.entries(regionalCollections)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10) // Top 10 regions
      .map(([region, amount], index) => ({
        label: region,
        value: amount as number,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate distinct colors
      }));

    return {
      paymentMethodsChart,
      dailyTrendChart,
      electionTypesChart,
      statusChart,
      monthlyTrendChart,
      regionalChart,
    };
  }, [payments, fees]);

  const formatElectionType = (type: string) => {
    const mappings: Record<string, string> = {
      nationalElectionType: "National",
      districtElectionType: "District",
      constituencyMunicipalityElectionType: "Constituency/Municipality",
      subcountiesDivisionsElectionType: "Subcounty/Division",
      parishwardElectionType: "Parish/Ward",
      villageCellElectionType: "Village/Cell",
    };
    return mappings[type] || type.replace(/([A-Z])/g, " $1").trim();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  // Enhanced chart components using Recharts
  const PieChartComponent = ({ data, title }: { data: ChartDataPoint[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartData = data.map(item => ({
      name: item.label,
      value: item.value,
      color: item.color,
      percentage: item.percentage
    }));
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-blue-600" />
          {title}
        </h3>
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Pie Chart */}
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="w-full lg:w-1/2 space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  {item.percentage && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    );
  };
  const BarChartComponent = ({ data, title, valueFormatter }: { 
    data: ChartDataPoint[], 
    title: string,
    valueFormatter?: (value: number) => string 
  }) => {
    const chartData = data.slice(0, 10).map(item => ({
      name: item.label,
      value: item.value,
      color: item.color
    }));
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          {title}
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => valueFormatter ? valueFormatter(value) : value.toString()}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                valueFormatter ? valueFormatter(value) : value, 
                "Amount"
              ]}
            />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  const TrendChartComponent = ({ data, title, valueFormatter }: {
    data: ChartDataPoint[],
    title: string,
    valueFormatter?: (value: number) => string
  }) => {
    // Transform data for Recharts format
    const chartData = data.map(item => ({
      name: item.label,
      value: item.value,
      displayValue: valueFormatter ? valueFormatter(item.value) : item.value.toString()
    }));

    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          {title}
        </h3>
        
        <div className="space-y-4">
          {/* Recharts Line Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => valueFormatter ? valueFormatter(value) : value.toString()}
                />
                <Tooltip 
                  formatter={(value: any) => [
                    valueFormatter ? valueFormatter(value as number) : value,
                    'Amount'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Highest</p>
              <p className="text-sm font-semibold text-gray-900">
                {valueFormatter ? valueFormatter(maxValue) : maxValue}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Latest</p>
              <p className="text-sm font-semibold text-gray-900">
                {data.length > 0 ? (valueFormatter ? valueFormatter(data[data.length - 1].value) : data[data.length - 1].value) : 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lowest</p>
              <p className="text-sm font-semibold text-gray-900">
                {valueFormatter ? valueFormatter(minValue) : minValue}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!analyticsData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-500">No payment data available for analytics.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Payment Methods</p>
              <p className="text-2xl font-bold">{analyticsData.paymentMethodsChart.length}</p>
            </div>
            <PieChartIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Election Types</p>
              <p className="text-2xl font-bold">{analyticsData.electionTypesChart.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Regions</p>
              <p className="text-2xl font-bold">{analyticsData.regionalChart.length}</p>
            </div>
            <Target className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Daily Average</p>
              <p className="text-2xl font-bold">
                {analyticsData.dailyTrendChart.length > 0 ? 
                  Math.round(analyticsData.dailyTrendChart.reduce((sum, item) => sum + item.value, 0) / analyticsData.dailyTrendChart.length / 1000) + "K" : 
                  "0"
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <PieChartComponent 
          data={analyticsData.paymentMethodsChart} 
          title="Payment Methods Distribution" 
        />

        {/* Payment Status */}
        <PieChartComponent 
          data={analyticsData.statusChart} 
          title="Payment Status Distribution" 
        />

        {/* Election Types by Amount */}
        <BarChartComponent 
          data={analyticsData.electionTypesChart} 
          title="Collections by Election Type"
          valueFormatter={formatCurrency}
        />

        {/* Top Regions */}
        <BarChartComponent 
          data={analyticsData.regionalChart} 
          title="Top Regions by Collections"
          valueFormatter={formatCurrency}
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <TrendChartComponent 
          data={analyticsData.dailyTrendChart} 
          title="Daily Collections Trend (Last 30 Days)"
          valueFormatter={formatCurrency}
        />

        {/* Monthly Trend */}
        <TrendChartComponent 
          data={analyticsData.monthlyTrendChart} 
          title="Monthly Collections Trend"
          valueFormatter={formatCurrency}
        />
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Analytics Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Most Popular Payment Method</h4>
            <p className="text-lg font-bold text-blue-900">
              {analyticsData.paymentMethodsChart.sort((a, b) => b.value - a.value)[0]?.label || "N/A"}
            </p>
            <p className="text-xs text-blue-600">
              {analyticsData.paymentMethodsChart.sort((a, b) => b.value - a.value)[0]?.percentage?.toFixed(1) || 0}% of all payments
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Highest Earning Election Type</h4>
            <p className="text-lg font-bold text-green-900">
              {analyticsData.electionTypesChart.sort((a, b) => b.value - a.value)[0]?.label || "N/A"}
            </p>
            <p className="text-xs text-green-600">
              {formatCurrency(analyticsData.electionTypesChart.sort((a, b) => b.value - a.value)[0]?.value || 0)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Top Performing Region</h4>
            <p className="text-lg font-bold text-purple-900">
              {analyticsData.regionalChart[0]?.label || "N/A"}
            </p>
            <p className="text-xs text-purple-600">
              {formatCurrency(analyticsData.regionalChart[0]?.value || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
