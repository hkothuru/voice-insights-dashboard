'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Phone,
  Volume2,
  MessageSquare,
  TrendingDown
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

interface ResponsivenessInsights {
  totalCalls: number;
  qualityMetrics: {
    highNoiseCalls: number;
    poorToneCalls: number;
    shortDurationCalls: number;
  };
  sellerQualityScores: Array<{
    sellerId: string;
    qualityScore: number;
    issues: string[];
  }>;
  actionableRecommendations: string[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function ResponsivenessPage() {
  const [insights, setInsights] = useState<ResponsivenessInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=responsiveness');
        if (!res.ok) throw new Error('Failed to fetch responsiveness insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching responsiveness insights:", error);
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

  const qualityData = [
    { issue: 'High Noise', count: insights.qualityMetrics.highNoiseCalls, percentage: Math.round((insights.qualityMetrics.highNoiseCalls / insights.totalCalls) * 100) },
    { issue: 'Poor Tone', count: insights.qualityMetrics.poorToneCalls, percentage: Math.round((insights.qualityMetrics.poorToneCalls / insights.totalCalls) * 100) },
    { issue: 'Short Calls', count: insights.qualityMetrics.shortDurationCalls, percentage: Math.round((insights.qualityMetrics.shortDurationCalls / insights.totalCalls) * 100) }
  ];

  const lowQualitySellers = insights.sellerQualityScores.filter(s => s.qualityScore < 70);

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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ghost Seller Detector
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Call Quality Audit - Identify and improve seller responsiveness and call environment
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="px-3 py-1">
              {insights.sellerQualityScores.length} Sellers Analyzed
            </Badge>
            <Badge variant="destructive" className="px-3 py-1">
              {lowQualitySellers.length} Need Quality Improvement
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Quality Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {Object.values(insights.qualityMetrics).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-red-600">Calls with quality problems</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">High Noise Calls</CardTitle>
            <Volume2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{insights.qualityMetrics.highNoiseCalls}</div>
            <p className="text-xs text-orange-600">Background noise detected</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Poor Tone Calls</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{insights.qualityMetrics.poorToneCalls}</div>
            <p className="text-xs text-yellow-600">Unprofessional communication</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Short Duration</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{insights.qualityMetrics.shortDurationCalls}</div>
            <p className="text-xs text-blue-600">Calls ending within 30 seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Issues Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Quality Issues</CardTitle>
            <CardDescription>
              Distribution of different call quality problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityData.map((item, index) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ issue, percentage }) => `${issue}: ${percentage}%`}
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} calls`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Impact Analysis</CardTitle>
            <CardDescription>
              How quality issues affect call success rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityData.map((item, index) => (
                <div key={item.issue} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.issue}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} calls ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...qualityData.map(d => d.count))) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.issue === 'Short Calls' && 'Calls ending prematurely indicate poor first impression'}
                    {item.issue === 'High Noise' && 'Background noise makes communication difficult'}
                    {item.issue === 'Poor Tone' && 'Unprofessional communication deters buyers'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seller Quality Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-orange-600" />
            Seller Quality Rankings
          </CardTitle>
          <CardDescription>
            Sellers with the lowest quality scores and their specific issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.sellerQualityScores.slice(0, 10).map((seller, index) => (
              <div key={seller.sellerId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-orange-700">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Seller ID: {seller.sellerId}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quality Score: {seller.qualityScore}/100
                      </p>
                    </div>
                  </div>
                  <Badge variant={seller.qualityScore < 50 ? "destructive" : seller.qualityScore < 70 ? "secondary" : "outline"}>
                    {seller.qualityScore < 50 ? "Critical" : seller.qualityScore < 70 ? "Needs Attention" : "Good"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Issues:</span>
                  <div className="flex flex-wrap gap-1">
                    {seller.issues.map((issue, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${seller.qualityScore}%`,
                      backgroundColor: seller.qualityScore < 50 ? '#ef4444' : seller.qualityScore < 70 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Quality Improvement Guidelines
          </CardTitle>
          <CardDescription>
            Best practices for better call quality and customer experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-sm">Reduce Background Noise</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use headphones with microphone</li>
                <li>• Find quiet calling environment</li>
                <li>• Close windows/doors</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-yellow-600" />
                <h4 className="font-medium text-sm">Improve Communication</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Professional greeting</li>
                <li>• Clear pronunciation</li>
                <li>• Patient listening</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-sm">Call Preparation</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Review buyer requirements</li>
                <li>• Prepare product information</li>
                <li>• Have pricing ready</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ghost Seller Detector - Action Plan</h3>
              <p className="text-purple-100">
                Improve call quality to reduce lost opportunities and enhance buyer trust
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
              <Button size="lg" variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100">
                <Phone className="w-4 h-4 mr-2" />
                Implement Call Quality Monitoring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
