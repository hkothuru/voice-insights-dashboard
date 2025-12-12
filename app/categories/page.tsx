'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  BarChart3,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Phone,
  Globe,
  Building,
  Timer,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Download
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
  Line,
  Area,
  AreaChart
} from 'recharts';
interface CategoryStats {
  categoryName: string;
  categoryId: string;
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  topCities: Array<{ city: string; count: number }>;
  topStates: Array<{ state: string; count: number }>;
  callSourceBreakdown: Record<string, number>;
  customerTypeBreakdown: Record<string, number>;
  avgSellerVintage: number;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  sampleRecords: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryStats[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryStats | null>(null);
  const [categoryToggles, setCategoryToggles] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, overviewRes] = await Promise.all([
          fetch('/api/dataset?type=categories&limit=100'),
          fetch('/api/dataset?type=overview')
        ]);

        if (!categoriesRes.ok || !overviewRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesRes.json();
        const overviewData = await overviewRes.json();

        setCategories(categoriesData);
        setFilteredCategories(categoriesData.slice(0, 50)); // Show top 50 initially

        // Initialize toggles for top categories
        const initialToggles: Record<string, boolean> = {};
        categoriesData.slice(0, 20).forEach((cat: CategoryStats) => {
          initialToggles[`${cat.categoryName}_${cat.categoryId}`] = true;
        });
        setCategoryToggles(initialToggles);

        // Set overall stats
        setOverallStats(overviewData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredCategories(categories.slice(0, 50));
      } else {
        try {
          const response = await fetch(`/api/dataset?type=search&q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const searchResults = await response.json();
            setFilteredCategories(searchResults);
          }
        } catch (error) {
          console.error('Search error:', error);
          setFilteredCategories([]);
        }
      }
    };

    performSearch();
  }, [searchQuery, categories]);

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

  // overallStats is now loaded from API in useEffect

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Category Intelligence Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Deep insights into {overallStats ? overallStats.totalCalls.toLocaleString() : '0'} buyer-seller conversations across {overallStats ? overallStats.totalCategories : '0'} product categories
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-all"
                checked={Object.values(categoryToggles).some(v => v)}
                onCheckedChange={(checked) => {
                  const newToggles: Record<string, boolean> = {};
                  filteredCategories.forEach(cat => {
                    newToggles[`${cat.categoryName}_${cat.categoryId}`] = checked;
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
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{overallStats.totalCalls.toLocaleString()}</div>
              <p className="text-xs text-blue-600">Across all categories</p>
            </CardContent>
          </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{overallStats.totalCategories}</div>
            <p className="text-xs text-green-600">Product categories</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Duration</CardTitle>
            <Timer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatDuration(overallStats.avgDuration)}</div>
            <p className="text-xs text-purple-600">Per conversation</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{(overallStats.uniqueBuyers + overallStats.uniqueSellers).toLocaleString()}</div>
            <p className="text-xs text-orange-600">Buyers + Sellers</p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Category Distribution Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Call Volume</CardTitle>
            <CardDescription>Most active product categories in the dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredCategories.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoryName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} calls`, 'Volume']} />
                <Bar dataKey="totalCalls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Call distribution across Indian states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(
                new Map(
                  filteredCategories
                    .flatMap(cat => cat.topStates)
                    .reduce((acc, state) => {
                      acc.set(state.state, (acc.get(state.state) || 0) + state.count);
                      return acc;
                    }, new Map<string, number>())
                )
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{state}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Array.from(new Map(
                              filteredCategories.flatMap(cat => cat.topStates)
                                .reduce((acc, state) => {
                                  acc.set(state.state, (acc.get(state.state) || 0) + state.count);
                                  return acc;
                                }, new Map<string, number>())
                            ).values()))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Toggle Grid */}
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
            {filteredCategories.map((category) => {
              const categoryKey = `${category.categoryName}_${category.categoryId}`;
              const isVisible = categoryToggles[categoryKey];

              return (
                <div key={categoryKey} className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" title={category.categoryName}>
                        {category.categoryName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {category.totalCalls} calls
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={isVisible || false}
                        onCheckedChange={() => toggleCategoryVisibility(categoryKey)}
                        size="sm"
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
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">{formatDuration(category.averageDuration)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sellers:</span>
                            <div className="font-medium">{category.uniqueSellers}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Buyers:</span>
                            <div className="font-medium">{category.uniqueBuyers}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Seller Age:</span>
                            <div className="font-medium">{category.avgSellerVintage} days</div>
                          </div>
                        </div>

                        {/* Top Cities */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Top Cities</h5>
                          <div className="flex flex-wrap gap-1">
                            {category.topCities.slice(0, 3).map((city, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {city.city} ({city.count})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Time Distribution */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Call Timing</h5>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-medium">{category.timeDistribution.morning}</div>
                              <div className="text-muted-foreground">Morning</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{category.timeDistribution.afternoon}</div>
                              <div className="text-muted-foreground">Afternoon</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{category.timeDistribution.evening}</div>
                              <div className="text-muted-foreground">Evening</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{category.timeDistribution.night}</div>
                              <div className="text-muted-foreground">Night</div>
                            </div>
                          </div>
                        </div>

                        {/* Sample Records */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Sample Conversations</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {category.sampleRecords.slice(0, 2).map((record, idx) => (
                              <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">{record.city_name}, {record.state_name}</span>
                                  <span className="text-muted-foreground">{formatDuration(record.call_duration)}</span>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {record.pns_call_modrefname}
                                </div>
                              </div>
                            ))}
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
                {selectedCategory.categoryName} Deep Analysis
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
                      <div className="text-2xl font-bold">{selectedCategory.uniqueSellers}</div>
                      <div className="text-xs text-muted-foreground">Active sellers</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <div className="text-2xl font-bold">{Math.round(selectedCategory.totalCalls / selectedCategory.uniqueSellers)}</div>
                      <div className="text-xs text-muted-foreground">Calls per seller</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Avg Duration</span>
                      </div>
                      <div className="text-2xl font-bold">{formatDuration(selectedCategory.averageDuration)}</div>
                      <div className="text-xs text-muted-foreground">Conversation length</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="geography" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Cities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={selectedCategory.topCities.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" angle={-45} textAnchor="end" height={60} fontSize={10} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">State Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCategory.topStates.slice(0, 6).map((state, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{state.state}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{
                                    width: `${(state.count / Math.max(...selectedCategory.topStates.map(s => s.count))) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8 text-right">
                                {state.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Call Timing Patterns</CardTitle>
                    <CardDescription>When buyers and sellers connect in this category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={[
                        { time: '6-12 AM', calls: selectedCategory.timeDistribution.morning, label: 'Morning' },
                        { time: '12-6 PM', calls: selectedCategory.timeDistribution.afternoon, label: 'Afternoon' },
                        { time: '6-10 PM', calls: selectedCategory.timeDistribution.evening, label: 'Evening' },
                        { time: '10 PM-6 AM', calls: selectedCategory.timeDistribution.night, label: 'Night' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="calls" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Call Source Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={Object.entries(selectedCategory.callSourceBreakdown).map(([source, count]) => ({
                              name: source,
                              value: count
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {Object.entries(selectedCategory.callSourceBreakdown).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Type Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(selectedCategory.customerTypeBreakdown).map(([type, count], idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium">Type {type}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(selectedCategory.customerTypeBreakdown))) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
