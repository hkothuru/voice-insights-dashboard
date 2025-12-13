'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  AlertTriangle,
  Users,
  Languages,
  MessageSquare
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

interface LanguageInsights {
  totalCalls: number;
  languageDistribution: Record<string, number>;
  languageMismatches: Array<{
    primaryLanguage: string;
    secondaryLanguage: string;
    failedCalls: number;
    categories: string[];
  }>;
  actionableRecommendations: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function LanguagePage() {
  const [insights, setInsights] = useState<LanguageInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?type=language');
        if (!res.ok) throw new Error('Failed to fetch language insights');
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching language insights:", error);
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

  const languageData = Object.entries(insights.languageDistribution)
    .map(([language, count]) => ({
      language,
      count,
      percentage: insights.totalCalls > 0 ? Math.round((count / insights.totalCalls) * 100 * 10) / 10 : 0
    }))
    .sort((a, b) => b.count - a.count);

  const totalFailedCalls = insights.languageMismatches.reduce((sum, m) => sum + m.failedCalls, 0);

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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Vernacular Matchmaker
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Language Compatibility Analysis - Bridge communication gaps in India's multilingual marketplace
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="px-3 py-1">
              {languageData.length} Languages Detected
            </Badge>
            <Badge variant="destructive" className="px-3 py-1">
              {totalFailedCalls} Calls Failed Due to Language Barriers
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Languages Detected</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{languageData.length}</div>
            <p className="text-xs text-blue-600">Across all calls</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Most Common</CardTitle>
            <Languages className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-900 truncate" title={languageData[0]?.language}>
              {languageData[0]?.language || 'None'}
            </div>
            <p className="text-xs text-green-600">{languageData[0]?.percentage || 0}% of calls</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Language Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{insights.languageMismatches.length}</div>
            <p className="text-xs text-red-600">Language pairs causing issues</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Failed Calls</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalFailedCalls}</div>
            <p className="text-xs text-purple-600">Due to language barriers</p>
          </CardContent>
        </Card>
      </div>

      {/* Language Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>
              Languages spoken in buyer-seller conversations across India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData.map((item, index) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ payload }) => `${payload.language}: ${payload.percentage}%`}
                >
                  {languageData.map((entry, index) => (
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
            <CardTitle>Language Usage Stats</CardTitle>
            <CardDescription>
              Detailed breakdown of language prevalence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languageData.map((lang, index) => (
                <div key={lang.language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{lang.language}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {lang.count} calls ({lang.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(lang.count / Math.max(...languageData.map(l => l.count))) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Mismatches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Language Compatibility Issues
          </CardTitle>
          <CardDescription>
            Language pairs causing communication barriers and failed deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.languageMismatches.map((mismatch, index) => (
              <div key={`${mismatch.primaryLanguage}-${mismatch.secondaryLanguage}`} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-700">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {mismatch.primaryLanguage} ↔ {mismatch.secondaryLanguage}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {mismatch.failedCalls} failed calls
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">High Priority</Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground mr-2">Affected categories:</span>
                  {mismatch.categories.map((category, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {insights.languageMismatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No significant language mismatches detected in the current dataset.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regional Language Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Regional Language Patterns
          </CardTitle>
          <CardDescription>
            Understanding India's linguistic diversity in B2B commerce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">North India</h4>
              <p className="text-sm text-blue-700 mb-2">Hindi dominant with English mixing</p>
              <div className="text-xs text-blue-600">
                States: Delhi, UP, Rajasthan, Punjab, Haryana
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">South India</h4>
              <p className="text-sm text-green-700 mb-2">Regional languages with English</p>
              <div className="text-xs text-green-600">
                States: Karnataka, Tamil Nadu, Andhra Pradesh, Kerala
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">West India</h4>
              <p className="text-sm text-purple-700 mb-2">Gujarati, Marathi, Hindi mix</p>
              <div className="text-xs text-purple-600">
                States: Gujarat, Maharashtra, Goa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Vernacular Matchmaker - Action Plan</h3>
              <p className="text-green-100">
                Bridge India's linguistic diversity to improve communication and conversion rates
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
              <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-gray-100">
                <Languages className="w-4 h-4 mr-2" />
                Implement Language Matching Algorithm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
