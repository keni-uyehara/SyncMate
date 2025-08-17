"use client"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPICard } from "@/components/ui/kpi-card"
import { DashboardHeader } from "@/components/ui/dashboard-header"

import {
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Building,
  Leaf,
  Phone,
  Home,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Sparkles,
  Bot,
  MessageSquare,
  LogOut,
} from "lucide-react"
import { doLogout } from "@/utils/logout"; // <-- add this import

export default function InsightsDashboard() {
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
      description: "Integrated housing loan + property development package for middle-income families",
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
      description: "Telco-banking integration for mobile payments and micro-lending",
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
      description: "ESG-compliant financing for renewable energy projects",
      status: "Pilot Phase",
    },
  ]

  const customerSegments = [
    {
      segment: "Mass Market",
      size: "2.8M",
      growth: "+12%",
      synergy: "High",
      opportunities: ["Digital Banking", "Micro-lending", "Insurance"],
    },
    {
      segment: "SME",
      size: "450K",
      growth: "+8%",
      synergy: "Medium",
      opportunities: ["Supply Chain Finance", "Property Loans", "Energy Solutions"],
    },
    {
      segment: "Premium",
      size: "85K",
      growth: "+15%",
      synergy: "High",
      opportunities: ["Wealth Management", "Premium Properties", "ESG Investments"],
    },
  ]

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready to Launch":
        return "bg-green-100 text-green-800"
      case "Pilot Phase":
        return "bg-blue-100 text-blue-800"
      case "In Development":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Strategic Synergies Dashboard"
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
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Synergies"
            value="12"
            icon={Target}
            iconColor="text-blue-500"
            change={{ value: "+3 new opportunities", isPositive: true }}
          />
          <KPICard
            title="Revenue Potential"
            value="₱8.2B"
            icon={DollarSign}
            iconColor="text-green-500"
            change={{ value: "+18% from last quarter", isPositive: true }}
          />
          <KPICard
            title="Customer Reach"
            value="3.2M"
            icon={Users}
            iconColor="text-purple-500"
            change={{ value: "+25% cross-entity customers", isPositive: true }}
          />
          <KPICard
            title="Avg Readiness Score"
            value="88%"
            icon={Star}
            iconColor="text-yellow-500"
            progress={88}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="opportunities">Synergy Opportunities</TabsTrigger>
            <TabsTrigger value="segments">Customer Insights</TabsTrigger>
            <TabsTrigger value="products">Product Innovation</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          {/* Synergy Opportunities Tab */}
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
                            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
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
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Entity Partnership Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
          </TabsContent>

          {/* Customer Insights Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cross-Entity Customer Segments</CardTitle>
                  <CardDescription>Shared customer base analysis and growth opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerSegments.map((segment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <h4 className="font-semibold">{segment.segment}</h4>
                            <Badge variant="outline">{segment.size} customers</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600 font-medium">{segment.growth}</span>
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Synergy Potential</p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={segment.synergy === "High" ? 85 : segment.synergy === "Medium" ? 65 : 45}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">{segment.synergy}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Key Opportunities</p>
                            <div className="flex flex-wrap gap-1">
                              {segment.opportunities.map((opp, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {opp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Journey Insights</CardTitle>
                  <CardDescription>Cross-entity touchpoint analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">67%</div>
                    <p className="text-sm text-muted-foreground">Multi-entity customers</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>BPI + Ayala Land</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-16" />
                        <span className="font-medium">45%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>BPI + Globe</span>
                      <div className="flex items-center gap-2">
                        <Progress value={38} className="w-16" />
                        <span className="font-medium">38%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>BPI + AC Energy</span>
                      <div className="flex items-center gap-2">
                        <Progress value={12} className="w-16" />
                        <span className="font-medium">12%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Triple+ Overlap</span>
                      <div className="flex items-center gap-2">
                        <Progress value={8} className="w-16" />
                        <span className="font-medium">8%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-sm mb-2">Top Cross-Sell Opportunities</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Housing + Banking</span>
                        <span className="font-medium text-green-600">₱1.2B potential</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Telco + Payments</span>
                        <span className="font-medium text-green-600">₱890M potential</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy + Financing</span>
                        <span className="font-medium text-green-600">₱650M potential</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Behavior Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Behavior Patterns</CardTitle>
                <CardDescription>Insights from cross-entity customer data analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">2.3x</div>
                    <p className="text-sm text-muted-foreground">Higher lifetime value for multi-entity customers</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-sm text-muted-foreground">Retention rate for bundled services</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.2</div>
                    <p className="text-sm text-muted-foreground">Average products per cross-entity customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Innovation Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Co-Developed Product Pipeline</CardTitle>
                  <CardDescription>Joint products in development and planning stages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">EcoHome Finance Package</h4>
                      <Badge className="bg-green-100 text-green-800">Launch Ready</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      BPI housing loans + Ayala Land properties + AC Energy solar installations
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Target Market:</span>
                        <span className="ml-1">Premium Segment</span>
                      </div>
                      <div>
                        <span className="font-medium">Revenue Projection:</span>
                        <span className="ml-1 text-green-600">₱1.8B</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">GlobePay Business Suite</h4>
                      <Badge className="bg-blue-100 text-blue-800">Development</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Integrated telco billing + BPI business banking + payment processing
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Target Market:</span>
                        <span className="ml-1">SME Segment</span>
                      </div>
                      <div>
                        <span className="font-medium">Revenue Projection:</span>
                        <span className="ml-1 text-blue-600">₱890M</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-yellow-900">Smart City Infrastructure</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Planning</Badge>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Multi-entity collaboration for smart city development financing
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Target Market:</span>
                        <span className="ml-1">Government/LGU</span>
                      </div>
                      <div>
                        <span className="font-medium">Revenue Projection:</span>
                        <span className="ml-1 text-yellow-600">₱3.2B</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Metrics</CardTitle>
                  <CardDescription>Product development and market performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Lightbulb className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">15</div>
                      <p className="text-xs text-muted-foreground">Active Concepts</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Zap className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">In Development</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Time to Market</span>
                        <span className="font-medium">6.2 months avg</span>
                      </div>
                      <Progress value={75} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customer Adoption</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-sm mb-3">Top Performing Categories</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-green-500" />
                          <span>Housing & Real Estate</span>
                        </div>
                        <span className="font-medium text-green-600">92% success</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>Digital & Fintech</span>
                        </div>
                        <span className="font-medium text-blue-600">85% success</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span>ESG & Sustainability</span>
                        </div>
                        <span className="font-medium text-green-600">88% success</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Performance Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Entity Product Performance</CardTitle>
                <CardDescription>Revenue and adoption metrics for joint offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Product performance charts would appear here</p>
                    <p className="text-sm text-gray-400">Integration with D3.js/Recharts for detailed analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Market Opportunity Analysis</CardTitle>
                  <CardDescription>Competitive landscape and market positioning insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Market analysis visualization would appear here</p>
                      <p className="text-sm text-gray-400">
                        Market share, competitive positioning, and opportunity mapping
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Advantage</CardTitle>
                  <CardDescription>Unique positioning through synergies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">73%</div>
                    <p className="text-sm text-muted-foreground">Market differentiation score</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-sm">Integrated Ecosystem</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Only player with banking, telco, real estate, and energy integration
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">Data Synergy</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Cross-entity customer insights enable superior personalization
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">Scale Advantage</span>
                      </div>
                      <p className="text-xs text-gray-600">Combined customer base of 3.2M enables cost efficiencies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">Interest Rate Sensitivity</p>
                        <p className="text-xs text-gray-600">Housing market cooling</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Risk</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Environment</CardTitle>
                  <CardDescription>Compliance and regulatory impact assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">BSP Digital Banking</p>
                        <p className="text-xs text-gray-600">Favorable regulations</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Data Privacy Act</p>
                        <p className="text-xs text-gray-600">Cross-entity data sharing</p>
                      </div>
                    </div>
                    <Badge variant="outline">Monitoring</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Green Finance Incentives</p>
                        <p className="text-xs text-gray-600">Government support</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Opportunity</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <CardTitle>AI-Generated Strategic Recommendations</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Analysis
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
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
                      Initiate Launch Process
                    </Button>
                    <Button variant="outline" size="sm">
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">Strategic Actions</h5>

                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <h6 className="font-medium text-green-900">Immediate (Next 30 days)</h6>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        <li>• Finalize EcoHome product specifications and pricing</li>
                        <li>• Establish joint marketing campaign with Ayala Land</li>
                        <li>• Complete AC Energy integration testing</li>
                        <li>• Launch pilot program with 100 premium customers</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <h6 className="font-medium text-yellow-900">Short-term (Next 90 days)</h6>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        <li>• Scale EcoHome to full market launch</li>
                        <li>• Begin development of GlobePay Business Suite</li>
                        <li>• Implement advanced customer segmentation</li>
                        <li>• Establish cross-entity data governance framework</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h6 className="font-medium text-blue-900">Long-term (Next 12 months)</h6>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        <li>• Launch Smart City Infrastructure initiative</li>
                        <li>• Develop AI-powered cross-selling engine</li>
                        <li>• Expand to international markets</li>
                        <li>• Build comprehensive ESG product portfolio</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">Risk Mitigation</h5>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h6 className="font-medium text-red-900 mb-2">High Priority Risks</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Regulatory compliance gaps</span>
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Data integration complexity</span>
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Market timing sensitivity</span>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h6 className="font-medium text-green-900 mb-2">Success Enablers</h6>
                      <div className="space-y-1 text-sm text-green-800">
                        <div>• Strong customer demand for integrated solutions</div>
                        <div>• Established brand trust across entities</div>
                        <div>• Favorable regulatory environment</div>
                        <div>• Proven technology infrastructure</div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-medium text-blue-900 mb-2">Key Performance Indicators</h6>
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
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-4">
                  Analysis generated on January 15, 2024 at 3:45 PM | Confidence Score: 91% | Based on 2,847 data points
                  from customer behavior, market trends, and operational metrics
                </div>
              </CardContent>
            </Card>

            {/* AI Business Insights Chatbot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    <CardTitle>Strategic Insights AI Assistant</CardTitle>
                  </div>
                  <CardDescription>
                    Ask questions about market opportunities, customer insights, and strategic recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-sm">
                        Hello! I'm your Strategic Insights AI assistant. I can help you analyze market opportunities,
                        customer segments, revenue projections, and strategic recommendations. What business insights
                        would you like to explore?
                      </div>
                    </div>

                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-gray-100 p-3 rounded-lg text-sm max-w-xs">
                        What's the revenue potential for the BPI-Ayala Land housing bundle?
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
                        The BPI-Ayala Land housing bundle shows exceptional potential with ₱2.3B projected revenue
                        targeting 45,000 customers. Our analysis indicates a 92% readiness score with Q2 2024 launch
                        timeline. The integrated offering combines BPI's housing loans with Ayala Land properties,
                        leveraging our 67% multi-entity customer overlap for higher conversion rates.
                      </div>
                    </div>

                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-gray-100 p-3 rounded-lg text-sm max-w-xs">
                        Which customer segment should we prioritize for cross-selling?
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
                        I recommend prioritizing the Premium segment (85K customers) with +15% growth and high synergy
                        potential. They show 2.3x higher lifetime value and 85% retention for bundled services. Key
                        opportunities include wealth management + premium properties + ESG investments, with estimated
                        ₱1.8B cross-sell potential.
                      </div>
                    </div>

                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-gray-100 p-3 rounded-lg text-sm max-w-xs">
                        What are the main risks for our Globe partnership?
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
                        The Globe partnership faces three key risks: 1) Data integration complexity due to different
                        customer ID formats, 2) Regulatory compliance gaps around cross-entity data sharing under the
                        Data Privacy Act, and 3) Market timing sensitivity with 78% readiness score. I recommend
                        addressing the SME definition mismatch first to improve collaboration readiness from 78% to
                        projected 85%.
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ask me about revenue opportunities, market trends, customer insights, or strategic recommendations..."
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
                        Customer segments
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Risk analysis
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Launch timeline
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                        Competitive advantage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Intelligence Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Business Intelligence</CardTitle>
                  <CardDescription>Real-time strategic insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">91%</div>
                    <p className="text-sm text-muted-foreground">AI Confidence Score</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm text-green-900">Top Opportunity</span>
                      </div>
                      <p className="text-xs text-green-800">
                        EcoHome Package launch recommended with 89% success probability
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm text-blue-900">Customer Focus</span>
                      </div>
                      <p className="text-xs text-blue-800">
                        Premium segment shows highest cross-sell potential at ₱1.8B
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm text-yellow-900">Priority Action</span>
                      </div>
                      <p className="text-xs text-yellow-800">
                        Resolve Globe data integration issues to unlock ₱890M potential
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-sm mb-2">Recent Insights</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        <span>Market demand for ESG products up 40%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        <span>Cross-entity customers have 85% retention</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        <span>Digital banking adoption growing 25% YoY</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-transparent" variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New Insights
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
