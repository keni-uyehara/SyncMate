import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../supabaseClient';
import type { Database } from '../../types/database.types';

type ComplianceIssue = Database['public']['Tables']['compliance_issues']['Row'];

interface ChartData {
  issueTrends: Array<{
    date: string;
    open: number;
    inProgress: number;
    closed: number;
  }>;
  issueCategories: Array<{
    name: string;
    value: number;
  }>;
  severityDistribution: Array<{
    name: string;
    value: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Status-specific colors for better visualization
const STATUS_COLORS = {
  'Open': '#FFBB28',      // Yellow for open issues
  'In Progress': '#0088FE', // Blue for in progress
  'Closed': '#00C49F',    // Green for closed issues
  'default': '#8884D8'    // Purple for any other status
};

export function ComplianceCharts() {
  const [chartData, setChartData] = useState<ChartData>({
    issueTrends: [],
    issueCategories: [],
    severityDistribution: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format issue type names
  const formatIssueTypeName = (name: string): string => {
    if (!name || typeof name !== 'string') return 'Unknown';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all compliance issues
        const { data: issues, error: fetchError } = await supabase
          .from('compliance_issues')
          .select('*')
          .order('date_created', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (!issues) {
          throw new Error('No data received');
        }

        // Process data for charts
        const processedData = processComplianceData(issues);
        setChartData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processComplianceData = (issues: ComplianceIssue[]): ChartData => {
    // Filter out invalid dates and sort by date
    const validIssues = issues.filter(issue => 
      issue.date_created && !isNaN(new Date(issue.date_created).getTime())
    ).sort((a, b) => new Date(a.date_created!).getTime() - new Date(b.date_created!).getTime());

    // Group by date and status for current state
    const currentStatusByDate = validIssues.reduce((acc, issue) => {
      const date = new Date(issue.date_created!).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { open: 0, inProgress: 0, closed: 0 };
      }
      
      const status = issue.status || 'Open';
      switch (status) {
        case 'Open':
          acc[date].open++;
          break;
        case 'In Progress':
          acc[date].inProgress++;
          break;
        case 'Closed':
          acc[date].closed++;
          break;
        default:
          acc[date].open++; // Default to open for unknown status
      }
      return acc;
    }, {} as Record<string, { open: number; inProgress: number; closed: number }>);

    // Convert to array and sort by date
    const issueTrends = Object.entries(currentStatusByDate)
      .map(([date, counts]) => ({
        date,
        open: counts.open,
        inProgress: counts.inProgress,
        closed: counts.closed,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Show only last 30 days to avoid overcrowding

    // Group issues by type for categories
    const issueTypeCounts = validIssues.reduce((acc, issue) => {
      const issueType = issue.issue_type || 'Unknown';
      acc[issueType] = (acc[issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issueCategories = Object.entries(issueTypeCounts)
      .map(([name, value]) => ({ 
        name: formatIssueTypeName(name), 
        value 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories
      .filter((item) => item.name !== 'Unknown');

    // Group by severity
    const severityCounts = validIssues.reduce((acc, issue) => {
      const severity = issue.severity || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityDistribution = Object.entries(severityCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.name !== 'Unknown');

    // Group by status with better handling
    const statusCounts = validIssues.reduce((acc, issue) => {
      const status = issue.status || 'Open';
      // Normalize status names for consistency
      const normalizedStatus = status.trim();
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.name && item.name !== 'Unknown')
      .sort((a, b) => {
        // Sort by priority: Open first, then In Progress, then Closed
        const priority = { 'Open': 1, 'In Progress': 2, 'Closed': 3 };
        const aPriority = priority[a.name as keyof typeof priority] || 4;
        const bPriority = priority[b.name as keyof typeof priority] || 4;
        return aPriority - bPriority;
      });

    return {
      issueTrends,
      issueCategories,
      severityDistribution,
      statusDistribution,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Check if we have any data
  const totalIssues = chartData.issueCategories.reduce((sum, item) => sum + item.value, 0);
  
  if (totalIssues === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center text-gray-500">
          <p className="font-medium">No compliance data available</p>
          <p className="text-sm">Create some compliance issues to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Issue Trends Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-3"></div>
            Issue Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.issueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="open" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Open Issues"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="inProgress" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="In Progress"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="closed" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Closed Issues"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
            Top Issue Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.issueCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [`${value} issues`, 'Count']}
                labelFormatter={(label: any) => `Issue Type: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-3"></div>
            Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.severityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.severityDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3"></div>
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.statusDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || STATUS_COLORS.default} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [`${value} issues`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={(value: any) => (
                  <span style={{ color: '#374151', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
