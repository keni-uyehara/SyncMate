// team-lead-compliance-dashboard.tsx
// React + Express version (not Next.js)
// If you use path aliases like "@/components", keep your tsconfig/vite config accordingly.

import React, { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LogOut,
} from "lucide-react";
import { DashboardHeader } from "../../components/ui/dashboard-header";
import { doLogout } from "@/utils/logout";
import DropZone from "@/components/DropZone";

// Change this if your API base is different
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

type ReportStatus = "Processing" | "Processed" | "Completed";

type RecentReport = {
  id: string;
  name: string;
  entity: string;
  uploadedBy: string;
  uploadDate: string;
  status: ReportStatus;
  issues: number;
};

export default function TeamLeadDashboard() {
  // ---------- FORM STATE ----------
  const [entity, setEntity] = useState("");
  const [reportType, setReportType] = useState("");
  const [period, setPeriod] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ---------- UI STATE ----------
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---------- TABLE STATE ----------
  const [recentReports, setRecentReports] = useState<RecentReport[]>([
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
  ]);

  // ---------- HELPERS ----------
  const entityLabel = (value: string) => {
    switch (value) {
      case "bpi-ayala-land":
        return "BPI x Ayala Land";
      case "bpi-globe":
        return "BPI x Globe";
      case "bpi-ac-energy":
        return "BPI x AC Energy";
      case "bpi-ac-health":
        return "BPI x AC Health";
      default:
        return value || "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Processed":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Processed":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "Processing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const validate = () => {
    if (!entity) return "Please select an entity partnership.";
    if (!reportType) return "Please select a report type.";
    if (!period) return "Please choose a reporting period.";
    if (!file) return "Please attach a report file.";

    const allowed = [
      "text/csv",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (file && !allowed.includes(file.type)) {
      return "Unsupported file type. Use CSV, Excel, or PDF.";
    }
    if (file && file.size > 50 * 1024 * 1024) {
      return "File too large. Maximum is 50MB.";
    }
    return null;
  };

  // cosmetic fake progress while fetch runs (no xhr in fetch for real progress)
  const kickFakeProgress = useCallback(() => {
    setProgress(10);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(id);
          return 95;
        }
        return Math.min(p + Math.random() * 18, 95);
      });
    }, 300);
    return () => clearInterval(id);
  }, []);

  const handleUpload = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    if (!file) return;

    setUploading(true);
    const clear = kickFakeProgress();

    try {
      const fd = new FormData();
      fd.append("entity", entity);
      fd.append("reportType", reportType);
      fd.append("period", period);
      fd.append("file", file);

      const res = await fetch(`${API_BASE}/api/reports/upload`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Upload failed (${res.status}) ${txt}`);
      }

      const data = await res.json();

      setProgress(100);

      // Reflect in the table
      const newRow: RecentReport = {
        id: data.reportId ?? `RPT-${Math.floor(Math.random() * 900 + 100)}`,
        name: data.reportName ?? file.name,
        entity: data.entityLabel ?? entityLabel(entity),
        uploadedBy: data.uploadedBy ?? "You",
        uploadDate: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "Processing",
        issues: 0,
      };
      setRecentReports((prev) => [newRow, ...prev]);

      // Reset just the file; keep other form selections
      setFile(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Upload failed.");
    } finally {
      clear();
      setUploading(false);
      setTimeout(() => setProgress(0), 700);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Compliance Dashboard"
        actions={[
          { label: "Export Insights", icon: Download, variant: "outline" },
          { label: "Generate Report", icon: Lightbulb },
          { label: "Logout", icon: LogOut, variant: "outline", onClick: () => doLogout() },
        ]}
      />

      <div className="p-6">
        {/* Key Metrics */}
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

        {/* Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Report Management</TabsTrigger>
            <TabsTrigger value="monitoring">Issue Monitoring</TabsTrigger>
            <TabsTrigger value="summaries">Weekly Summaries</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          </TabsList>

          {/* Report Management */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import New Report</CardTitle>
                <CardDescription>Upload compliance reports from partner entities for processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Form controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Entity Partnership</label>
                      <Select value={entity} onValueChange={setEntity}>
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
                      <Select value={reportType} onValueChange={setReportType}>
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
                      <Input type="date" value={period} onChange={(e) => setPeriod(e.target.value)} />
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                      onChange={onPickFile}
                    />

                    <div className="space-y-3">
                      <Button type="button" variant="outline" className="w-full" onClick={openFileDialog}>
                        <Upload className="w-4 h-4 mr-2" />
                        {file ? `Selected: ${file.name}` : "Choose Report File"}
                      </Button>

                      <Button className="w-full" disabled={uploading} onClick={handleUpload}>
                        {uploading ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-pulse" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Report
                          </>
                        )}
                      </Button>

                      {uploading || progress > 0 ? <Progress value={progress} /> : null}
                    </div>
                  </div>

                  {/* Right: Drag & drop area (single tile) */}
                  <div className="p-2">
                                      <DropZone
                    multiple={false} // if you only want one file
                    onFilesSelected={(files) => setFile(files[0] ?? null)}
                    label={
                      file ? (
                        <>
                          <span className="font-medium">{file.name}</span>
                          <div className="text-sm text-gray-500 mt-1">Ready to upload</div>
                        </>
                      ) : (
                        "Drag and drop your report file here"
                      )
                    }
                  />

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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
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
                          <Button variant="ghost" size="sm" title="View">
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

          {/* Issue Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Entity health overview */}
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

          {/* Weekly Summaries */}
          <TabsContent value="summaries" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Previous Week Summaries</CardTitle>
                <CardDescription>Access historical performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    ["January 8-14, 2024", "10 reports • 12 issues resolved • 89% efficiency"],
                    ["January 1-7, 2024", "8 reports • 9 issues resolved • 85% efficiency"],
                    ["December 25-31, 2023", "6 reports • 7 issues resolved • 82% efficiency"],
                  ].map(([range, sub]) => (
                    <div key={range} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{range}</div>
                          <div className="text-sm text-gray-600">{sub}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Overview */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
}
