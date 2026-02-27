'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import {
  BarChart3,
  Phone,
  Users,
  Timer,
  ArrowLeft,
  TrendingUp,
  Filter,
  Eye,
  Download,
  Building,
  Clock
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

interface CategoryData {
  category: string;
  totalCalls: number;
  avgDuration: number;
  avgIntentScore: number;
  followUpRate: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryToggles, setCategoryToggles] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/calls');
        if (!response.ok) throw new Error('Failed to fetch calls');

        const callsData = await response.json();
        setCalls(callsData);
        setTotalCalls(callsData.length);

        // Group by category
        const categoryMap = new Map<string, any[]>();
        callsData.forEach((call: any) => {
          const cat = call.analysis?.category || 'Uncategorized';
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, []);
          }
          categoryMap.get(cat)!.push(call);
        });

        // Calculate stats for each category
        const categoryStats: CategoryData[] = Array.from(categoryMap.entries()).map(([category, categoryCalls]) => {
          const totalDuration = categoryCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
          const totalIntent = categoryCalls.reduce((sum, call) => sum + (call.analysis?.buyer_intent_score || 0), 0);
          const followUpCalls = categoryCalls.filter(call =>
            call.analysis?.deal_status?.toLowerCase().includes('follow')
          ).length;

          return {
            category,
            totalCalls: categoryCalls.length,
            avgDuration: Math.round(totalDuration / categoryCalls.length),
            avgIntentScore: Math.round((totalIntent / categoryCalls.length) * 10) / 10,
            followUpRate: Math.round((followUpCalls / categoryCalls.length) * 100)
          };
        });

        // Sort by total calls descending
        categoryStats.sort((a, b) => b.totalCalls - a.totalCalls);
        setCategories(categoryStats);

        // Initialize toggles for all categories
        const initialToggles: Record<string, boolean> = {};
        categoryStats.forEach((cat) => {
          initialToggles[cat.category] = true;
        });
        setCategoryToggles(initialToggles);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleCategoryExpansion = (categoryKey: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCards(newExpanded);
  };

  const toggleCategoryVisibility = (categoryKey: string) => {
    setCategoryToggles(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Category Analysis
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Insights from {totalCalls} calls across {categories.length} categories
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="default">Live Data</Badge>
            <Link href="/demo-categories">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                View Demo Data →
              </Badge>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-all"
              checked={Object.values(categoryToggles).some(v => v)}
              onCheckedChange={(checked) => {
                const newToggles: Record<string, boolean> = {};
                categories.forEach(cat => {
                  newToggles[cat.category] = checked;
                });
                setCategoryToggles(newToggles);
              }}
            />
            <Label htmlFor="show-all" className="text-sm">Show All Categories</Label>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalCalls}</div>
            <p className="text-xs text-blue-600">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{categories.length}</div>
            <p className="text-xs text-green-600">Product categories</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Intent</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {categories.length > 0
                ? (categories.reduce((sum, cat) => sum + cat.avgIntentScore, 0) / categories.length).toFixed(1)
                : '0'
              }/10
            </div>
            <p className="text-xs text-purple-600">Average buyer intent</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Follow-up Rate</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {categories.length > 0
                ? Math.round(categories.reduce((sum, cat) => sum + cat.followUpRate, 0) / categories.length)
                : 0
              }%
            </div>
            <p className="text-xs text-orange-600">Average across categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Volume by Category</CardTitle>
            <CardDescription>Number of calls per category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalCalls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Percentage of calls by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalCalls"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Category Control Panel
          </CardTitle>
          <CardDescription>
            Toggle visibility and explore detailed insights for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryKey = category.category;
              const isVisible = categoryToggles[categoryKey];

              return (
                <div key={categoryKey} className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" title={category.category}>
                        {category.category}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {category.totalCalls} calls
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={isVisible || false}
                        onCheckedChange={() => toggleCategoryVisibility(categoryKey)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          toggleCategoryExpansion(categoryKey);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Category Details */}
                  {expandedCards.has(categoryKey) && isVisible && (
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Avg Duration:</span>
                            <div className="font-medium">{formatDuration(category.avgDuration)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Intent:</span>
                            <div className="font-medium">{category.avgIntentScore}/10</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Calls:</span>
                            <div className="font-medium">{category.totalCalls}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Follow-up Rate:</span>
                            <div className="font-medium">{category.followUpRate}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category View */}
      {selectedCategory && (
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                {selectedCategory.category} Deep Analysis
              </span>
              <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                {selectedCategory.totalCalls} conversations
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive insights for this product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Market Size</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedCategory.totalCalls}</div>
                      <div className="text-xs text-muted-foreground">Total calls</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedCategory.avgIntentScore}/10</div>
                      <div className="text-xs text-muted-foreground">Average intent score</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Avg Duration</span>
                      </div>
                      <div className="text-2xl font-bold">{formatDuration(selectedCategory.avgDuration)}</div>
                      <div className="text-xs text-muted-foreground">Conversation length</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="geography" className="space-y-6">
                {(() => {
                  // Extract geographic data from calls in this category
                  const categoryCallsData = calls.filter((call: any) =>
                    (call.analysis?.category || 'Uncategorized') === selectedCategory.category
                  );

                  const cityMap = new Map<string, { count: number; state: string }>();
                  const stateMap = new Map<string, number>();

                  categoryCallsData.forEach((call: any) => {
                    const city = call.csv_metadata?.city_name;
                    const state = call.csv_metadata?.state_name;

                    if (city && state) {
                      cityMap.set(city, {
                        count: (cityMap.get(city)?.count || 0) + 1,
                        state: state
                      });
                      stateMap.set(state, (stateMap.get(state) || 0) + 1);
                    }
                  });

                  const topCities = Array.from(cityMap.entries())
                    .map(([city, data]) => ({ city, count: data.count, state: data.state }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                  const topStates = Array.from(stateMap.entries())
                    .map(([state, count]) => ({ state, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                  if (topCities.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        Geographic data not available for live categories. Upload more calls with location data to see geographic distribution.
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Top Cities</CardTitle>
                          <CardDescription>Call distribution by city</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {topCities.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{item.city}</div>
                                  <div className="text-xs text-muted-foreground">{item.state}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-medium">{item.count} calls</div>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 rounded-full"
                                      style={{ width: `${(item.count / topCities[0].count) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Top States</CardTitle>
                          <CardDescription>Call distribution by state</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {topStates.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{item.state}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-medium">{item.count} calls</div>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-600 rounded-full"
                                      style={{ width: `${(item.count / topStates[0].count) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="timing" className="space-y-6">
                {(() => {
                  // Extract timing data from calls in this category
                  const categoryCallsData = calls.filter((call: any) =>
                    (call.analysis?.category || 'Uncategorized') === selectedCategory.category
                  );

                  const hourMap = new Map<number, number>();
                  const dayMap = new Map<string, number>();
                  const durationData: number[] = [];

                  categoryCallsData.forEach((call: any) => {
                    // Extract hour from timestamp or call start time
                    let hour: number | null = null;

                    if (call.timestamp) {
                      const date = new Date(call.timestamp);
                      hour = date.getHours();

                      // Get day of week
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const dayName = days[date.getDay()];
                      dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
                    } else if (call.csv_metadata?.pns_call_record_started_at) {
                      // Parse time from HH:MM:SS format
                      const timeParts = call.csv_metadata.pns_call_record_started_at.split(':');
                      if (timeParts.length >= 1) {
                        hour = parseInt(timeParts[0]);
                      }
                    }

                    if (hour !== null && !isNaN(hour)) {
                      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
                    }

                    // Extract duration
                    const duration = call.duration_seconds || parseInt(call.csv_metadata?.call_duration || '0');
                    if (duration > 0) {
                      durationData.push(duration);
                    }
                  });

                  if (hourMap.size === 0 && dayMap.size === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        Timing data not available for live categories. Upload more calls with timestamp data to see timing patterns.
                      </div>
                    );
                  }

                  // Calculate peak hours
                  const hourDistribution = Array.from(hourMap.entries())
                    .map(([hour, count]) => ({ hour, count }))
                    .sort((a, b) => b.count - a.count);

                  const maxHourCount = hourDistribution[0]?.count || 1;

                  // Calculate day distribution
                  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  const dayDistribution = dayOrder
                    .map(day => ({ day, count: dayMap.get(day) || 0 }))
                    .filter(item => item.count > 0);

                  const maxDayCount = Math.max(...dayDistribution.map(d => d.count), 1);

                  // Calculate average duration
                  const avgDuration = durationData.length > 0
                    ? Math.round(durationData.reduce((a, b) => a + b, 0) / durationData.length)
                    : 0;

                  const formatHour = (hour: number) => {
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    return `${displayHour}:00 ${period}`;
                  };

                  return (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Peak Hours</CardTitle>
                            <CardDescription>Call volume by hour of day</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {hourDistribution.slice(0, 8).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium">{formatHour(item.hour)}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium">{item.count} calls</div>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-purple-600 rounded-full"
                                        style={{ width: `${(item.count / maxHourCount) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {dayDistribution.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Day Distribution</CardTitle>
                              <CardDescription>Call volume by day of week</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {dayDistribution.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium">{item.day}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-sm font-medium">{item.count} calls</div>
                                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-indigo-600 rounded-full"
                                          style={{ width: `${(item.count / maxDayCount) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {avgDuration > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Duration Insights</CardTitle>
                            <CardDescription>Call duration statistics</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Average Duration</div>
                                <div className="text-2xl font-bold">{Math.floor(avgDuration / 60)}:{String(avgDuration % 60).padStart(2, '0')}</div>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Shortest Call</div>
                                <div className="text-2xl font-bold">
                                  {Math.floor(Math.min(...durationData) / 60)}:{String(Math.min(...durationData) % 60).padStart(2, '0')}
                                </div>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Longest Call</div>
                                <div className="text-2xl font-bold">
                                  {Math.floor(Math.max(...durationData) / 60)}:{String(Math.max(...durationData) % 60).padStart(2, '0')}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="sources" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Category Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Follow-up Rate</span>
                          <span className="font-medium">{selectedCategory.followUpRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Intent Score</span>
                          <span className="font-medium">{selectedCategory.avgIntentScore}/10</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Calls</span>
                          <span className="font-medium">{selectedCategory.totalCalls}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Duration</span>
                          <span className="font-medium">{formatDuration(selectedCategory.avgDuration)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Category</span>
                          <span className="font-medium">{selectedCategory.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Detailed metrics for each category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((cat, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{cat.category}</h3>
                  <Badge variant="secondary">{cat.totalCalls} calls</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg Duration:</span>
                    <div className="font-medium">{formatDuration(cat.avgDuration)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Intent:</span>
                    <div className="font-medium">{cat.avgIntentScore}/10</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Follow-up Rate:</span>
                    <div className="font-medium">{cat.followUpRate}%</div>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No categories found. Upload some calls to see category analysis.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
