"use client"


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPICard } from "@/components/ui/kpi-card"
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { ActionDropdown } from "@/components/ui/action-dropdown"
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileText,

  Target,
  X,
  CheckCircle,
  BarChart3,
  Activity,
  BookOpen,
  Bot,
  LogOut
} from "lucide-react"
import { doLogout } from "@/utils/logout"; // <-- add this import

export default function DataTeamOperationalDashboard() {

  const complianceIssues = [
    {
      id: "COMP-001",
      type: "Duplicate Records",
      entity: "BPI x Ayala Land",
      severity: "High",
      status: "In Progress",
      assignee: "Maria Santos",
      created: "2024-01-15",
      description: "Multiple customer records with same identification details",
    },
    {
      id: "COMP-002",
      type: "Definition Mismatch",
      entity: "BPI x Ayala Land",
      severity: "Medium",
      status: "Pending Review",
      assignee: "John Cruz",
      created: "2024-01-17",
      description: "SME definition varies between entities",
    },
    {
      id: "COMP-003",
      type: "Outdated Threshold",
      entity: "BPI x Ayala Land",
      severity: "Low",
      status: "Revised",
      assignee: "Ana Reyes",
      created: "2024-01-17",
      description: "Risk thresholds not updated for current market conditions",
    },
    {
      id: "COMP-004",
      type: "Definition Mismatch",
      entity: "BPI x Ayala Land",
      severity: "Medium",
      status: "Revised",
      assignee: "Pedro Luna",
      created: "2024-01-18",
      description: "Customer segment definitions inconsistent",
    },
    {
      id: "COMP-005",
      type: "Outdated Threshold",
      entity: "BPI x Ayala Land",
      severity: "Medium",
      status: "In Progress",
      assignee: "Maria Santos",
      created: "2024-01-19",
      description: "Compliance thresholds need quarterly review",
    },
    {
      id: "COMP-006",
      type: "Duplicate Records",
      entity: "BPI x Ayala Land",
      severity: "Low",
      status: "Pending Review",
      assignee: "Ana Reyes",
      created: "2024-01-24",
      description: "Potential duplicate entries in customer database",
    },
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Operational Analytics Dashboard"
        actions={[
          {
            label: "Export Report",
            icon: Download,
            variant: "outline"
          },
          {
            label: "Flag New Issue",
            icon: AlertTriangle,
            variant: "destructive"
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
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Issues"
            value="23"
            icon={AlertTriangle}
            iconColor="text-red-500"
            change={{ value: "+3 from last week", isPositive: false }}
          />
          <KPICard
            title="Resolution Rate"
            value="87%"
            icon={CheckCircle}
            iconColor="text-green-500"
            change={{ value: "+5% from last week", isPositive: true }}
          />
          <KPICard
            title="Avg. Resolution Time"
            value="2.3d"
            icon={Clock}
            iconColor="text-blue-500"
            change={{ value: "-0.5d improvement", isPositive: true }}
          />
          <KPICard
            title="Compliance Score"
            value="94%"
            icon={Target}
            iconColor="text-purple-500"
            progress={94}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="issue-tracking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
            <TabsTrigger value="resolution-workflows">Resolution Workflows</TabsTrigger>
            <TabsTrigger value="root-cause-analysis">Root Cause Analysis</TabsTrigger>
            <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="data-glossary">Data Glossary</TabsTrigger>
          </TabsList>

          {/* Issue Tracking Tab */}
          <TabsContent value="issue-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Issues</CardTitle>
                    <CardDescription>Track and manage flagged compliance issues</CardDescription>
                  </div>
                  <SearchFilterBar
                    searchPlaceholder="Search Issues..."
                    filterOptions={[
                      { value: "high", label: "High Severity" },
                      { value: "medium", label: "Medium Severity" },
                      { value: "low", label: "Low Severity" },
                      { value: "in-progress", label: "In Progress" },
                      { value: "pending", label: "Pending Review" },
                      { value: "resolved", label: "Resolved" }
                    ]}
                    filterLabel="Issues"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{issue.id}</TableCell>
                        <TableCell>{issue.type}</TableCell>
                        <TableCell>{issue.entity}</TableCell>
                        <TableCell>
                          <StatusBadge status={issue.severity} variant="severity" />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={issue.status} variant="status" />
                        </TableCell>
                        <TableCell>{issue.assignee}</TableCell>
                        <TableCell>{issue.created}</TableCell>
                        <TableCell>
                          <ActionDropdown
                            itemId={issue.id}
                            actions={[
                              {
                                label: "View Auto-Detection Details",
                                icon: Eye,
                                onClick: () => console.log(`View details for ${issue.id}`)
                              },
                              {
                                label: "Resolve Duplicates",
                                icon: FileText,
                                onClick: () => console.log(`Resolve duplicates for ${issue.id}`)
                              },
                              {
                                label: "Dismiss Issue",
                                icon: X,
                                onClick: () => console.log(`Dismiss issue ${issue.id}`),
                                variant: "destructive"
                              }
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing 1 to 6 of 68 results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      ← Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="default" size="sm">1</Button>
                      <Button variant="outline" size="sm">2</Button>
                      <Button variant="outline" size="sm">3</Button>
                      <span className="px-2">...</span>
                      <Button variant="outline" size="sm">67</Button>
                      <Button variant="outline" size="sm">68</Button>
                    </div>
                    <Button variant="outline" size="sm">
                      Next →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolution Workflows Tab */}
          <TabsContent value="resolution-workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Workflows */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>
                    Current resolution processes in progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Workflow 1 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-001: Data Reconciliation</p>
                        <p className="text-xs text-gray-600">
                          Step 2 of 4: Field mapping validation
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>

                  {/* Workflow 2 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-002: Policy Alignment</p>
                        <p className="text-xs text-gray-600">
                          Step 1 of 3: Stakeholder review
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                  </div>

                  {/* Workflow 3 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-003: Threshold Update</p>
                        <p className="text-xs text-gray-600">
                          Completed: All steps verified
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Revised</Badge>
                  </div>

                  {/* Workflow 4 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-004: Data Reconciliation</p>
                        <p className="text-xs text-gray-600">
                          Completed: All steps verified
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Revised</Badge>
                  </div>

                </CardContent>
              </Card>

              {/* Steward Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Steward Activity</CardTitle>
                  <CardDescription>
                    Data steward engagement and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Steward 1 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">M</div>
                      <div>
                        <p className="font-medium text-sm">Maria Santos</p>
                        <p className="text-xs text-gray-600">Resolved 3 issues this week</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Active</Badge>
                  </div>

                  {/* Steward 2 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">J</div>
                      <div>
                        <p className="font-medium text-sm">John Cruz</p>
                        <p className="text-xs text-gray-600">2 pending reviews</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Review</Badge>
                  </div>

                  {/* Steward 3 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">A</div>
                      <div>
                        <p className="font-medium text-sm">Ana Reyes</p>
                        <p className="text-xs text-gray-600">Updated 5 definitions</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Updated</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Root Cause Analysis Tab */}
          <TabsContent value="root-cause-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Trends */}
              <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Issue Trends</CardTitle>
                  <CardDescription>
                    Compliance issues patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg flex items-center justify-center h-48 text-center text-gray-500">
                    <div>
                      <p className="font-medium">📈 Trend visualizations would appear here</p>
                      <p className="text-xs">Integration with D3.js / Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Issues Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Issues Categories</CardTitle>
                  <CardDescription>
                    Most common compliance issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Duplicate Records", value: 65 },
                    { label: "Definition Mismatch", value: 45 },
                    { label: "Outdated Thresholds", value: 30 },
                    { label: "Policy Conflicts", value: 20 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-black h-3 rounded-full"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Entity Collaboration Health */}
            <Card>
              <CardHeader>
                <CardTitle>Entity Collaboration Health</CardTitle>
                <CardDescription>
                  Cross-entity data alignment status
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { entity: "BPI x Ayala Land", value: 92, issues: 3 },
                  { entity: "BPI x Globe", value: 78, issues: 7 },
                  { entity: "BPI x AC Energy", value: 95, issues: 1 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.entity}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-black h-3 rounded-full"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {item.issues} Active {item.issues === 1 ? "issue" : "issues"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete history of compliance actions and changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry 1 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        Issue COMP-003 Resolved
                      </p>
                      <p className="text-xs text-gray-600">
                        Ana Reyes updated credit scoring threshold for AC Energy green loans
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Threshold Update</Badge>
                        <Badge variant="outline">BPI x AC Energy</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">2 Hours ago</p>
                </div>

                {/* Entry 2 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        Workflow Completed
                      </p>
                      <p className="text-xs text-gray-600">
                        Maria Santos completed field mapping validation for COMP-001
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Data Reconciliation</Badge>
                        <Badge variant="outline">BPI x Ayala Land</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">4 Hours ago</p>
                </div>

                {/* Entry 3 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        New Issue Flagged
                      </p>
                      <p className="text-xs text-gray-600">
                        System detected SME classification inconsistency between BPI and Globe
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Definition Mismatch</Badge>
                        <Badge variant="outline">BPI x Globe</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">6 Hours ago</p>
                </div>
              </CardContent>
              {/* Pagination */}
              <div className="flex justify-center mt-4 mb-8">
                <nav className="flex items-center gap-2 text-sm">
                  <button className="px-2 py-1 text-gray-400 cursor-not-allowed">
                    ← Previous
                  </button>
                  <button className="px-3 py-1 bg-black text-white rounded">1</button>
                  <button className="px-3 py-1 border rounded">2</button>
                  <button className="px-3 py-1 border rounded">3</button>
                  <span>…</span>
                  <button className="px-3 py-1 border rounded">67</button>
                  <button className="px-3 py-1 border rounded">68</button>
                  <button className="px-2 py-1">Next →</button>
                </nav>
              </div>
            </Card>
          </TabsContent>


          {/* AI Insights Tab */}
          {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generated Compliance Report */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Generated Compliance Report</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      🔄 Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      📤 Export
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  AI analysis of current compliance landscape and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                {/* Executive Summary */}
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2 text-base">Executive Summary</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Based on analysis of 32 compliance issues across BPI and Ayala companies, the system has identified
                    three critical patterns requiring immediate attention. The primary concern involves duplicate
                    customer records between BPI and Ayala Land housing loan applications, affecting 15% of joint
                    applications impacting regulatory reporting accuracy.
                  </p>
                </div>

                {/* High Priority Recommendations */}
                <div className="border-l-4 border-red-500 pl-4 bg-red-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-red-600 mb-2 text-base">High Priority Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>Implement automated Customer ID reconciliation between BPI and Ayala Land Systems</li>
                    <li>Establish unified SME classification criteria across Globe and BPI partnerships</li>
                    <li>Update credit scoring threshold for green energy loans with AC Energy within 48 hours</li>
                  </ul>
                </div>

                {/* Medium Priority Actions */}
                <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-yellow-600 mb-2 text-base">Medium Priority Actions</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>Standardise data glossary across all Ayala Companies (estimated 2 weeks effort)</li>
                    <li>Implement quarterly policy alignment reviews to prevent threshold drift</li>
                    <li>Enhance steward training on cross-entity data validation procedures</li>
                  </ul>
                </div>

                {/* Strategic Opportunities */}
                <div className="border-l-4 border-green-500 pl-4 bg-green-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-green-600 mb-2 text-base">Strategic Opportunities</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>87% data alignment with Ayala Land enables expansion of joint housing products</li>
                    <li>Improved Globe integration could unlock telco-banking synergies for 2.3M customers</li>
                    <li>AC Energy partnerships shows potential ESG-compliant lending for portfolio growth</li>
                  </ul>
                </div>

                {/* Predicted Impact */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 text-base">Predicted Impact</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Resolution Time Reduction:</p>
                      <p className="font-bold text-lg text-blue-700">-35%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Compliance Score Improvement:</p>
                      <p className="font-bold text-lg text-blue-700">-35%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Cross-Entity Synergy Score:</p>
                      <p className="font-bold text-lg text-blue-700">+12%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Risk Mitigation:</p>
                      <p className="font-bold text-lg text-blue-700">+12%</p>
                    </div>
                  </div>
                </div>

                {/* Report Footer */}
                <p className="text-xs text-gray-500 pt-2 border-t">
                  Report generated on January 15, 2024 at 2:30 PM | Confidence Score: 94% | Based on 1,247 data points
                  across 5 entities
                </p>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">🤖</div>
                  <div>
                    <CardTitle className="text-lg font-semibold">SyncMate AI Assistant</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Ask questions about compliance issues and get insights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assistant messages */}
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-none w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs leading-none">
                      🤖
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-700 leading-relaxed">
                        Hello! I'm your SyncMate AI assistant. I can help you analyze compliance issues,
                        explain resolution workflows, and provide insights about cross-entity data alignment.
                        What would you like to know?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2">
                    <div className="bg-gray-200 p-3 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-600 text-xs">
                          What's causing the duplicate records issue with Ayala Land?
                        </p>
                      </div>
                    </div>
                    <div className="flex-none w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs leading-none">
                      👤
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-none w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs leading-none">
                      🤖
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-700 leading-relaxed">
                          The duplicate records issue (COMP-001) stems from different customer ID formats between BPI's
                          core banking system and Ayala Land's CRM.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me about compliance issues, resolution strategies, or data insights..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="sm" className="px-3">
                      ➤
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Quick Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Explain COMP-001
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Resolution Timeline
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Risk Assessment
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Best Practices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Alignment Simulation */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Policy Alignment Simulation</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI-powered impact analysis of policy changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-800">Scenario: Unified SME Definition</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600">Predicted Outcome:</p>
                        <p className="font-medium text-green-700">23% reduction in classification conflicts</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Affected Records:</p>
                        <p className="font-medium text-green-700">~45,000 customer profiles</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Implementation Effort:</p>
                        <p className="font-medium text-green-700">3-4 weeks</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Compliance Impact:</p>
                        <p className="font-medium text-green-700">+15% alignment score</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-black text-white">
                  Run New Simulation
                </Button>
              </CardContent>
            </Card>

            {/* Collaboration Readiness Score */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Collaboration Readiness Score</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI-powered impact analysis of policy changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ Ayala Land</span>
                      <span className="font-bold text-lg">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ Globe</span>
                      <span className="font-bold text-lg">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ AC Energy</span>
                      <span className="font-bold text-lg">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 pt-2 border-t">
                  Scores are based on data alignment, policy compatibility, and historical collaboration success
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>




          {/* Data Glossary Tab */}
          <TabsContent value="data-glossary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Glossary</CardTitle>
                <CardDescription>Standardized definitions and data governance framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Data glossary and governance tools would appear here</p>
                    <p className="text-sm text-gray-400">Standardized definitions, data lineage, and governance policies</p>
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
