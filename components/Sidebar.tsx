'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Phone, Settings, Activity, Upload, BarChart3, Grid3X3, Target, ChevronDown, ChevronRight, UserX, AlertTriangle, Globe, Clock, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const [insightsExpanded, setInsightsExpanded] = useState(false);

    const mainLinks = [
        { name: 'Overview', href: '/', icon: Home },
        { name: 'Calls Explorer', href: '/calls', icon: Phone },
        { name: 'Upload Call', href: '/upload', icon: Upload },
        { name: 'Category Analysis', href: '/categories', icon: Grid3X3 },
        { name: 'Live Stream', href: '/live', icon: Activity },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const insightLinks = [
        { name: 'Business Insights', href: '/insights', icon: BarChart3 },
        { name: 'Lead Intent Scoring', href: '/insights/intent', icon: UserX },
        { name: 'Objection Mining', href: '/insights/objections', icon: AlertTriangle },
        { name: 'Language Compatibility', href: '/insights/language', icon: Globe },
        { name: 'Responsiveness Audit', href: '/insights/responsiveness', icon: Clock },
        { name: 'Demand Gap Analysis', href: '/insights/demand', icon: Lightbulb },
    ];

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r bg-slate-900 text-white">
            <div className="px-4 py-6">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <span className="font-bold text-xl">V</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">VoiceInsights</span>
                </div>

                <nav className="space-y-1">
                    {/* Main Links */}
                    {mainLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {link.name}
                            </Link>
                        );
                    })}

                    {/* Insights Section */}
                    <div className="pt-4">
                        <button
                            onClick={() => setInsightsExpanded(!insightsExpanded)}
                            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <Target className="h-5 w-5" />
                            Strategic Insights
                            {insightsExpanded ? (
                                <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                                <ChevronRight className="h-4 w-4 ml-auto" />
                            )}
                        </button>

                        {insightsExpanded && (
                            <div className="ml-4 mt-1 space-y-1">
                                {insightLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="truncate">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700" />
                    <div className="text-sm">
                        <p className="font-medium">IndiaMART Admin</p>
                        <p className="text-xs text-slate-500">View Data</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
