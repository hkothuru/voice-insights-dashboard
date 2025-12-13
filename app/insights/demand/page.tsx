'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Lightbulb,
  Target,
  BarChart3,
  Search,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DemandGapInsights {
  totalCalls: number;
  unmetDemands: Array<{
    specification: string;
    category: string;
    frequency: number;
    percentage: number;
  }>;
  categoryGaps: Record<string, Array<{
    spec: string;
    demand: number;
    supply: number;
  }>>;
  actionableRecommendations: string[];
}

export default function DemandPage() {
  const [insights, setInsights] = useState<DemandGapInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=demand');
        if (!res.ok) throw new Error('Failed to fetch demand insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching demand insights:", error);
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
            {[1, 2, 3].map(i => (
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

  const topDemands = insights.unmetDemands.slice(0, 10);

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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Unmet Demand Spotter
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Product Gap Analysis - Discover specifications buyers want but sellers don't offer
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="px-3 py-1">
              {insights.unmetDemands.length} Unmet Specifications
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {topDemands[0]?.frequency || 0} Most Requested: {topDemands[0]?.specification || 'None'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Unmet Specs</CardTitle>
            <Search className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{insights.unmetDemands.length}</div>
            <p className="text-xs text-orange-600">Buyer-requested features</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Top Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-900 truncate" title={topDemands[0]?.specification}>
              {topDemands[0]?.specification || 'None'}
            </div>
            <p className="text-xs text-blue-600">{topDemands[0]?.frequency || 0} mentions</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Avg Frequency</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {insights.unmetDemands.length > 0
                ? Math.round(insights.unmetDemands.reduce((sum, d) => sum + d.frequency, 0) / insights.unmetDemands.length)
                : 0}
            </div>
            <p className="text-xs text-green-600">Mentions per specification</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Categories</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{Object.keys(insights.categoryGaps).length}</div>
            <p className="text-xs text-purple-600">Affected product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Unmet Demands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-600" />
            Top Unmet Specifications
          </CardTitle>
          <CardDescription>
            Most frequently requested product features that aren't commonly available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topDemands}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="specification"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
              />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'frequency' ? `${value} mentions` : value,
                name === 'frequency' ? 'Demand Frequency' : name
              ]} />
              <Bar dataKey="frequency" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Demand List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Demand Analysis</CardTitle>
          <CardDescription>
            Complete list of buyer-requested specifications with frequency and category breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.unmetDemands.map((demand, index) => (
              <div key={demand.specification} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-orange-700">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">"{demand.specification}"</h4>
                      <p className="text-sm text-muted-foreground">
                        Category: {demand.category} • {demand.frequency} mentions ({demand.percentage}%)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    High Opportunity
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(demand.frequency / Math.max(...insights.unmetDemands.map(d => d.frequency))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Filter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category-Specific Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Category-Specific Opportunities
          </CardTitle>
          <CardDescription>
            Which specifications are missing in each product category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(insights.categoryGaps).slice(0, 6).map(([category, gaps]) => (
              <div key={category} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">{category}</h4>
                <div className="space-y-2">
                  {gaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate">{gap.spec}</span>
                      <Badge variant="secondary" className="text-xs">
                        {gap.demand} requests
                      </Badge>
                    </div>
                  ))}
                </div>
                {gaps.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{gaps.length - 3} more specifications
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunity Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Market Opportunity Analysis
          </CardTitle>
          <CardDescription>
            Business implications of unmet demand patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium text-green-800">Revenue Opportunities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SEO Traffic from New Filters:</span>
                  <span className="font-medium">+25-40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion from Better Matching:</span>
                  <span className="font-medium">+15-20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Seller Feature Adoption:</span>
                  <span className="font-medium">+30-50%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-blue-800">Competitive Advantages</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  First-mover advantage in trending specifications
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  Improved buyer satisfaction and retention
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  Enhanced seller product offerings
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Unmet Demand Spotter - Action Plan</h3>
              <p className="text-orange-100">
                Capitalize on buyer demand patterns to create new market opportunities
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
              <Button size="lg" variant="secondary" className="bg-white text-orange-700 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Launch New Product Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
