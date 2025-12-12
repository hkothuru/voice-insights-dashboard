'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    Legend
} from 'recharts';
import {
    AlertCircle,
    TrendingUp,
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    PhoneCall
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardOverview() {
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    useEffect(() => {
        async function fetchCalls() {
            try {
                const res = await fetch('/api/calls');
                if (!res.ok) throw new Error('Failed to fetch calls');
                const data = await res.json();
                setCalls(data);
            } catch (error) {
                console.error("Error fetching calls:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCalls();
    }, []);

    // 1. Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        calls.forEach(call => {
            if (call.analysis?.category) {
                cats.add(call.analysis.category);
            }
        });
        return ["All", ...Array.from(cats)].sort();
    }, [calls]);

    // 2. Filter calls based on selection
    const filteredCalls = useMemo(() => {
        if (selectedCategory === "All") return calls;
        return calls.filter(call => call.analysis?.category === selectedCategory);
    }, [calls, selectedCategory]);

    // 3. Compute Aggregates on FILTERED data
    const totalCalls = filteredCalls.length;

    const avgSentiment = totalCalls > 0
        ? (filteredCalls.reduce((acc, call) => acc + (call.analysis?.buyer_intent_score || 0), 0) / totalCalls).toFixed(1)
        : 'N/A';

    const dealStatusCounts = filteredCalls.reduce((acc: any, call) => {
        const status = call.analysis?.deal_status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const dealStatusData = Object.keys(dealStatusCounts).map(status => ({
        name: status,
        value: dealStatusCounts[status]
    }));

    const objectionCounts = filteredCalls.reduce((acc: any, call) => {
        const type = call.analysis?.objection_type || 'None';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const objectionData = Object.keys(objectionCounts).map(type => ({
        name: type,
        count: objectionCounts[type]
    }));

    // Missing Specs Aggregation
    const missingSpecsCounts = filteredCalls.reduce((acc: any, call) => {
        call.analysis?.missing_specs?.forEach((spec: string) => {
            acc[spec] = (acc[spec] || 0) + 1;
        });
        return acc;
    }, {});

    // Top 5 Missing Specs
    const topMissingSpecs = Object.entries(missingSpecsCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([spec, count]) => ({ spec, count }));


    if (loading) return <div className="p-8">Loading dashboard data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-slate-50/50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-600 mt-1">Real-time insights from your buyer-seller conversations.</p>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-600" />
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="w-[180px] border-slate-300">
                            <SelectValue placeholder="Filter by Category" className="text-slate-700" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Total Calls Analyzed</CardTitle>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalCalls}</div>
                        <p className="text-xs text-slate-500">in selected category</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Avg Buyer Intent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{avgSentiment}/10</div>
                        <p className="text-xs text-slate-500">Based on AI scoring</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Actionable Leads</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {filteredCalls.filter(c => (c.analysis?.buyer_intent_score || 0) >= 7).length}
                        </div>
                        <p className="text-xs text-slate-500">High intent (&gt;7 score)</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Missed Opportunities</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {filteredCalls.filter(c => (c.analysis?.deal_status === 'Dropped' || c.analysis?.deal_status === 'Lost')).length}
                        </div>
                        <p className="text-xs text-slate-500">Dropped or Lost deals</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Deal Status Chart */}
                <Card className="col-span-4 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Deal Status Overview</CardTitle>
                        <CardDescription className="text-slate-500">Current status of analyzed conversations</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dealStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Objections */}
                <Card className="col-span-3 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Top Objections</CardTitle>
                        <CardDescription className="text-slate-500">Primary hurdles in closing deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={objectionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {objectionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ color: '#475569' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Category Intelligence & Missing Specs */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Missing Specs Analysis */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Common Missing Specs</CardTitle>
                        <CardDescription className="text-slate-500">Information buyers frequently asked for that was missing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topMissingSpecs.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">No missing specs data available for this category.</div>
                            ) : (
                                topMissingSpecs.map((item: any, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-slate-700">{item.spec}</span>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{item.count} calls</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Price & Deal Insights */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Price Discovery Insights</CardTitle>
                        <CardDescription className="text-slate-500">Key pricing patterns in this category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <h4 className="font-semibold text-sm">Price Negotiation Frequency</h4>
                                </div>
                                <p className="text-2xl font-bold">
                                    {filteredCalls.filter(c => c.analysis?.price_discussion?.final_price && c.analysis.price_discussion?.final_price !== 'Not discussed' && c.analysis.price_discussion?.final_price !== '').length}
                                    <span className="text-sm font-normal text-muted-foreground ml-2">calls involved active price discussion</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Recent Finalized Prices:</label>
                                <div className="flex flex-wrap gap-2">
                                    {filteredCalls
                                        .filter(c => c.analysis?.price_discussion?.final_price)
                                        .slice(0, 5)
                                        .map((c, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {c.analysis?.price_discussion?.final_price}
                                            </Badge>
                                        ))
                                    }
                                    {filteredCalls.filter(c => c.analysis?.price_discussion?.final_price).length === 0 && <span className="text-sm text-muted-foreground">No finalized prices found.</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
