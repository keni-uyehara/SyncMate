"use client"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Target,
  Upload,
  FileText,
  Eye,
  Download,
  Activity,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Leaf,
  Phone,
  Home,
  DollarSign,
  Lightbulb,
  ArrowUpRight,
  Bot,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Filter,
} from "lucide-react"

export default function UnifiedTeamLeadDashboard() {
  const recentReports = [
    {
      id: "RPT-001",
      name: "Weekly Compliance Summary",
      entity: "BPI x Ayala Land",
      uploadedBy: "Maria Santos",
      uploadDate: "2024-01-15 09:30",
      status: "Processed",
      issues: 3,
    },
    {
      id: "RPT-002",
      name: "SME Classification Report",
      entity: "BPI x Globe",
      uploadedBy: "John Cruz",
      uploadDate: "2024-01-14 14:20",
      status: "Processing",
      issues: 7,
    },
    {
      id: "RPT-003",
      name: "Green Loans Threshold Report",
      entity: "BPI x AC Energy",
      uploadedBy: "Ana Reyes",
      uploadDate: "2024-01-13 11:45",
      status: "Completed",
      issues: 1,
    },
  ]

  const synergyOpportunities = [
    {
      id: "SYN-001",
      title: "BPI-Ayala Land Housing Bundle",
      entities: ["BPI", "Ayala Land"],
      potential: "High",
      revenue: "₱2.3B",
      customers: "45,000",
      readiness: 92,
      timeline: "Q2 2024",
      status: "Ready to Launch",
    },
    {
      id: "SYN-002",
      title: "Globe-BPI Digital Banking",
      entities: ["BPI", "Globe"],
      potential: "Medium",
      revenue: "₱890M",
      customers: "2.3M",
      readiness: 78,
      timeline: "Q3 2024",
      status: "In Development",
    },
    {
      id: "SYN-003",
      title: "AC Energy Green Loans",
      entities: ["BPI", "AC Energy"],
      potential: "High",
      revenue: "₱1.8B",
      customers: "12,000",
      readiness: 95,
      timeline: "Q1 2024",
      status: "Pilot Phase",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Ready to Launch":
        return "bg-green-100 text-green-800"
      case "Processed":
      case "Pilot Phase":
        return "bg-blue-100 text-blue-800"
      case "Processing":
      case "In Development":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Processed":
        return <Activity className="w-4 h-4 text-blue-500" />
      case "Processing":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SyncMate Team Lead Dashboard</h1>
              <p className="text-gray-600">Compliance Operations & Strategic Insights Management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Button size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Unified Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports This Week</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Synergies</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+3</span> new opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">+4</span> new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱8.2B</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+18%</span> from last quarter
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Report Management</TabsTrigger>
            <TabsTrigger value="monitoring">Issue Monitoring</TabsTrigger>
            <TabsTrigger value="opportunities">Business Opportunities</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Combined Dashboard */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Compliance Health
                  </CardTitle>
                  <CardDescription>Entity partnership compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">BPI x Ayala Land</div>
                          <div className="text-sm text-gray-600">3 active issues</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">92%</div>
                        <Badge variant="secondary">Healthy</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">BPI x Globe</div>
                          <div className="text-sm text-gray-600">7 active issues</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">78%</div>
                        <Badge variant="outline" className="text-yellow-700">
                          Attention
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">BPI x AC Energy</div>
                          <div className="text-sm text-gray-600">1 active issue</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">95%</div>
                        <Badge variant="secondary">Excellent</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Business Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Top Opportunities
                  </CardTitle>
                  <CardDescription>High-potential strategic initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-900">EcoHome Finance Package</h4>
                        <Badge className="bg-green-100 text-green-800">Launch Ready</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">Revenue:</span>
                          <span className="ml-1 font-medium text-green-800">₱1.8B</span>
                        </div>
                        <div>
                          <span className="text-green-700">Readiness:</span>
                          <span className="ml-1 font-medium text-green-800">95%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-900">Housing Bundle</h4>
                        <Badge className="bg-blue-100 text-blue-800">Q2 2024</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Revenue:</span>
                          <span className="ml-1 font-medium text-blue-800">₱2.3B</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Readiness:</span>
                          <span className="ml-1 font-medium text-blue-800">92%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-yellow-900">Digital Banking</h4>
                        <Badge className="bg-yellow-100 text-yellow-800">Development</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-yellow-700">Revenue:</span>
                          <span className="ml-1 font-medium text-yellow-800">₱890M</span>
                        </div>
                        <div>
                          <span className="text-yellow-700">Readiness:</span>
                          <span className="ml-1 font-medium text-yellow-800">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across compliance and business operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">EcoHome Package Approved</p>
                          <span className="text-sm text-muted-foreground">1 hour ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AC Energy partnership reached 95% readiness for launch
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          Business Opportunity
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Compliance Report Processed</p>
                          <span className="text-sm text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Maria Santos completed BPI x Ayala Land weekly summary
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          Report Management
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Globe Integration Issues</p>
                          <span className="text-sm text-muted-foreground">4 hours ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          7 data alignment issues flagged, affecting digital banking timeline
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          Issue Monitoring
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Issue Summary
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Analytics
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Team Performance
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Summary
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Report Management Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Report Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Import New Report</CardTitle>
                <CardDescription>Upload compliance reports from partner entities for processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Entity Partnership</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity partnership" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bpi-ayala-land">BPI x Ayala Land</SelectItem>
                          <SelectItem value="bpi-globe">BPI x Globe</SelectItem>
                          <SelectItem value="bpi-ac-energy">BPI x AC Energy</SelectItem>
                          <SelectItem value="bpi-ac-health">BPI x AC Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Report Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compliance">Compliance Summary</SelectItem>
                          <SelectItem value="customer-data">Customer Data Report</SelectItem>
                          <SelectItem value="transaction">Transaction Report</SelectItem>
                          <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Reporting Period</label>
                      <Input type="date" />
                    </div>

                    <Button className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report File
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop your report file here</p>
                    <p className="text-sm text-gray-500">Supports CSV, Excel, PDF formats</p>
                    <p className="text-xs text-gray-400 mt-2">Maximum file size: 50MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Track uploaded reports and their processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.entity}</TableCell>
                        <TableCell>{report.uploadedBy}</TableCell>
                        <TableCell>{report.uploadDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.issues > 0 ? (
                            <Badge variant="destructive">{report.issues}</Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issue Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Issue Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    High Priority Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">4</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Duplicate Records</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Policy Conflicts</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data Validation</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Medium Priority Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">7</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Definition Mismatch</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Threshold Updates</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format Issues</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Resolved This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">15</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Resolution</span>
                      <span className="font-medium">2.1 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Team Efficiency</span>
                      <span className="font-medium">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Entity Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Entity Partnership Health</CardTitle>
                <CardDescription>Monitor compliance status across all partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">BPI x Ayala Land</span>
                      <Badge variant="secondary">Healthy</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3 active issues</span>
                        <span>Last updated: 2h ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">BPI x Globe</span>
                      <Badge variant="outline" className="text-yellow-700">
                        Attention
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>7 active issues</span>
                        <span>Last updated: 4h ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">BPI x AC Energy</span>
                      <Badge variant="secondary">Excellent</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 active issue</span>
                        <span>Last updated: 1h ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">BPI x AC Health</span>
                      <Badge variant="secondary">Healthy</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className="font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>2 active issues</span>
                        <span>Last updated: 3h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Strategic Collaboration Opportunities</CardTitle>
                    <CardDescription>High-potential partnerships identified through data analysis</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Opportunities</SelectItem>
                        <SelectItem value="high">High Potential</SelectItem>
                        <SelectItem value="ready">Ready to Launch</SelectItem>
                        <SelectItem value="development">In Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Entities</TableHead>
                      <TableHead>Potential</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Customers</TableHead>
                      <TableHead>Readiness</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {synergyOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{opportunity.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {opportunity.entities.map((entity) => (
                              <Badge key={entity} variant="outline" className="text-xs">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(opportunity.potential)}`}
                          >
                            {opportunity.potential}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{opportunity.revenue}</TableCell>
                        <TableCell>{opportunity.customers}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={opportunity.readiness} className="w-16" />
                            <span className="text-sm">{opportunity.readiness}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{opportunity.timeline}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}
                          >
                            {opportunity.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Revenue Impact Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Impact Forecast</CardTitle>
                  <CardDescription>Projected financial benefits from synergies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                      <div>
                        <p className="font-semibold text-green-900">Q1 2024 Projection</p>
                        <p className="text-2xl font-bold text-green-800">₱2.1B</p>
                        <p className="text-sm text-green-700">AC Energy + Housing Bundle</p>
                      </div>
                      <ArrowUpRight className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                      <div>
                        <p className="font-semibold text-blue-900">Q2 2024 Projection</p>
                        <p className="text-2xl font-bold text-blue-800">₱3.8B</p>
                        <p className="text-sm text-blue-700">Full Portfolio Launch</p>
                      </div>
                      <ArrowUpRight className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                      <div>
                        <p className="font-semibold text-purple-900">Annual Target</p>
                        <p className="text-2xl font-bold text-purple-800">₱8.2B</p>
                        <p className="text-sm text-purple-700">All Synergies Active</p>
                      </div>
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Partnership Readiness Matrix</CardTitle>
                  <CardDescription>Cross-entity collaboration potential scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-center">
                      <div></div>
                      <div className="flex items-center justify-center">
                        <Building className="w-4 h-4 mr-1" />
                        Ayala Land
                      </div>
                      <div className="flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Globe
                      </div>
                      <div className="flex items-center justify-center">
                        <Leaf className="w-4 h-4 mr-1" />
                        AC Energy
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex items-center text-xs font-medium">
                        <Home className="w-4 h-4 mr-1" />
                        BPI
                      </div>
                      <div className="bg-green-100 text-green-800 text-center py-2 rounded text-sm font-medium">
                        92%
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded text-sm font-medium">
                        78%
                      </div>
                      <div className="bg-green-100 text-green-800 text-center py-2 rounded text-sm font-medium">
                        95%
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex items-center text-xs font-medium">
                        <Building className="w-4 h-4 mr-1" />
                        Ayala Land
                      </div>
                      <div className="bg-gray-100 text-center py-2 rounded text-sm">-</div>
                      <div className="bg-blue-100 text-blue-800 text-center py-2 rounded text-sm font-medium">85%</div>
                      <div className="bg-green-100 text-green-800 text-center py-2 rounded text-sm font-medium">
                        89%
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex items-center text-xs font-medium">
                        <Phone className="w-4 h-4 mr-1" />
                        Globe
                      </div>
                      <div className="bg-gray-100 text-center py-2 rounded text-sm">-</div>
                      <div className="bg-gray-100 text-center py-2 rounded text-sm">-</div>
                      <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded text-sm font-medium">
                        72%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Business Insights Chatbot */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    <CardTitle>Business Insights AI Assistant</CardTitle>
                  </div>
                  <CardDescription>
                    Ask questions about market opportunities and strategic recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-sm">
                        Hello! I can help you analyze market opportunities, customer segments, and strategic
                        recommendations. What business insights would you like to explore?
                      </div>
                    </div>

                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-gray-100 p-3 rounded-lg text-sm max-w-xs">
                        What's the revenue potential for the housing bundle?
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-sm">
                        The BPI-Ayala Land housing bundle shows ₱2.3B projected revenue targeting 45,000 customers. With
                        92% readiness score and Q2 2024 timeline, it's our top strategic opportunity.
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ask about revenue opportunities, market trends, or strategic recommendations..."
                      className="min-h-[60px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Strategic AI Online
                      </div>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 mb-2">Quick Insights:</p>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Revenue projections
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Market opportunities
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Risk analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends Impact</CardTitle>
                  <CardDescription>How market trends affect synergy opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Digital Banking Growth</p>
                        <p className="text-xs text-gray-600">+25% YoY adoption</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Positive</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">ESG Investment Demand</p>
                        <p className="text-xs text-gray-600">+40% institutional interest</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Positive</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Cross-Entity Customers</p>
                        <p className="text-xs text-gray-600">67% multi-entity usage</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Opportunity</Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-sm mb-2">Key Performance Indicators</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Customer acquisition rate</span>
                        <span className="font-medium">Target: 15K/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cross-sell conversion</span>
                        <span className="font-medium">Target: 35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue per customer</span>
                        <span className="font-medium">Target: ₱45K</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <CardTitle>AI Strategic Recommendations</CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Analysis
                  </Button>
                </div>
                <CardDescription>
                  AI analysis of market data, customer behavior, and operational metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                  <h4 className="font-semibold text-blue-900 mb-3">Priority Recommendation: Launch EcoHome Package</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    AI analysis indicates optimal market conditions for the BPI-Ayala Land-AC Energy housing bundle.
                    Customer demand modeling shows 89% likelihood of exceeding revenue targets by Q2 2024.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs font-medium text-gray-700">Success Probability</p>
                      <p className="text-lg font-bold text-blue-600">89%</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs font-medium text-gray-700">Revenue Impact</p>
                      <p className="text-lg font-bold text-green-600">₱1.8B</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs font-medium text-gray-700">Time to Launch</p>
                      <p className="text-lg font-bold text-purple-600">6 weeks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View Detailed Analysis
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Recommendation
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-4">
                  Analysis generated on January 15, 2024 at 3:45 PM | Confidence Score: 91% | Based on 2,847 data points
                  from customer behavior, market trends, and operational metrics
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Team Performance
                  </CardTitle>
                  <CardDescription>Individual team member contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Maria Santos</div>
                          <div className="text-sm text-gray-600">Senior Data Analyst</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">5 reports</div>
                        <div className="text-sm text-green-600">95% accuracy</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">John Cruz</div>
                          <div className="text-sm text-gray-600">Compliance Specialist</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">4 reports</div>
                        <div className="text-sm text-green-600">92% accuracy</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">Ana Reyes</div>
                          <div className="text-sm text-gray-600">Risk Analyst</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">3 reports</div>
                        <div className="text-sm text-green-600">98% accuracy</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workload Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Workload Distribution</CardTitle>
                  <CardDescription>Current assignments and capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Maria Santos</span>
                        <span className="text-sm text-gray-600">3/5 capacity</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">John Cruz</span>
                        <span className="text-sm text-gray-600">4/5 capacity</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Ana Reyes</span>
                        <span className="text-sm text-gray-600">2/5 capacity</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">9</div>
                          <div className="text-sm text-gray-600">Active Tasks</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">15</div>
                          <div className="text-sm text-gray-600">Total Capacity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  This Week Summary
                </CardTitle>
                <CardDescription>January 15-21, 2024 - Team performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-700">Reports Processed</div>
                    <div className="text-xs text-blue-600 mt-1">+2 from last week</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">15</div>
                    <div className="text-sm text-green-700">Issues Resolved</div>
                    <div className="text-xs text-green-600 mt-1">94% success rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">91%</div>
                    <div className="text-sm text-purple-700">Team Efficiency</div>
                    <div className="text-xs text-purple-600 mt-1">+5% improvement</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">2.1d</div>
                    <div className="text-sm text-yellow-700">Avg Resolution</div>
                    <div className="text-xs text-yellow-600 mt-1">-8% faster</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium text-sm mb-3">Key Achievements This Week</h5>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Resolved critical duplicate records issue with Ayala Land
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Improved Globe integration compliance by 12%
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Completed AC Energy green loans threshold update
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Identified ₱2.3B revenue opportunity in housing bundle
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
