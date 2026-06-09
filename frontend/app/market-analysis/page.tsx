"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CSVLink } from "react-csv";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MarketReportPDF } from "@/components/MarketReportPDF";

// shadcn/ui 组件
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
  averagePrice: number;
  priceDistribution: { range: string; count: number }[];
  roomDistribution: { rooms: number; count: number }[];
}

interface WhatIfRequest {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

export default function MarketAnalysisPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [whatIfFeatures, setWhatIfFeatures] = useState<WhatIfRequest>({
    square_footage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2000,
    lot_size: 5000,
    distance_to_city_center: 10,
    school_rating: 7,
  });
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const fetchStats = async (segment: string) => {
    try {
      const res = await fetch(`/api/market/stats?segment=${segment}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchStats(segmentFilter);
  }, [segmentFilter]);

  const handleWhatIf = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/market/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatIfFeatures),
      });
      const price = await res.json();
      setWhatIfResult(price);
    } catch (err) {
      console.error("What-if analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const csvData =
    stats?.priceDistribution?.map((item) => ({
      range: item.range,
      count: item.count,
    })) || [];

  if (!stats) return <div>Loading market data...</div>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // 处理 what-if 表单字段变化
  const handleWhatIfChange = (key: keyof WhatIfRequest, value: string) => {
    setWhatIfFeatures((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">

      {/* 筛选器 - 使用 shadcn Select */}
      <div className="flex items-center gap-4">
        <Label htmlFor="segment">Property Segment:</Label>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low-price">Low Price (&lt;200k)</SelectItem>
            <SelectItem value="mid-price">Mid Price (200k-500k)</SelectItem>
            <SelectItem value="high-price">High Price (&gt;500k)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 图表卡片区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.priceDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rooms Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.roomDistribution}
                  dataKey="count"
                  nameKey="rooms"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.roomDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* What-If 分析卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>What-If Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(whatIfFeatures).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/_/g, " ")}
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="any"
                  value={whatIfFeatures[key as keyof WhatIfRequest]}
                  onChange={(e) =>
                    handleWhatIfChange(key as keyof WhatIfRequest, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <Button onClick={handleWhatIf} disabled={loading}>
            {loading ? "Analyzing..." : "Run What-If"}
          </Button>
          <PDFDownloadLink
          className="pl-2"
          document={<MarketReportPDF stats={stats} whatIfResult={whatIfResult} />}
          fileName="market_report.pdf"
        >
          {({ loading }) => (
            <Button disabled={loading}>
              {loading ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
          {whatIfResult !== null && (
            <p className="mt-2 text-lg font-bold">
              Predicted Price: ${whatIfResult.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 价格分布表格 - 使用 shadcn Table */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Price Distribution Table</CardTitle>
          <CardTitle>
            <CSVLink data={csvData} filename="market_data.csv">
              <Button variant="default">Export CSV</Button>
            </CSVLink>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Price Range</TableHead>
                <TableHead>Number of Properties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.priceDistribution.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.range}</TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}