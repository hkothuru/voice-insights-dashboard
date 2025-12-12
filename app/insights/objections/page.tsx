'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  TrendingDown,
  BarChart3,
  Target,
  Lightbulb,
  Store,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface ObjectionInsights {
  totalCalls: number;
  objectionBreakdown: Record<string, number>;
  categoryObjections: Record<string, Record<string, number>>;
  sellerPerformance: Array<{
    sellerId: string;
    objections: Record<string, number>;
    recommendations: string[];
  }>;
  actionableRecommendations: string[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function ObjectionsPage() {
  const [insights, setInsights] = useState<ObjectionInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=objections');
        if (!res.ok) throw new Error('Failed to fetch objection insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching objection insights:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return <div className="p-8">Failed to load insights</div>;
  }

  const objectionData = Object.entries(insights.objectionBreakdown)
    .map(([objection, count]) => ({
      objection,
      count,
      percentage: Math.round((count / insights.totalCalls) * 100 * 10) / 10
    }))
    .sort((a, b) => b.count - a.count);

  const topObjection = objectionData[0];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/insights">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Insights
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Why Did I Lose? Analyzer
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Objection Mining - Understand rejection patterns and help sellers win more deals
          </p>
          {topObjection && (
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="destructive" className="px-3 py-1">
                Top Objection: {topObjection.objection} ({topObjection.percentage}%)
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {insights.sellerPerformance.length} Sellers Analyzed
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Objections</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {Object.values(insights.objectionBreakdown).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-red-600">Lost deals identified</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Top Objection</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-900 truncate" title={topObjection?.objection}>
              {topObjection?.objection || 'None'}
            </div>
            <p className="text-xs text-blue-600">{topObjection?.percentage || 0}% of objections</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Sellers with Issues</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{insights.sellerPerformance.length}</div>
            <p className="text-xs text-green-600">Need objection training</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Categories Affected</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{Object.keys(insights.categoryObjections).length}</div>
            <p className="text-xs text-purple-600">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Objection Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Objection Distribution</CardTitle>
            <CardDescription>
              Most common reasons for lost deals across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={objectionData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="objection"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objection Impact</CardTitle>
            <CardDescription>
              Percentage breakdown of objection types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={objectionData.map((item, index) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ objection, percentage }) => `${objection}: ${percentage}%`}
                >
                  {objectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} cases`, name]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Seller Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-600" />
            Seller Objection Performance
          </CardTitle>
          <CardDescription>
            Sellers with the most objections and recommended improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.sellerPerformance.slice(0, 8).map((seller, index) => {
              const totalObjections = Object.values(seller.objections).reduce((a, b) => a + b, 0);
              const topObjection = Object.entries(seller.objections)
                .sort(([, a], [, b]) => b - a)[0];

              return (
                <div key={seller.sellerId} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-700">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Seller ID: {seller.sellerId}</h4>
                        <p className="text-sm text-muted-foreground">
                          {totalObjections} total objections • Top: {topObjection?.[0]} ({topObjection?.[1]})
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="px-2 py-1">
                      Needs Attention
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Objection Breakdown</h5>
                      <div className="space-y-1">
                        {Object.entries(seller.objections)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([objection, count]) => (
                            <div key={objection} className="flex justify-between text-sm">
                              <span>{objection}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {seller.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category-Specific Objections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Category Objection Patterns
          </CardTitle>
          <CardDescription>
            Which objections are most common in different product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(insights.categoryObjections)
              .sort(([, a], [, b]) => Object.values(b).reduce((x, y) => x + y, 0) - Object.values(a).reduce((x, y) => x + y, 0))
              .slice(0, 6)
              .map(([category, objections]) => {
                const total = Object.values(objections).reduce((a, b) => a + b, 0);
                const topObjection = Object.entries(objections)
                  .sort(([, a], [, b]) => b - a)[0];

                return (
                  <div key={category} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant="outline">{total} objections</Badge>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(objections)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([objection, count]) => (
                          <div key={objection} className="flex items-center justify-between text-sm">
                            <span className="truncate">{objection}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-600 h-2 rounded-full"
                                  style={{ width: `${(count / Math.max(...Object.values(objections))) * 100}%` }}
                                />
                              </div>
                              <span className="w-6 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {topObjection && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          <strong>Focus:</strong> Address "{topObjection[0]}" objections
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Objection Mining - Action Plan</h3>
              <p className="text-blue-100">
                Turn lost deals into learning opportunities and help sellers win more business
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {insights.actionableRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium">{recommendation}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-gray-100">
                <Lightbulb className="w-4 h-4 mr-2" />
                Implement Objection Training Program
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
