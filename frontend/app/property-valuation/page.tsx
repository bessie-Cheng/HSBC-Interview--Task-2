"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// shadcn/ui 组件
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";

interface HousingFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  features: HousingFeatures;
  prediction: number;
}

export default function PropertyValuationPage() {
  const [formData, setFormData] = useState<HousingFeatures>({
    square_footage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2000,
    lot_size: 5000,
    distance_to_city_center: 10,
    school_rating: 7,
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof HousingFeatures, string>>>({});

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/valuation/history?limit=20");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HousingFeatures, string>> = {};
    if (formData.square_footage <= 0) newErrors.square_footage = "Square footage must be > 0";
    if (formData.bedrooms <= 0) newErrors.bedrooms = "Bedrooms must be > 0";
    if (formData.bathrooms <= 0) newErrors.bathrooms = "Bathrooms must be > 0";
    if (formData.year_built < 1800 || formData.year_built > new Date().getFullYear())
      newErrors.year_built = "Invalid year";
    if (formData.lot_size <= 0) newErrors.lot_size = "Lot size must be > 0";
    if (formData.distance_to_city_center < 0) newErrors.distance_to_city_center = "Distance cannot be negative";
    if (formData.school_rating < 1 || formData.school_rating > 10) newErrors.school_rating = "Rating must be 1-10";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/valuation/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: formData }),
      });
      const data = await res.json();
      setPrediction(data.predicted_price);
      await fetchHistory();
    } catch (err) {
      console.error("Prediction error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const chartData = history.slice(-5).map((item) => ({
    name: new Date(item.timestamp).toLocaleTimeString(),
    price: item.prediction,
  }));

  const compareData = history
    .filter((h) => selectedForCompare.includes(h.id))
    .map((h) => ({
      id: h.id.slice(0, 6),
      prediction: h.prediction,
      ...h.features,
    }));

  const toggleSelect = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">

      {/* 表单卡片 + 图表卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.keys(formData).map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/_/g, " ")}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    step="any"
                    name={key}
                    value={formData[key as keyof HousingFeatures]}
                    onChange={handleChange}
                  />
                  {errors[key as keyof HousingFeatures] && (
                    <p className="text-red-500 text-sm">{errors[key as keyof HousingFeatures]}</p>
                  )}
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Predicting..." : "Estimate Price"}
              </Button>
            </form>
            {prediction !== null && (
              <div className="mt-4 p-3 bg-green-100 rounded-md">
                <p className="font-bold text-green-800">
                  Estimated Price: ${prediction.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 历史记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle>Estimation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Sq Ft</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Baths</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedForCompare.includes(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{item.features.square_footage}</TableCell>
                    <TableCell>{item.features.bedrooms}</TableCell>
                    <TableCell>{item.features.bathrooms}</TableCell>
                    <TableCell>${item.prediction.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 对比视图（当有选中项目时显示） */}
      {compareData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Predicted Price</TableHead>
                    <TableHead>Sq Ft</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Baths</TableHead>
                    <TableHead>Year Built</TableHead>
                    <TableHead>Lot Size</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>School Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compareData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>${item.prediction.toLocaleString()}</TableCell>
                      <TableCell>{item.square_footage}</TableCell>
                      <TableCell>{item.bedrooms}</TableCell>
                      <TableCell>{item.bathrooms}</TableCell>
                      <TableCell>{item.year_built}</TableCell>
                      <TableCell>{item.lot_size}</TableCell>
                      <TableCell>{item.distance_to_city_center}</TableCell>
                      <TableCell>{item.school_rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}