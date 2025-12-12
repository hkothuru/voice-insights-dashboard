'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import {
  ArrowLeft,
  Target,
  AlertTriangle,
  TrendingDown,
  UserX,
  Filter,
  BarChart3,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface LeadIntentInsights {
  totalCalls: number;
  intentDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  lowIntentBuyers: Array<{
    buyerId: string;
    lowIntentCalls: number;
    categories: string[];
    avgIntentScore: number;
  }>;
  actionableRecommendations: string[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function LeadIntentPage() {
  const [insights, setInsights] = useState<LeadIntentInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=intent');
        if (!res.ok) throw new Error('Failed to fetch intent insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching intent insights:", error);
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

  const intentData = [
    { name: 'Low Intent (1-3)', value: insights.intentDistribution.low, color: '#ef4444' },
    { name: 'Medium Intent (4-7)', value: insights.intentDistribution.medium, color: '#f59e0b' },
    { name: 'High Intent (8-10)', value: insights.intentDistribution.high, color: '#10b981' }
  ];

  const lowIntentPercentage = Math.round((insights.intentDistribution.low / insights.totalCalls) * 100);

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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Time-Waster Filter
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Lead Intent Scoring - Identify and filter low-intent buyers to save seller outreach costs
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="destructive" className="px-3 py-1">
              {insights.lowIntentBuyers.length} Low-Intent Buyers Identified
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {lowIntentPercentage}% of calls are low intent
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Low Intent Calls</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{insights.intentDistribution.low}</div>
            <p className="text-xs text-red-600">{lowIntentPercentage}% of total calls</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Medium Intent Calls</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{insights.intentDistribution.medium}</div>
            <p className="text-xs text-yellow-600">
              {Math.round((insights.intentDistribution.medium / insights.totalCalls) * 100)}% of total calls
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">High Intent Calls</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{insights.intentDistribution.high}</div>
            <p className="text-xs text-green-600">
              {Math.round((insights.intentDistribution.high / insights.totalCalls) * 100)}% of total calls
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Problem Buyers</CardTitle>
            <UserX className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{insights.lowIntentBuyers.length}</div>
            <p className="text-xs text-purple-600">Consistently low-intent</p>
          </CardContent>
        </Card>
      </div>

      {/* Intent Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buyer Intent Distribution</CardTitle>
            <CardDescription>
              Distribution of buyer purchase intent across all calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} calls`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intent Score Ranges</CardTitle>
            <CardDescription>
              Understanding buyer intent levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Low Intent (1-3)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {insights.intentDistribution.low} calls
                </span>
              </div>
              <Progress value={(insights.intentDistribution.low / insights.totalCalls) * 100} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Medium Intent (4-7)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {insights.intentDistribution.medium} calls
                </span>
              </div>
              <Progress value={(insights.intentDistribution.medium / insights.totalCalls) * 100} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">High Intent (8-10)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {insights.intentDistribution.high} calls
                </span>
              </div>
              <Progress value={(insights.intentDistribution.high / insights.totalCalls) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Intent Buyers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            Problem Buyers - Consistently Low Intent
          </CardTitle>
          <CardDescription>
            Buyers who repeatedly show low purchase intent across multiple categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.lowIntentBuyers.map((buyer, index) => (
              <div key={buyer.buyerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-700">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Buyer ID: {buyer.buyerId}</h4>
                      <p className="text-sm text-muted-foreground">
                        Avg Intent: {buyer.avgIntentScore}/10 • {buyer.lowIntentCalls} low-intent calls
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {buyer.categories.slice(0, 3).map((category, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {buyer.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{buyer.categories.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="px-2 py-1">
                    Flag as Low Priority
                  </Badge>
                </div>
              </div>
            ))}

            {insights.lowIntentBuyers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No consistently low-intent buyers found in the dataset.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Time-Waster Filter - Action Plan</h3>
              <p className="text-red-100">
                Eliminate {lowIntentPercentage}% of unproductive calls and focus sellers on high-value leads
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
              <Button size="lg" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                <Filter className="w-4 h-4 mr-2" />
                Implement Lead Scoring System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
