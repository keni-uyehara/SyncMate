"use client"

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
  Lightbulb,
  LogOut
} from "lucide-react"
import { DashboardHeader } from "../../components/ui/dashboard-header"
import { doLogout } from "@/utils/logout"; // <-- add this import

export default function TeamLeadDashboard() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Processed":
        return "bg-blue-100 text-blue-800"
      case "Processing":
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Compliance Dashboard"
        actions={[
          {
            label: "Export Insights",
            icon: Download,
            variant: "outline"
          },
          {
            label: "Generate Report",
            icon: Lightbulb
          },
          {
            label: "Logout",
            icon: LogOut,
            variant: "outline",
            onClick: () => doLogout(), // <-- add this action
          },
        ]}
      />

      <div className="p-6">
        {/* Key Metrics Cards - Read Only */}
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
              <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Reports in queue</p>
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
              <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <Progress value={91} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Simplified for Team Leads */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Report Management</TabsTrigger>
            <TabsTrigger value="monitoring">Issue Monitoring</TabsTrigger>
            <TabsTrigger value="summaries">Weekly Summaries</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          </TabsList>

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

          {/* Weekly Summaries Tab */}
          <TabsContent value="summaries" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Week Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    This Week Summary
                  </CardTitle>
                  <CardDescription>January 15-21, 2024</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-700">Reports Processed</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">15</div>
                      <div className="text-sm text-green-700">Issues Resolved</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing Efficiency</span>
                      <div className="flex items-center gap-2">
                        <Progress value={91} className="w-20" />
                        <span className="text-sm font-medium">91%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolution Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={87} className="w-20" />
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team Performance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={94} className="w-20" />
                        <span className="text-sm font-medium">94%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h5 className="font-medium text-sm mb-2">Key Achievements</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Resolved critical duplicate records issue with Ayala Land</li>
                      <li>• Improved Globe integration compliance by 12%</li>
                      <li>• Completed AC Energy green loans threshold update</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>Last 4 weeks comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">Reports Processing</div>
                        <div className="text-sm text-green-700">Average per week</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">10.5</div>
                        <div className="text-sm text-green-600">+15% ↗</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">Issue Resolution</div>
                        <div className="text-sm text-blue-700">Average time</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">2.1d</div>
                        <div className="text-sm text-blue-600">-8% ↗</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium text-purple-900">Team Efficiency</div>
                        <div className="text-sm text-purple-700">Overall score</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">91%</div>
                        <div className="text-sm text-purple-600">+5% ↗</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full bg-transparent">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Summaries */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Week Summaries</CardTitle>
                <CardDescription>Access historical performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">January 8-14, 2024</div>
                        <div className="text-sm text-gray-600">10 reports • 12 issues resolved • 89% efficiency</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">January 1-7, 2024</div>
                        <div className="text-sm text-gray-600">8 reports • 9 issues resolved • 85% efficiency</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">December 25-31, 2023</div>
                        <div className="text-sm text-gray-600">6 reports • 7 issues resolved • 82% efficiency</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Overview Tab */}
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Team Activity</CardTitle>
                <CardDescription>Latest actions and updates from team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Report Processing Completed</p>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Maria Santos completed processing of BPI x Ayala Land weekly compliance report
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          RPT-001
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          BPI x Ayala Land
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">New Report Uploaded</p>
                        <span className="text-sm text-muted-foreground">4 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        John Cruz uploaded SME classification report from Globe partnership
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          RPT-002
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          BPI x Globe
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Issue Resolution</p>
                        <span className="text-sm text-muted-foreground">6 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ana Reyes resolved green loans threshold discrepancy with AC Energy
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Issue Resolved
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          BPI x AC Energy
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
