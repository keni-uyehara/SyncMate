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
} from "lucide-react"

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
          }
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
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Status</CardTitle>
                  <CardDescription>Current resolution workflows and their progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">Duplicate Detection</p>
                          <p className="text-xs text-gray-600">COMP-001, COMP-006</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">Definition Alignment</p>
                          <p className="text-xs text-gray-600">COMP-002, COMP-004</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">Threshold Updates</p>
                          <p className="text-xs text-gray-600">COMP-003, COMP-005</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Metrics</CardTitle>
                  <CardDescription>Performance indicators for resolution workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <p className="text-sm text-muted-foreground">Active Workflows</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Time to Resolution</span>
                        <span className="font-medium">2.3 days</span>
                      </div>
                      <Progress value={75} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Workflow Efficiency</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Root Cause Analysis Tab */}
          <TabsContent value="root-cause-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
                <CardDescription>Identify and address underlying causes of compliance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Root cause analysis visualization would appear here</p>
                    <p className="text-sm text-gray-400">Fishbone diagrams, Pareto charts, and trend analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Complete history of compliance issue changes and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Audit trail logs would appear here</p>
                    <p className="text-sm text-gray-400">Timeline of all changes, approvals, and resolutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    <CardTitle>AI-Generated Insights</CardTitle>
                  </div>
                  <CardDescription>Machine learning analysis of compliance patterns and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Pattern Detection</h4>
                    <p className="text-sm text-blue-800">
                      AI detected 3 similar duplicate record issues in the past month. 
                      Recommend implementing automated duplicate detection at data entry.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Optimization Opportunity</h4>
                    <p className="text-sm text-green-800">
                      Definition mismatch issues peak on Mondays. Consider scheduling 
                      definition reviews earlier in the week.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Risk Alert</h4>
                    <p className="text-sm text-yellow-800">
                      Threshold update frequency is below recommended standards. 
                      Consider quarterly automated reviews.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Analytics</CardTitle>
                  <CardDescription>Forecast compliance issues and resource needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">78%</div>
                    <p className="text-sm text-muted-foreground">Accuracy in predicting compliance issues</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Predicted Issues (Next Week)</span>
                      <span className="font-medium">5-8 new issues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Resource Allocation</span>
                      <span className="font-medium">2.5 FTE needed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Priority Focus</span>
                      <span className="font-medium">Definition alignment</span>
                    </div>
                  </div>
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
