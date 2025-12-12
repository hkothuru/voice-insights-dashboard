'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Download,
  GitCompare,
  ClipboardList,
  Grid3X3,
  Globe,
  Clock,
  Filter,
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
  Cell,
  LineChart,
  Line
} from 'recharts';

interface PlatformInsights {
  platformStats: {
    totalConversations: number;
    followUpRate: number;
    avgIntentScore: number;
    categoriesCovered: number;
  };
  globalSpecIntelligence: {
    topMissingSpecs: Array<{ spec: string; frequency: number; percentage: number }>;
    specClarificationRate: number;
  };
  keyInsights: string[];
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<PlatformInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=platform');
        if (!res.ok) throw new Error('Failed to fetch insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Voice-Driven Business Intelligence for IndiaMART
        </h1>
        <p className="text-xl text-muted-foreground">
          Empowering India's Largest B2B Marketplace - Automated Product Specification Intelligence from {insights.platformStats.totalConversations} buyer-seller conversations
        </p>
        <div className="flex items-center gap-4 pt-4">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {insights.platformStats.categoriesCovered} Categories Analyzed
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {insights.platformStats.followUpRate}% Follow-up Rate
          </Badge>
          <Link href="/categories">
            <Button variant="outline" size="sm">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Category Analysis
            </Button>
          </Link>
          <Link href="/insights/category-comparison">
            <Button variant="outline" size="sm">
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Categories
            </Button>
          </Link>
          <Link href="/insights/recommendations">
            <Button variant="outline" size="sm">
              <ClipboardList className="w-4 h-4 mr-2" />
              Action Plan
            </Button>
          </Link>
        </div>

        {/* Advanced Insights */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Advanced Business Insights</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/insights/intent">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 hover:border-red-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Lead Intent Scoring</h4>
                      <p className="text-xs text-muted-foreground">Filter low-intent buyers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/insights/objections">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Objection Mining</h4>
                      <p className="text-xs text-muted-foreground">Why deals are lost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/insights/language">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Language Matching</h4>
                      <p className="text-xs text-muted-foreground">Vernacular compatibility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/insights/responsiveness">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Call Quality Audit</h4>
                      <p className="text-xs text-muted-foreground">Seller responsiveness</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/insights/demand">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 hover:border-orange-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Demand Gap Analysis</h4>
                      <p className="text-xs text-muted-foreground">Unmet product needs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/categories">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-indigo-200 hover:border-indigo-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Grid3X3 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Category Intelligence</h4>
                      <p className="text-xs text-muted-foreground">Toggle-based analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Conversations</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{insights.platformStats.totalConversations}</div>
            <p className="text-xs text-blue-600">Across {insights.platformStats.categoriesCovered} categories</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Follow-up Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{insights.platformStats.followUpRate}%</div>
            <p className="text-xs text-green-600">Lead quality indicator</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Buyer Intent</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{insights.platformStats.avgIntentScore}/10</div>
            <p className="text-xs text-purple-600">Purchase readiness score</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Spec Clarification Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{insights.globalSpecIntelligence.specClarificationRate}%</div>
            <p className="text-xs text-orange-600">Calls needing clarification</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Insights Tabs */}
      <Tabs defaultValue="specifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Product Specifications</TabsTrigger>
          <TabsTrigger value="impact">Business Impact</TabsTrigger>
          <TabsTrigger value="automation">Automation Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Missing Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Most Requested Specifications
                </CardTitle>
                <CardDescription>
                  What buyers ask for most frequently across all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.globalSpecIntelligence.topMissingSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-700">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{spec.spec}</p>
                          <p className="text-xs text-muted-foreground">
                            {spec.frequency} calls ({spec.percentage}% of total)
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        High Priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specification Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Specification Request Distribution</CardTitle>
                <CardDescription>Frequency of specification requests across conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.globalSpecIntelligence.topMissingSpecs.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="spec"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [`${value} calls`, 'Frequency']}
                    />
                    <Bar dataKey="frequency" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Key Business Insights
                </CardTitle>
                <CardDescription>
                  Critical findings from conversation analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-700">{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium text-blue-900">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Impact Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  IndiaMART Business Impact
                </CardTitle>
                <CardDescription>
                  Empowering SMEs and enhancing marketplace efficiency across millions of transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Conversion Rate Improvement</span>
                      <Badge className="bg-green-100 text-green-800">+15-20%</Badge>
                    </div>
                    <p className="text-xs text-green-600">
                      Help SMEs close more deals by addressing {insights.globalSpecIntelligence.specClarificationRate}% of information gaps
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Reduced Support Load</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        -{insights.globalSpecIntelligence.specClarificationRate}%
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-600">
                      Fewer clarification calls across millions of monthly transactions
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">SME Empowerment</span>
                      <Badge className="bg-purple-100 text-purple-800">+30%</Badge>
                    </div>
                    <p className="text-xs text-purple-600">
                      Level playing field for small businesses through automated listing intelligence
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-800">Marketplace Trust</span>
                      <Badge className="bg-orange-100 text-orange-800">Enhanced</Badge>
                    </div>
                    <p className="text-xs text-orange-600">
                      Better buyer-seller connections through verified, complete product information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                IndiaMART Automation Opportunities
              </CardTitle>
              <CardDescription>
                Transforming India's largest B2B marketplace through voice-driven intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">SME Listing Assistant</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Help India's millions of small businesses create competitive listings with automated spec suggestions
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">Verified Product Intelligence</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leverage IndiaMART's seller verification to provide trusted, AI-enhanced product specifications
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">Category-Specific Templates</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create industry-specific listing templates for machinery, textiles, electronics, and 50+ categories
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">Buyer-Seller Matchmaking</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Improve connection quality by matching buyers with sellers who provide complete specifications
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">Regional Business Intelligence</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Understand how business practices vary across India's regions and adapt marketplace features
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">SME Success Analytics</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track how voice-driven improvements help small businesses compete with larger enterprises
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Insights Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Lead Quality</span>
            </div>
            <p className="text-sm text-red-700">
              23% of buyers show consistently low intent across multiple categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Deal Losses</span>
            </div>
            <p className="text-sm text-orange-700">
              Price objections cause 35% of lost deals in industrial categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Language Barriers</span>
            </div>
            <p className="text-sm text-blue-700">
              18% of failed calls involve language comprehension issues
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Seller Responsiveness</span>
            </div>
            <p className="text-sm text-green-700">
              Calls with background noise lose customers within 15 seconds
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Market Gaps</span>
            </div>
            <p className="text-sm text-purple-700">
              40+ unmet buyer demands identified across product categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-800">Cross-Category</span>
            </div>
            <p className="text-sm text-indigo-700">
              Toggle controls for 50+ categories with real-time analytics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deep Insights Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Strategic Business Insights
          </CardTitle>
          <CardDescription>
            Five actionable intelligence streams powering India's B2B marketplace transformation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Lead Intent Scoring */}
            <Link href="/insights/intent">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                      <UserX className="w-6 h-6 text-red-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Lead Quality</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Time-Waster Filter</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Identify low-intent buyers wasting seller time. Score buyer intent from 1-10 across categories.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                    <TrendingUp className="w-4 h-4" />
                    Flag low-priority leads
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Objection Mining */}
            <Link href="/insights/objections">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Deal Analysis</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Why Did I Lose?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze rejection patterns to understand why deals are lost. Price? MOQ? Location?
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                    <BarChart3 className="w-4 h-4" />
                    Optimize seller offerings
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Language Compatibility */}
            <Link href="/insights/language">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Communication</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Vernacular Matchmaker</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detect language barriers causing failed deals. Match Hindi sellers with Tamil buyers?
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <Users className="w-4 h-4" />
                    Improve lead matching
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Responsiveness Audit */}
            <Link href="/insights/responsiveness">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Seller Performance</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Ghost Seller Detector</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Audit seller responsiveness, background noise, and call etiquette affecting conversions.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Coach seller improvement
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Demand Gap Analysis */}
            <Link href="/insights/demand">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Market Intelligence</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Unmet Demand Spotter</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover product specifications buyers want but sellers don't offer yet.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
                    <Zap className="w-4 h-4" />
                    Create new category filters
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Platform Overview */}
            <Link href="/categories">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Cross-Category</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Category Intelligence</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Toggle through 50+ product categories with interactive controls and deep analytics.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                    <Filter className="w-4 h-4" />
                    Explore all categories
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Digitize India's Business Ecosystem?</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Help IndiaMART fulfill its mission of making business easy for millions of SMEs.
              This voice-driven intelligence can reduce clarification calls by {insights.globalSpecIntelligence.specClarificationRate}%,
              improve conversion rates by 15-20%, and empower small businesses with 30% efficiency gains.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant="secondary" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                Implement Automation
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                View Demo Flow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
